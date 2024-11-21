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
  signatureAlgorithm?: string;
  sans?: string[];
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