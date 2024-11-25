import { Certificate } from '../types';

export interface CertificateStatus {
  status: 'valid' | 'expired' | 'not-yet-valid' | 'warning' | 'notice';
  days: number;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  details?: string[];
}

export const getCertificateStatus = (cert: Certificate): CertificateStatus => {
  const now = new Date();
  const validTo = new Date(cert.validTo);
  const validFrom = new Date(cert.validFrom);
  const daysRemaining = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const details: string[] = [];

  // Check for weak key size
  if (cert.bits && cert.bits < 2048) {
    details.push(`Weak key size (${cert.bits} bits)`);
  }

  // Check for critical extensions
  if (cert.critical_extensions?.length) {
    details.push('Contains critical extensions');
  }

  // Check for algorithm strength
  if (cert.signatureAlgorithm?.toLowerCase().includes('sha1') || 
      cert.signatureAlgorithm?.toLowerCase().includes('md5')) {
    details.push(`Weak signature algorithm (${cert.signatureAlgorithm})`);
  }

  if (now < validFrom) {
    return {
      status: 'not-yet-valid',
      days: daysRemaining,
      color: 'text-yellow-400',
      textColor: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20',
      details: [...details, `Certificate not valid until ${validFrom.toLocaleDateString()}`]
    };
  }
  
  if (now > validTo) {
    return {
      status: 'expired',
      days: daysRemaining,
      color: 'text-red-500',
      textColor: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      details: [...details, `Certificate expired on ${validTo.toLocaleDateString()}`]
    };
  }
  
  if (daysRemaining <= 30) {
    return {
      status: 'warning',
      days: daysRemaining,
      color: 'text-yellow-400',
      textColor: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20',
      details: [...details, `Certificate expires in ${daysRemaining} days`]
    };
  }
  
  if (daysRemaining <= 90) {
    return {
      status: 'notice',
      days: daysRemaining,
      color: 'text-blue-400',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20',
      details: [...details, `Certificate expires in ${daysRemaining} days`]
    };
  }
  
  return {
    status: 'valid',
    days: daysRemaining,
    color: 'text-emerald-400',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
    details
  };
};

export const getDaysRemainingText = (days: number): string => {
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

export const getStatusText = (status: CertificateStatus['status']): string => {
  switch (status) {
    case 'expired':
      return 'Expired';
    case 'not-yet-valid':
      return 'Not Yet Valid';
    case 'warning':
      return 'Expires Soon';
    case 'notice':
      return 'Valid (Watch)';
    default:
      return 'Valid';
  }
};
