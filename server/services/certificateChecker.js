import tls from 'tls';
import { Buffer } from 'buffer';

// Lightweight certificate type determination
function determineCertType(cert) {
  if (!cert?.subject || !cert?.issuer) return 'Unknown';
  
  // Check if it's a root certificate (self-signed)
  const isRoot = Object.entries(cert.subject).every(([key, value]) => 
    cert.issuer[key] === value
  );
  
  if (isRoot) return 'Root';
  
  // Check if it's a leaf certificate
  if (cert.subjectaltname || cert.ext_key_usage?.includes('serverAuth')) {
    return 'Leaf';
  }
  
  // Otherwise, it's an intermediate
  return 'Intermediate';
}

// Format Distinguished Name (DN) string
function formatDN(dn) {
  if (!dn) return '';
  return Object.entries(dn)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
}

// Process raw certificate data efficiently
function processRawCert(rawData) {
  if (!rawData) return null;
  
  try {
    const base64Cert = rawData.toString('base64')
      .match(/.{1,64}/g)
      .join('\n');
    
    return [
      '-----BEGIN CERTIFICATE-----',
      base64Cert,
      '-----END CERTIFICATE-----'
    ].join('\n');
  } catch (error) {
    console.warn('Error processing raw certificate:', error.message);
    return null;
  }
}

// Extract essential certificate info
function extractCertInfo(cert) {
  if (!cert) return null;
  
  try {
    // Parse subject alternative names
    const sans = cert.subjectaltname 
      ? cert.subjectaltname.split(',').map(san => san.trim().replace(/^DNS:/, ''))
      : [];

    return {
      type: determineCertType(cert),
      subject: cert.subject ? formatDN(cert.subject) : '',
      issuer: cert.issuer ? formatDN(cert.issuer) : '',
      serialNumber: cert.serialNumber || cert.fingerprint.replace(/:/g, ''),
      validFrom: cert.valid_from,
      validTo: cert.valid_to,
      signatureAlgorithm: cert.sigalg || '',
      sans,
      status: validateDates(cert),
      rawPEM: processRawCert(cert.raw)
    };
  } catch (error) {
    console.error('Error extracting certificate info:', error);
    return null;
  }
}

// Helper function to check if subject matches issuer
function isSubjectMatchIssuer(subject, issuer) {
  if (!subject || !issuer) return false;
  
  // Check all fields in subject against issuer
  const fields = ['C', 'ST', 'L', 'O', 'OU', 'CN'];
  return fields.every(field => {
    if (!subject[field] && !issuer[field]) return true;
    return subject[field] === issuer[field];
  });
}

// Helper function to create properly typed validation issues
function createValidationIssue(message, isError = false) {
  const severity = isError ? 'error' : 'warning';
  return {
    type: severity,
    message,
    severity
  };
}

// Validate hostname against certificate
function validateHostname(hostname, cert) {
  if (!cert?.subject && !cert?.subjectaltname) {
    return createValidationIssue('Certificate missing subject information', true);
  }

  // Parse subject alternative names
  const sans = cert.subjectaltname
    ? cert.subjectaltname
        .split(', ')
        .filter(san => san.startsWith('DNS:'))
        .map(san => san.slice(4))
    : [];

  // Get all possible names from SANs and CN
  const names = [...sans];
  if (cert.subject?.CN) names.push(cert.subject.CN);

  console.log('Validating hostname:', hostname);
  console.log('Against names:', names);

  if (names.length === 0) {
    return createValidationIssue('Certificate has limited hostname information');
  }

  // Helper function to match hostname against pattern
  const matchHostname = (pattern, host) => {
    if (pattern === host) return true;
    
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(2);
      const hostParts = host.split('.');
      const suffixParts = suffix.split('.');
      
      // For *.domain.com, host must have at least as many parts as the suffix
      if (hostParts.length < suffixParts.length) return false;
      
      // Check if the non-wildcard parts match
      const hostSuffix = hostParts.slice(-(suffixParts.length)).join('.');
      return hostSuffix === suffix;
    }
    
    return false;
  };

  // Check for matches
  const isValid = names.some(name => matchHostname(name, hostname));

  if (!isValid) {
    return createValidationIssue(`Hostname "${hostname}" doesn't match certificate names: ${names.join(', ')}`, true);
  }
  return null;
}

// Validate certificate dates
function validateDates(cert) {
  const now = new Date();
  const validFrom = new Date(cert.valid_from);
  const validTo = new Date(cert.valid_to);
  const issues = [];

  if (now < validFrom) {
    issues.push(createValidationIssue(`Certificate not yet valid. Valid from: ${validFrom.toLocaleDateString()}`, true));
  }

  if (now > validTo) {
    issues.push(createValidationIssue(`Certificate expired on: ${validTo.toLocaleDateString()}`, true));
  } else if ((validTo - now) < 30 * 24 * 60 * 60 * 1000) { // 30 days
    issues.push(createValidationIssue(`Certificate expires soon: ${validTo.toLocaleDateString()}`));
  }

  return issues;
}

// Validate certificate chain
function validateChain(chain, hostname) {
  const issues = [];
  console.log('Validating chain:', chain.map(c => ({ 
    type: c.type, 
    subject: c.subjectDN,
    issuer: c.issuerDN 
  })));

  // Check chain length
  if (chain.length === 0) {
    issues.push(createValidationIssue('Empty certificate chain', true));
    return issues;
  }

  // Validate leaf certificate
  const leafCert = chain[0];
  if (leafCert.type !== 'Leaf') {
    issues.push(createValidationIssue('First certificate must be a leaf certificate', true));
  }

  // Validate hostname on leaf certificate
  const hostnameValidation = validateHostname(hostname, leafCert);
  if (hostnameValidation) {
    issues.push(hostnameValidation);
  }

  // Validate chain order and issuer relationships
  for (let i = 0; i < chain.length - 1; i++) {
    const current = chain[i];
    const issuer = chain[i + 1];

    // Validate issuer relationship
    if (!current || !issuer) continue;

    // Check if current certificate's issuer matches next certificate's subject
    if (!isSubjectMatchIssuer(issuer.subject, current.issuer)) {
      console.log('Chain validation failed:', {
        currentSubject: formatDN(current.subject),
        currentIssuer: formatDN(current.issuer),
        nextSubject: formatDN(issuer.subject)
      });
      issues.push(createValidationIssue(`Certificate chain broken: "${formatDN(current.subject)}" not properly signed by "${formatDN(issuer.subject)}"`, true));
    }
  }

  // Validate dates for all certificates
  chain.forEach(cert => {
    const dateIssues = validateDates(cert);
    issues.push(...dateIssues);
  });

  return issues;
}

// Main certificate chain retrieval function
async function getCertificateChain(hostname, port = 443) {
  console.log('Getting certificate chain for:', hostname, 'port:', port);
  
  return new Promise((resolve, reject) => {
    const options = {
      host: hostname,
      port: port,
      rejectUnauthorized: false,
    };

    const socket = tls.connect(options, () => {
      try {
        const cert = socket.getPeerCertificate(true);
        const chain = [];
        let current = cert;

        // Process the certificate chain
        while (current) {
          const certInfo = extractCertInfo(current);
          if (certInfo) {
            chain.push(certInfo);
          }
          
          // Move to next certificate in chain
          current = current.issuerCertificate;
          
          // Break if we've reached a self-signed cert or the end
          if (!current || current === current.issuerCertificate) {
            break;
          }
        }

        socket.end();
        resolve({ chain });
      } catch (error) {
        socket.end();
        reject(new Error(`Failed to process certificate chain: ${error.message}`));
      }
    });

    socket.on('error', (error) => {
      reject(new Error(`TLS Connection failed: ${error.message}`));
    });

    socket.setTimeout(5000, () => {
      socket.end();
      reject(new Error('Connection timed out'));
    });
  });
}

// Validate the entire certificate chain
function validateCertificateChain(chain, hostname) {
  console.log('Validating certificate chain for:', hostname);
  
  const issues = validateChain(chain, hostname);
  
  return {
    chain,
    issues,
    valid: issues.length === 0
  };
}

export { getCertificateChain, validateCertificateChain };