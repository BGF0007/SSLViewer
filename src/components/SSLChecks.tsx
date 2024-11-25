import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck, Calendar, Link2, Lock, Shield, AlertTriangle } from 'lucide-react';
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
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-50 to-gray-300">
        Security Checks
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((check, index) => (
          <motion.div
            key={check.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative p-5 rounded-xl border backdrop-blur-sm transition-all duration-200 ${
              check.passed 
                ? check.warning
                  ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
                  : 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                check.passed 
                  ? check.warning
                    ? 'bg-amber-500/10'
                    : 'bg-emerald-500/10'
                  : 'bg-rose-500/10'
              }`}>
                {check.passed ? (
                  check.warning ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-base font-medium mb-1 ${
                  check.passed 
                    ? check.warning
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                    : 'text-rose-400'
                }`}>
                  {check.name}
                </h3>
                <p className="text-sm text-gray-400">{check.details}</p>
                {check.subChecks && check.subChecks.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {check.subChecks.map((subCheck, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{subCheck.name}</span>
                        <span className={`font-medium ${
                          subCheck.passed 
                            ? 'text-gray-200' 
                            : 'text-rose-400'
                        }`}>
                          {subCheck.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SSLChecks;
