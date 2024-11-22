import { connect } from 'tls';
import { Certificate } from './types.js';

export async function checkCertificate(hostname: string, port: number = 443): Promise<Certificate[]> {
  console.log(`Checking certificate for ${hostname}:${port}`);
  
  return new Promise((resolve, reject) => {
    if (!hostname) {
      return reject(new Error('Hostname is required'));
    }

    const options = {
      host: hostname,
      port: port,
      rejectUnauthorized: false,
      servername: hostname,
      timeout: 5000,
      requestCert: true,
      agent: false
    };

    console.log('Creating TLS connection with options:', JSON.stringify(options));

    let socketClosed = false;
    const socket = connect(options, () => {
      if (socketClosed) return;
      
      try {
        console.log('TLS connection established, retrieving certificate');
        const cert = socket.getPeerCertificate(true);
        
        if (!cert || Object.keys(cert).length === 0) {
          console.error('No certificate data received');
          socket.end();
          socketClosed = true;
          return reject(new Error('No certificate data received'));
        }

        console.log('Certificate received, parsing chain');
        const chain = parseChain(cert);
        socket.end();
        socketClosed = true;
        console.log(`Successfully parsed certificate chain with ${chain.length} certificates`);
        resolve(chain);
      } catch (error) {
        console.error('Error processing certificate:', error);
        if (!socketClosed) {
          socket.end();
          socketClosed = true;
        }
        reject(new Error(`Failed to process certificate: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      if (!socketClosed) {
        socket.end();
        socketClosed = true;
      }
      reject(new Error(`TLS Connection failed: ${error.message}`));
    });

    socket.setTimeout(5000, () => {
      console.error('Connection timed out');
      if (!socketClosed) {
        socket.end();
        socketClosed = true;
      }
      reject(new Error('Connection timed out'));
    });
  });
}

function parseChain(cert: any): Certificate[] {
  const chain: Certificate[] = [];
  let current = cert;
  const processedSerials = new Set<string>();

  while (current) {
    if (processedSerials.has(current.serialNumber)) {
      current = current.issuerCertificate;
      continue;
    }

    const certInfo: Certificate = {
      type: determineCertType(current),
      subject: formatDN(current.subject),
      issuer: formatDN(current.issuer),
      serialNumber: current.serialNumber,
      validFrom: current.valid_from,
      validTo: current.valid_to,
      signatureAlgorithm: current.sigalg,
      ...(current.subjectaltname && determineCertType(current) === 'leaf' ? {
        sans: current.subjectaltname.split(', ').map((san: string) => san.replace('DNS:', ''))
      } : {}),
      status: determineCertStatus(current.valid_from, current.valid_to),
      raw: current.raw?.toString('base64') || null,
      pemEncoded: current.raw ? `-----BEGIN CERTIFICATE-----\n${current.raw.toString('base64').match(/.{0,64}/g)?.join('\n')}-----END CERTIFICATE-----` : null
    };

    chain.push(certInfo);
    processedSerials.add(current.serialNumber);

    if (current.subject && current.issuer && 
        formatDN(current.subject) === formatDN(current.issuer)) {
      break;
    }

    current = current.issuerCertificate;
  }

  return chain;
}

function determineCertType(cert: any): Certificate['type'] {
  if (cert.subject && cert.issuer && 
      formatDN(cert.subject) === formatDN(cert.issuer)) {
    return 'root';
  }
  if (cert.subjectaltname) {
    return 'leaf';
  }
  return 'intermediate';
}

function formatDN(dn: any): string {
  return Object.entries(dn)
    .map(([key, values]: [string, any]) => `${key}=${Array.isArray(values) ? values[0] : values}`)
    .join(', ');
}

function determineCertStatus(validFrom: string, validTo: string): Certificate['status'] {
  const now = new Date();
  const from = new Date(validFrom);
  const to = new Date(validTo);

  if (now < from) return 'not-yet-valid';
  if (now > to) return 'expired';
  return 'valid';
}

