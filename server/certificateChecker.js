import tls from 'tls';
import forge from 'node-forge';

export async function getCertificateChain(hostname, port = 443) {
  return new Promise((resolve, reject) => {
    const options = {
      host: hostname,
      port: port,
      rejectUnauthorized: false, // We want to check invalid certs too
      servername: hostname, // Add SNI support
      timeout: 5000, // 5 second timeout
      requestCert: true, // Request certificate from server
      agent: false // Don't use keep-alive
    };

    const socket = tls.connect(options, () => {
      try {
        const cert = socket.getPeerCertificate(true);
        
        // Verify we actually got certificate data
        if (!cert || Object.keys(cert).length === 0) {
          socket.end();
          return reject(new Error('No certificate data received'));
        }

        const chain = parseChain(cert);
        socket.end();
        resolve(chain);
      } catch (error) {
        socket.end();
        reject(new Error(`Failed to process certificate: ${error.message}`));
      }
    });

    socket.on('error', (error) => {
      socket.end();
      reject(new Error(`TLS Connection failed: ${error.message}`));
    });

    // Set timeout
    socket.setTimeout(5000, () => {
      socket.end();
      reject(new Error('Connection timed out'));
    });
  });
}

function parseChain(cert) {
  const chain = [];
  let current = cert;
  const processedSerials = new Set(); // Track processed certificates by serial number

  while (current) {
    // Skip if we've already processed this certificate
    if (processedSerials.has(current.serialNumber)) {
      current = current.issuerCertificate;
      continue; // Skip to next certificate without adding duplicate
    }

    // Extract only the necessary certificate information
    const certInfo = {
      type: determineCertType(current),
      subject: formatDN(current.subject),
      issuer: formatDN(current.issuer),
      serialNumber: current.serialNumber,
      validFrom: current.valid_from,
      validTo: current.valid_to,
      signatureAlgorithm: current.sigalg,
      // Only include SANs for leaf certificates
      ...(current.subjectaltname && determineCertType(current) === 'Leaf' ? {
        sans: current.subjectaltname.split(', ').map(san => san.replace('DNS:', ''))
      } : {}),
      status: determineCertStatus(current.valid_from, current.valid_to),
      // Add raw certificate data
      raw: current.raw?.toString('base64') || null,
      pemEncoded: current.raw ? `-----BEGIN CERTIFICATE-----\n${current.raw.toString('base64').match(/.{0,64}/g).join('\n')}-----END CERTIFICATE-----` : null
    };

    chain.push(certInfo);
    processedSerials.add(current.serialNumber);

    // Stop if we've reached a self-signed certificate (root)
    if (current.subject && current.issuer && 
        formatDN(current.subject) === formatDN(current.issuer)) {
      break;
    }

    current = current.issuerCertificate;
  }

  return chain;
}

function determineCertType(cert) {
  // If subject and issuer are the same, it's a root certificate
  if (cert.subject && cert.issuer && 
      formatDN(cert.subject) === formatDN(cert.issuer)) {
    return 'Root';
  }
  // If it has SANs, it's a leaf certificate
  if (cert.subjectaltname) {
    return 'Leaf';
  }
  // Otherwise it's an intermediate
  return 'Intermediate';
}

function formatDN(dn) {
  if (!dn) return '';
  return Object.entries(dn)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
}

function determineCertStatus(validFrom, validTo) {
  const now = new Date();
  const from = new Date(validFrom);
  const to = new Date(validTo);

  if (now < from) return 'Not Yet Valid';
  if (now > to) return 'Expired';
  return 'Valid';
}