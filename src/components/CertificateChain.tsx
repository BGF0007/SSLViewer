import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Eye, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Certificate } from '../types';
import { RawCertificateData } from './RawCertificateData';

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
}

interface CertificateChainProps {
  certificates: Certificate[];
  validationIssues?: ValidationIssue[];
}

const statusIcons = {
  valid: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
  error: <XCircle className="w-4 h-4 text-rose-500" />,
  expired: <Clock className="w-4 h-4 text-gray-500" />
};

const CertificateChain = ({ certificates, validationIssues = [] }: CertificateChainProps) => {
  const [expandedCerts, setExpandedCerts] = useState<Set<string>>(new Set());
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const toggleCertificate = (serialNumber: string) => {
    const newExpanded = new Set(expandedCerts);
    if (newExpanded.has(serialNumber)) {
      newExpanded.delete(serialNumber);
    } else {
      newExpanded.add(serialNumber);
    }
    setExpandedCerts(newExpanded);
  };

  const getCertificateStatus = (cert: Certificate) => {
    const now = new Date();
    const validTo = new Date(cert.validTo);
    const daysRemaining = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (now > validTo) return { status: 'expired', days: daysRemaining };
    if (daysRemaining <= 30) return { status: 'warning', days: daysRemaining };
    return { status: 'valid', days: daysRemaining };
  };

  const getDaysRemainingText = (days: number) => {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Certificate Chain
        </h2>
        {validationIssues.length === 0 ? (
          <div className="flex items-center text-xs text-emerald-400 bg-emerald-400/5 px-3.5 py-2 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
            Valid Chain
          </div>
        ) : (
          <div className="flex items-center text-xs text-rose-400 bg-rose-400/5 px-3.5 py-2 rounded-xl">
            <XCircle className="w-3.5 h-3.5 mr-2" />
            {validationIssues.length} {validationIssues.length === 1 ? 'issue' : 'issues'}
          </div>
        )}
      </div>

      <div className="w-full">
        {certificates.map((cert, index) => {
          const isExpanded = expandedCerts.has(cert.serialNumber);
          const status = getCertificateStatus(cert);
          const isFirst = index === 0;
          const isLast = index === certificates.length - 1;

          return (
            <motion.div
              key={cert.serialNumber}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full"
            >
              <div className="relative w-full">
                <button
                  onClick={() => toggleCertificate(cert.serialNumber)}
                  className={`w-full text-left px-6 py-5 rounded-xl 
                    ${isFirst ? 'bg-gradient-to-br from-emerald-400/5 via-emerald-400/3 to-transparent' : 
                      isLast ? 'bg-gradient-to-br from-blue-400/5 via-blue-400/3 to-transparent' : 
                      'bg-gradient-to-br from-white/[0.03] via-white/[0.02] to-transparent'} 
                    hover:bg-white/[0.04] border border-white/5 hover:border-white/10 
                    transition-all duration-200 group shadow-lg shadow-black/5`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className={`flex-shrink-0 p-2 rounded-lg 
                        ${isFirst ? 'bg-emerald-400/10 ring-1 ring-emerald-400/20' : 
                          isLast ? 'bg-blue-400/10 ring-1 ring-blue-400/20' : 
                          'bg-white/5 ring-1 ring-white/10'}`}
                      >
                        {statusIcons[status.status as keyof typeof statusIcons]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-sm font-medium text-gray-200 truncate">
                            {typeof cert.subject === 'string' 
                              ? cert.subject.split(',').find(part => part.trim().startsWith('CN='))?.split('=')[1] || 'Unknown CN'
                              : cert.subject.CN || 'Unknown CN'}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${isFirst ? 'bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20' : 
                              isLast ? 'bg-blue-400/10 text-blue-400 ring-1 ring-blue-400/20' : 
                              'bg-white/5 text-gray-400 ring-1 ring-white/10'}`}
                          >
                            {isFirst ? 'Leaf' : isLast ? 'Root' : 'Intermediate'}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center space-x-3 text-xs">
                          <span className="text-gray-500">
                            {(() => {
                              const issuer = typeof cert.issuer === 'string'
                                ? cert.issuer.split(',').reduce((acc, part) => {
                                    const [key, value] = part.split('=').map(s => s.trim());
                                    if (key && value) acc[key] = value;
                                    return acc;
                                  }, {} as Record<string, string>)
                                : cert.issuer;
                              return issuer.O || issuer.CN || 'Unknown Issuer';
                            })()}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className={`${
                            status.status === 'expired' ? 'text-rose-400' :
                            status.status === 'warning' ? 'text-amber-400' :
                            'text-emerald-400'
                          }`}>
                            {getDaysRemainingText(status.days)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center pl-4 space-x-3 flex-shrink-0">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCert(cert);
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-gray-400 hover:text-gray-300" />
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-8"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </motion.div>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 mt-2 rounded-xl bg-white/[0.01] border border-white/5">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-medium text-gray-400 mb-2">Subject</h4>
                            <div className="space-y-1">
                              {(() => {
                                // Parse the DN string into components
                                const parseDN = (dn: string) => {
                                  const components: Record<string, string> = {};
                                  const parts = dn.split(',').map(part => part.trim());
                                  
                                  parts.forEach(part => {
                                    const [key, ...values] = part.split('=');
                                    if (key && values.length > 0) {
                                      components[key.trim()] = values.join('=').trim();
                                    }
                                  });
                                  
                                  return components;
                                };

                                const subjectComponents = typeof cert.subject === 'string' 
                                  ? parseDN(cert.subject)
                                  : cert.subject;

                                return Object.entries(subjectComponents).map(([key, value]) => {
                                  if (!value || value === '') return null;
                                  return (
                                    <div key={key} className="flex items-start space-x-2">
                                      <span className="text-xs text-gray-500 min-w-[2rem]">{key}</span>
                                      <span className="text-xs text-gray-300 break-all">{value}</span>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-400 mb-2">Validity</h4>
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-gray-500">Valid From</div>
                                <div className="text-xs text-gray-300">
                                  {new Date(cert.validFrom).toLocaleDateString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Valid To</div>
                                <div className="text-xs text-gray-300">
                                  {new Date(cert.validTo).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {index < certificates.length - 1 && (
                <div className="flex items-center justify-center h-8">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                  >
                    <motion.div
                      animate={{ 
                        y: [0, 2, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedCert && (
          <RawCertificateData
            certificate={selectedCert}
            onClose={() => setSelectedCert(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export { CertificateChain };
export default CertificateChain;