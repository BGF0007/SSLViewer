export interface Certificate {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  type: 'root' | 'intermediate' | 'leaf';
  status: 'valid' | 'expired' | 'not-yet-valid';
  raw?: string | null;
  pemEncoded?: string | null;
  sans?: string[];
  signatureAlgorithm?: string;
  bits?: number;
  ext_key_usage?: string[];
  fingerprint?: string;
  fingerprint256?: string;
  fingerprint512?: string;
  subjectaltname?: string;
}

export interface CertificateError {
  error: string;
  details?: string;
}

export interface ApiResponse {
  success: boolean;
  chain?: Certificate[];
  error?: string;
  details?: string | string[];
}
