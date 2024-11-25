export interface DistinguishedName {
  CN?: string;
  O?: string;
  C?: string;
  [key: string]: string | undefined;
}

export interface PublicKey {
  type: string;
  size: number;
  algorithm?: string;
  exponent?: string;
  modulus?: string;
}

export interface OCSPResponse {
  status: string;
  producedAt?: string;
  thisUpdate?: string;
  nextUpdate?: string;
  revocationReason?: string;
}

export interface TLSConnectionInfo {
  protocol: string;
  cipherSuite: string;
  tlsVersion: string;
  serverName?: string;
  signatureAlgorithm: string;
  publicKey: PublicKey;
  ocspResponse?: OCSPResponse;
  scts?: Array<{
    version: number;
    logId: string;
    timestamp: string;
    signature: string;
  }>;
  verificationResults?: {
    [key: string]: boolean;
  };
  securityLevel?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  supportedProtocols?: string[];
  supportedCiphers?: string[];
  securityIssues?: string[];
}

export interface Certificate {
  type: 'Leaf' | 'Intermediate' | 'Root';
  subject: string | DistinguishedName;
  issuer: string | DistinguishedName;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  bits?: number;
  keyUsage?: string[];
  extendedKeyUsage?: string[];
  fingerprint?: {
    sha1?: string;
    sha256?: string;
    sha512?: string;
  };
  version?: string | number;
  sans?: string[];
  subjectaltname?: string;
  infoAccess?: {
    'CA Issuers - URI'?: string[];
    'OCSP - URI'?: string[];
  };
  status: string;
  raw: string;
  pemEncoded: string;
  connectionInfo?: TLSConnectionInfo;
}

export interface ValidationIssue {
  certificateIndex: number;
  severity: 'warning' | 'error';
  message: string;
}

export interface ValidateResponse {
  success: boolean;
  chain: Certificate[];
  validationIssues: ValidationIssue[];
  error?: string;
  details?: Array<{ msg: string }>;
}