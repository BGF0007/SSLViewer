export interface DistinguishedName {
  CN?: string;
  O?: string;
  C?: string;
  [key: string]: string | undefined;
}

export interface Certificate {
  type: 'Leaf' | 'Intermediate' | 'Root';
  subject: string | DistinguishedName;
  issuer: string | DistinguishedName;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  bits?: number;
  ext_key_usage?: string[];
  fingerprint?: string;
  fingerprint256?: string;
  fingerprint512?: string;
  sans?: string[];
  subjectaltname?: string;
  infoAccess?: {
    'CA Issuers - URI'?: string[];
    'OCSP - URI'?: string[];
  };
  status: string;
  raw: string;
  pemEncoded: string;
}

export interface ValidationIssue {
  certificateIndex: number;
  severity: 'warning' | 'error';
  message: string;
}

export interface ValidateResponse {
  certificates: Certificate[];
  validationIssues: ValidationIssue[];
}