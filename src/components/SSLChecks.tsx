import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck, Calendar, Link2, Lock, Shield } from 'lucide-react';
import { ValidationIssue, Certificate, DistinguishedName } from '../types';

interface SSLChecksProps {
  certificates: Certificate[];
  validationIssues: ValidationIssue[];
}

interface CheckItem {
  name: string;
  icon: any;
  passed: boolean;
  description?: string;
  details?: string;
  warning?: boolean;
  subChecks?: {
    name: string;
    passed: boolean;
    message: string;
  }[];
}

const SSLChecks: React.FC<SSLChecksProps> = ({ certificates, validationIssues }) => {
  const getRemainingDays = (validTo: string) => {
    const now = new Date();
    const expiryDate = new Date(validTo);
    const days = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryStatus = () => {
    if (certificates.length === 0) return { passed: false, message: 'No certificates found' };
    
    const leafCert = certificates[0];
    const days = getRemainingDays(leafCert.validTo);
    
    if (days < 0) return { passed: false, message: 'Certificate has expired' };
    if (days <= 30) return { passed: true, warning: true, message: `Expires in ${days} days` };
    return { passed: true, message: `Valid for ${days} days` };
  };

  const getSubjectCN = (cert: Certificate) => {
    if (!cert.subject) return 'Not Available';
    if (typeof cert.subject === 'string') {
      const match = cert.subject.match(/CN=([^,]+)/);
      return match ? match[1] : 'Not Available';
    }
    return (cert.subject as DistinguishedName).CN || 'Not Available';
  };

  const getIssuerOrg = (cert: Certificate) => {
    if (!cert.issuer) return 'Not Available';
    if (typeof cert.issuer === 'string') {
      const match = cert.issuer.match(/O=([^,]+)/);
      return match ? match[1] : 'Not Available';
    }
    return (cert.issuer as DistinguishedName).O || 'Not Available';
  };

  const checks: CheckItem[] = [
    {
      name: 'Certificate Chain',
      icon: Shield,
      passed: certificates.length > 0 && validationIssues.filter(i => i.severity === 'error').length === 0,
      description: 'Valid certificate chain found',
      details: certificates.length > 0 
        ? `Complete chain with ${certificates.length} certificates`
        : 'No certificate chain found',
      subChecks: certificates.length > 0 ? [
        {
          name: 'Root Certificate',
          passed: certificates.length >= 2,
          message: certificates.length >= 2 ? 'Present' : 'Missing'
        },
        {
          name: 'Intermediate Certificates',
          passed: certificates.length >= 2,
          message: certificates.length >= 2 
            ? `${certificates.length - 2} intermediate(s)`
            : 'Missing'
        }
      ] : []
    },
    {
      name: 'Certificate Validity',
      icon: Calendar,
      ...getExpiryStatus(),
      details: certificates.length > 0 
        ? `Valid from ${new Date(certificates[0].validFrom).toLocaleDateString()} to ${new Date(certificates[0].validTo).toLocaleDateString()}`
        : 'No certificate information',
      subChecks: certificates.length > 0 ? [
        {
          name: 'Not Before',
          passed: new Date(certificates[0].validFrom) <= new Date(),
          message: new Date(certificates[0].validFrom).toLocaleDateString()
        },
        {
          name: 'Not After',
          passed: getRemainingDays(certificates[0].validTo) > 0,
          message: new Date(certificates[0].validTo).toLocaleDateString()
        }
      ] : []
    },
    {
      name: 'Domain Validation',
      icon: Link2,
      passed: certificates.length > 0 && !validationIssues.some(issue => 
        issue.message.toLowerCase().includes('domain') || 
        issue.message.toLowerCase().includes('hostname')
      ),
      description: 'Certificate matches the domain',
      details: certificates.length > 0 
        ? `Issued to ${getSubjectCN(certificates[0])}`
        : 'No domain information',
      subChecks: certificates.length > 0 ? [
        {
          name: 'Common Name',
          passed: true,
          message: getSubjectCN(certificates[0])
        },
        {
          name: 'Issuer',
          passed: true,
          message: getIssuerOrg(certificates[0])
        }
      ] : []
    },
    {
      name: 'Security Features',
      icon: Lock,
      passed: true,
      description: 'Certificate security details',
      details: certificates.length > 0 
        ? `${certificates[0].bits ? `${certificates[0].bits}-bit` : 'Standard'} SSL Certificate`
        : 'No security information',
      subChecks: certificates.length > 0 ? [
        {
          name: 'Key Length',
          passed: true,
          message: certificates[0].bits ? `${certificates[0].bits} bits` : 'Not Available'
        },
        {
          name: 'Extensions',
          passed: true,
          message: certificates[0].ext_key_usage ? 
            certificates[0].ext_key_usage.join(', ') : 
            'Standard Usage'
        }
      ] : []
    }
  ];

  if (certificates.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <div className="p-6 rounded-xl bg-white/[0.02] border border-neutral-800">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-5 w-5 text-emerald-400/80" />
          <h2 className="text-lg font-semibold text-gray-200">SSL Health Check</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {checks.map((check) => (
            <div
              key={check.name}
              className="p-5 rounded-lg bg-white/[0.02] border border-neutral-800 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  check.passed 
                    ? check.warning
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-emerald-400/10 text-emerald-400/80'
                    : 'bg-rose-500/10 text-rose-500'
                }`}>
                  <check.icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-200">{check.name}</h3>
                    {check.passed ? (
                      check.warning ? (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400/80" />
                      )
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-500" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">{check.details}</p>
                  
                  {check.subChecks && check.subChecks.length > 0 && (
                    <div className="space-y-2 border-t border-neutral-800/50 pt-3">
                      {check.subChecks.map((subCheck, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{subCheck.name}</span>
                          <span className={`font-medium ${
                            subCheck.passed 
                              ? 'text-gray-200' 
                              : 'text-rose-500'
                          }`}>
                            {subCheck.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SSLChecks;
