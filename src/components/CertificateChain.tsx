import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ChevronDown,
  Copy,
  Download,
  Shield,
  Lock,
  Fingerprint,
  Key,
  FileKey,
  Layers
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
        if (dateStr.includes('GMT')) {
          return dateStr;
        }
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
        className="relative overflow-visible"
      >
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-white/[0.01] to-white/[0.02] border border-white/10 shadow-lg shadow-black/5">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <motion.button
                onClick={() => setActiveTabs(prev => ({ ...prev, [cert.serialNumber]: 'details' }))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeTab === 'details'
                    ? 'bg-white/10 text-gray-200 shadow-sm shadow-white/5'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                Details
              </motion.button>
              <motion.button
                onClick={() => setActiveTabs(prev => ({ ...prev, [cert.serialNumber]: 'pem' }))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeTab === 'pem'
                    ? 'bg-white/10 text-gray-200 shadow-sm shadow-white/5'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                PEM
              </motion.button>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => handleCopy(activeTab === 'pem' ? cert.pemEncoded || '' : cert.raw || '', cert.serialNumber)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 text-gray-400 hover:text-gray-300 
                  bg-white/5 hover:bg-white/10
                  rounded-lg border border-white/10 hover:border-white/20
                  transition-colors shadow-sm shadow-black/10
                  focus:outline-none focus:ring-1 focus:ring-white/20
                "
              >
                {copySuccess[cert.serialNumber] ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </motion.button>
              <motion.button
                onClick={() => handleDownload(cert, activeTab)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 text-gray-400 hover:text-gray-300 
                  bg-white/5 hover:bg-white/10
                  rounded-lg border border-white/10 hover:border-white/20
                  transition-colors shadow-sm shadow-black/10
                  focus:outline-none focus:ring-1 focus:ring-white/20
                "
              >
                <Download className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="mt-4">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Existing certificate details content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2">Certificate Details</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group">
                          <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Serial Number</div>
                          <div className="text-sm text-gray-300 font-mono truncate mt-0.5" title={cert.serialNumber}>
                            {cert.serialNumber}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group">
                          <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Version</div>
                          <div className="text-sm text-gray-300 mt-0.5">
                            {cert.version || 'v3'}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group">
                          <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Type</div>
                          <div className="text-sm text-gray-300 mt-0.5">
                            {cert.type}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Validity Period */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2">Validity Period</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group">
                          <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Not Before</div>
                          <div className="text-sm text-gray-300 mt-0.5">
                            {formatDate(cert.validFrom)}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group">
                          <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Not After</div>
                          <div className="text-sm text-gray-300 mt-0.5">
                            {formatDate(cert.validTo)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subject Alternative Names */}
                    {cert.sans && cert.sans.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-2">Alternative Names</h4>
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group">
                          <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors mb-1">SANs</div>
                          <div className="text-sm text-gray-300 break-all space-y-1.5">
                            {cert.sans.map((san, index) => (
                              <div key={index} className="font-mono bg-white/[0.02] px-2 py-1 rounded">
                                {san}
                              </div>
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
                      <h4 className="text-xs font-medium text-gray-400 mb-2">Subject</h4>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group space-y-2">
                        {Object.entries(subjectComponents).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{key}</div>
                            <div className="text-sm text-gray-300 font-mono truncate mt-0.5" title={value}>
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Issuer Information */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2">Issuer</h4>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group space-y-2">
                        {Object.entries(issuerComponents).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{key}</div>
                            <div className="text-sm text-gray-300 font-mono truncate mt-0.5" title={value}>
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Info */}
                    {cert.infoAccess && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-2">Additional Info</h4>
                        <div className="space-y-2">
                          {cert.infoAccess['CA Issuers - URI'] && (
                            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group">
                              <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">CA Issuers</div>
                              <div className="text-sm text-gray-300 font-mono truncate mt-0.5" 
                                title={cert.infoAccess['CA Issuers - URI'].join(', ')}>
                                {cert.infoAccess['CA Issuers - URI'].join(', ')}
                              </div>
                            </div>
                          )}
                          {cert.infoAccess['OCSP - URI'] && (
                            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group">
                              <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">OCSP</div>
                              <div className="text-sm text-gray-300 font-mono truncate mt-0.5"
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
              </div>
            )}
            
            {activeTab === 'pem' && (
              <div className="relative">
                <SyntaxHighlighter
                  language="plaintext"
                  style={atomOneDark}
                  customStyle={{
                    background: 'transparent',
                    padding: '1rem',
                    margin: 0,
                    borderRadius: '0.5rem',
                  }}
                >
                  {cert.pemEncoded || ''}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative">
      <div className="w-full space-y-3">
        <AnimatePresence>
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.serialNumber}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative"
            >
              <div className="relative w-full">
                <motion.button
                  onClick={() => toggleCertificate(cert.serialNumber)}
                  onMouseEnter={() => setHoveredCert(cert.serialNumber)}
                  onMouseLeave={() => setHoveredCert(null)}
                  className={`w-full text-left p-4 rounded-xl
                    bg-gradient-to-r from-white/[0.02] to-white/[0.04]
                    hover:from-white/[0.04] hover:to-white/[0.06]
                    border border-white/10 hover:border-white/20
                    transition-all duration-200
                    shadow-lg shadow-black/5
                    ${expandedCerts.includes(cert.serialNumber) ? 'ring-1 ring-white/20' : ''}
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
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full
                          ${index === 0 ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 
                            index === certificates.length - 1 ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20' : 
                            'bg-orange-400/10 text-orange-400 border border-orange-400/20'}`}
                        >
                          {index === 0 ? 'Leaf' : index === certificates.length - 1 ? 'Root' : 'Intermediate'}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400">
                        <span className="font-medium">
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
                        <span className={`font-medium
                          ${getCertificateStatus(cert).status === 'expired' ? 'text-rose-400' :
                            getCertificateStatus(cert).status === 'warning' ? 'text-amber-400' :
                            'text-emerald-400'}`}
                        >
                          {getDaysRemainingText(getCertificateStatus(cert).days)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0
                        ${getCertificateStatus(cert).status === 'expired' ? 'bg-rose-400 shadow-lg shadow-rose-400/30' :
                          getCertificateStatus(cert).status === 'warning' ? 'bg-amber-400 shadow-lg shadow-amber-400/30' :
                          'bg-emerald-400 shadow-lg shadow-emerald-400/30'}`}
                      />
                      <motion.div
                        animate={{ rotate: expandedCerts.includes(cert.serialNumber) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-5 h-5 rounded-full bg-white/5 p-0.5 group-hover:bg-white/10 transition-colors"
                      >
                        <ChevronDown className={`w-4 h-4 ${hoveredCert === cert.serialNumber ? 'text-gray-200' : 'text-gray-400'}`} />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {expandedCerts.includes(cert.serialNumber) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10"
                      style={{ position: 'relative', zIndex: 10 }}
                    >
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-white/[0.01] to-white/[0.02] border border-white/10 shadow-lg shadow-black/5">
                        {renderCertificateDetails(cert)}
                      </div>
                    </motion.div>
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
                      className="bg-white/[0.03] p-2 rounded-full border border-white/10 shadow-lg shadow-black/5"
                    >
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
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