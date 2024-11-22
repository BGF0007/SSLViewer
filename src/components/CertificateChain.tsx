import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ChevronDown,
  Copy,
  Download,
} from 'lucide-react';
import { Certificate, ValidationIssue } from '../types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import '../styles/scrollbar.css';
import { RawCertificateData } from './RawCertificateData';

interface CertificateChainProps {
  certificates: Certificate[];
  domain?: string;
  validationIssues?: ValidationIssue[];
}

const CertificateChain = ({ certificates, domain, validationIssues = [] }: CertificateChainProps) => {
  const [expandedCerts, setExpandedCerts] = useState<string[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [hoveredCert, setHoveredCert] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<{ [key: string]: 'details' | 'pem' }>({});
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    console.log('Certificates received:', certificates.map(cert => ({
      serialNumber: cert.serialNumber,
      allProperties: Object.keys(cert)
    })));
  }, [certificates]);

  const toggleCertificate = (serialNumber: string) => {
    const newExpanded = [...expandedCerts];
    if (newExpanded.includes(serialNumber)) {
      newExpanded.splice(newExpanded.indexOf(serialNumber), 1);
    } else {
      newExpanded.push(serialNumber);
    }
    setExpandedCerts(newExpanded);
  };

  const handleCopy = async (text: string, section: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(prev => ({ ...prev, [section]: true }));
      setTimeout(() => setCopySuccess(prev => ({ ...prev, [section]: false })), 2000);
    } catch (error) {
      console.error('Failed to copy data:', error);
    }
  };

  const handleDownload = (certificate: Certificate, type: 'details' | 'pem') => {
    const data = type === 'pem' ? certificate.pemEncoded : certificate.raw;
    if (!data) return;

    try {
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = typeof certificate.subject === 'object' && certificate.subject.CN 
        ? certificate.subject.CN 
        : 'certificate';
      a.download = `${fileName}_${type}.${type === 'pem' ? 'pem' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download certificate data:', error);
    }
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

  const parseDN = (dn: string) => {
    if (typeof dn !== 'string') return {};
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

  const renderCertificateDetails = (cert: Certificate) => {
    const activeTab = activeTabs[cert.serialNumber] || 'details';
    const subjectComponents = typeof cert.subject === 'string' ? parseDN(cert.subject) : cert.subject || {};
    const issuerComponents = typeof cert.issuer === 'string' ? parseDN(cert.issuer) : cert.issuer || {};

    const formatDate = (dateStr: string) => {
      try {
        // Handle GMT format
        if (dateStr.includes('GMT')) {
          return dateStr;
        }
        // Handle ISO format
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return dateStr;
        }
        return date.toLocaleString();
      } catch {
        return dateStr;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="mt-4 p-4 bg-white/[0.02] rounded-xl border border-neutral-800">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTabs(prev => ({ ...prev, [cert.serialNumber]: 'details' }))}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  activeTab === 'details'
                    ? 'bg-neutral-800 text-neutral-200'
                    : 'text-neutral-400 hover:text-neutral-300 hover:bg-white/[0.02]'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTabs(prev => ({ ...prev, [cert.serialNumber]: 'pem' }))}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  activeTab === 'pem'
                    ? 'bg-neutral-800 text-neutral-200'
                    : 'text-neutral-400 hover:text-neutral-300 hover:bg-white/[0.02]'
                }`}
              >
                PEM
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => handleCopy(activeTab === 'pem' ? cert.pemEncoded || '' : cert.raw || '', cert.serialNumber)}
                className="p-1.5 text-neutral-400 hover:text-neutral-300 bg-white/[0.02] hover:bg-neutral-800
                  rounded-lg border border-neutral-700 hover:border-neutral-600
                  focus:outline-none focus:ring-1 focus:ring-neutral-700
                "
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {copySuccess[cert.serialNumber] ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </motion.button>
              <motion.button
                onClick={() => handleDownload(cert, activeTab)}
                className="p-1.5 text-neutral-400 hover:text-neutral-300 bg-white/[0.02] hover:bg-neutral-800
                  rounded-lg border border-neutral-700 hover:border-neutral-600
                  focus:outline-none focus:ring-1 focus:ring-neutral-700
                "
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Certificate Content */}
          <div className="relative">
            {activeTab === 'details' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div>
                    <h4 className="text-xs font-medium text-neutral-400 mb-2">Certificate Details</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2 p-2 rounded-lg bg-white/[0.02] border border-neutral-700">
                        <div className="text-xs text-neutral-500">Serial Number</div>
                        <div className="text-sm text-neutral-300 font-mono truncate" title={cert.serialNumber}>
                          {cert.serialNumber}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-700">
                        <div className="text-xs text-neutral-500">Version</div>
                        <div className="text-sm text-neutral-300">
                          {cert.version || 'v3'}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-700">
                        <div className="text-xs text-neutral-500">Type</div>
                        <div className="text-sm text-neutral-300">
                          {cert.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validity Period */}
                  <div>
                    <h4 className="text-xs font-medium text-neutral-400 mb-2">Validity Period</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-700">
                        <div className="text-xs text-neutral-500">Not Before</div>
                        <div className="text-sm text-neutral-300">
                          {formatDate(cert.validFrom)}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-700">
                        <div className="text-xs text-neutral-500">Not After</div>
                        <div className="text-sm text-neutral-300">
                          {formatDate(cert.validTo)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subject Alternative Names */}
                  {cert.sans && cert.sans.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-neutral-400 mb-2">Alternative Names</h4>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-700">
                        <div className="text-xs text-neutral-500 mb-1">SANs</div>
                        <div className="text-sm text-neutral-300 break-all space-y-1">
                          {cert.sans.map((san, index) => (
                            <div key={index} className="font-mono">{san}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Subject Information */}
                  <div>
                    <h4 className="text-xs font-medium text-neutral-400 mb-2">Subject</h4>
                    <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-700 space-y-2">
                      {Object.entries(subjectComponents).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs text-neutral-500">{key}</div>
                          <div className="text-sm text-neutral-300 font-mono truncate" title={value}>
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Issuer Information */}
                  <div>
                    <h4 className="text-xs font-medium text-neutral-400 mb-2">Issuer</h4>
                    <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-700 space-y-2">
                      {Object.entries(issuerComponents).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs text-neutral-500">{key}</div>
                          <div className="text-sm text-neutral-300 font-mono truncate" title={value}>
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Info */}
                  {cert.infoAccess && (
                    <div>
                      <h4 className="text-xs font-medium text-neutral-400 mb-2">Additional Info</h4>
                      <div className="space-y-2">
                        {cert.infoAccess['CA Issuers - URI'] && (
                          <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-700">
                            <div className="text-xs text-neutral-500">CA Issuers</div>
                            <div className="text-sm text-neutral-300 font-mono truncate" 
                              title={cert.infoAccess['CA Issuers - URI'].join(', ')}>
                              {cert.infoAccess['CA Issuers - URI'].join(', ')}
                            </div>
                          </div>
                        )}
                        {cert.infoAccess['OCSP - URI'] && (
                          <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-700">
                            <div className="text-xs text-neutral-500">OCSP</div>
                            <div className="text-sm text-neutral-300 font-mono truncate"
                              title={cert.infoAccess['OCSP - URI'].join(', ')}>
                              {cert.infoAccess['OCSP - URI'].join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative overflow-auto max-h-[500px] custom-scrollbar">
                <SyntaxHighlighter
                  language="plaintext"
                  style={atomOneDark}
                  customStyle={{
                    background: 'transparent',
                    padding: '1rem',
                    margin: 0,
                    fontSize: '0.875rem',
                  }}
                >
                  {cert.pemEncoded || 'No PEM data available'}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with validation status */}
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
          <button
            onClick={() => setExpandedCerts(certificates.map(c => c.serialNumber))}
            className="flex items-center text-xs text-rose-400 bg-rose-400/5 px-3.5 py-2 rounded-xl hover:bg-rose-400/10"
          >
            <XCircle className="w-3.5 h-3.5 mr-2" />
            {validationIssues.length} {validationIssues.length === 1 ? 'issue' : 'issues'} - Click to expand all
          </button>
        )}
      </div>

      {/* Validation issues summary */}
      {validationIssues.length > 0 && (
        <div className="px-6 py-4 bg-rose-400/5 border border-rose-400/20 rounded-xl space-y-2">
          {validationIssues.map((issue, index) => (
            <div key={index} className="flex items-start space-x-3">
              {issue.severity === 'error' ? (
                <XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm text-gray-300">{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Certificate chain */}
      <div className="w-full space-y-3">
        <AnimatePresence initial={false}>
          {certificates.map((cert, index) => {
            const isFirst = index === 0;
            const isLast = index === certificates.length - 1;
            const isExpanded = expandedCerts.includes(cert.serialNumber);
            const isHovered = hoveredCert === cert.serialNumber;
            const status = getCertificateStatus(cert);

            return (
              <motion.div
                key={cert.serialNumber}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.15,
                  ease: "easeOut",
                  delay: index * 0.05,
                  opacity: { duration: 0.1 }
                }}
                style={{
                  willChange: "transform",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden"
                }}
                className="w-full"
              >
                <div className="relative w-full">
                  <button
                    onClick={() => toggleCertificate(cert.serialNumber)}
                    onMouseEnter={() => setHoveredCert(cert.serialNumber)}
                    onMouseLeave={() => setHoveredCert(null)}
                    className={`w-full text-left p-4 rounded-lg
                      bg-white/[0.02] hover:bg-white/[0.04]
                      border border-white/5 hover:border-white/10
                    `}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-medium text-gray-200">
                            {typeof cert.subject === 'string' 
                              ? cert.subject.split(',').find(part => part.trim().startsWith('CN='))?.split('=')[1] || 'Unknown CN'
                              : cert.subject.CN || 'Unknown CN'}
                          </h3>
                          <span className={`text-xs font-medium
                            ${isFirst ? 'text-emerald-400' : 
                              isLast ? 'text-blue-400' : 
                              'text-orange-400'}`}
                          >
                            {isFirst ? 'Leaf' : isLast ? 'Root' : 'Intermediate'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                          <span>
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
                          <span className="inline-block w-1 h-1 rounded-full bg-gray-600" />
                          <span className={`
                            ${status.status === 'expired' ? 'text-rose-400' :
                              status.status === 'warning' ? 'text-amber-400' :
                              'text-emerald-400'}`}
                          >
                            {getDaysRemainingText(status.days)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0
                          ${status.status === 'expired' ? 'bg-rose-400' :
                            status.status === 'warning' ? 'bg-amber-400' :
                            'bg-emerald-400'}`}
                        />
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className={`w-4 h-4 ${isHovered ? 'text-gray-300' : 'text-gray-500'}`} />
                        </motion.div>
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      renderCertificateDetails(cert)
                    )}
                  </AnimatePresence>
                </div>

                {index < certificates.length - 1 && (
                  <div className="flex items-center justify-center h-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                      }}
                    >
                      <motion.div
                        animate={{ 
                          y: [0, 4, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="bg-white/[0.02] p-2 rounded-full border border-white/5"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Raw certificate data modal */}
      {selectedCert && (
        <RawCertificateData
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};

export { CertificateChain };
export default CertificateChain;