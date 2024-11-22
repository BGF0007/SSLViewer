import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, X, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { Certificate } from '../types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import '../styles/scrollbar.css';

interface RawCertificateDataProps {
  certificate: Certificate;
  onClose: () => void;
}

interface CopyState {
  [key: string]: boolean;
}

const RawCertificateData = ({ certificate, onClose }: RawCertificateDataProps) => {
  const [copySuccess, setCopySuccess] = useState<CopyState>({});
  const [activeTab, setActiveTab] = useState<'details' | 'pem'>('details');
  const [searchQuery, setSearchQuery] = useState('');
  const data = activeTab === 'pem' ? certificate.pemEncoded : certificate.raw;
  const hasValidData = (data?.trim()?.length ?? 0) > 0;

  const handleCopy = async (text: string, section?: string) => {
    if (!text) {
      console.error('No text available to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(prev => ({ ...prev, [section || 'main']: true }));
      setTimeout(() => setCopySuccess(prev => ({ ...prev, [section || 'main']: false })), 2000);
      console.log('Data copied to clipboard');
    } catch (error) {
      console.error('Failed to copy data:', error);
    }
  };

  const handleDownload = () => {
    if (!data) {
      console.error('No certificate data available');
      return;
    }

    try {
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = typeof certificate.subject === 'object' && certificate.subject.CN 
        ? certificate.subject.CN 
        : 'certificate';
      a.download = `${fileName}_${activeTab}.${activeTab === 'pem' ? 'pem' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download certificate data:', error);
    }
  };

  const highlightSearchQuery = (text: string) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() 
        ? <span key={i} className="bg-yellow-500/30 text-white">{part}</span>
        : part
    );
  };

  const renderCertificateSection = (title: string, content: string | undefined, sectionKey: string) => {
    if (!content) return null;
    const shouldShow = !searchQuery || content.toLowerCase().includes(searchQuery.toLowerCase());
    if (!shouldShow) return null;

    return (
      <div className="space-y-4" key={sectionKey}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-400">{title}</h4>
          <motion.button
            onClick={() => handleCopy(content, sectionKey)}
            className="inline-flex items-center px-2.5 py-1.5 text-xs
              text-gray-400 hover:text-gray-300 bg-white/[0.03] hover:bg-white/[0.06]
              rounded-lg border border-white/5 hover:border-white/10
              focus:outline-none focus:ring-1 focus:ring-white/10
              transition-all duration-200"
            title="Copy Section"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {copySuccess[sectionKey] ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </motion.button>
        </div>
        <pre className="text-sm text-gray-300 font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5 whitespace-pre-wrap break-words">
          {highlightSearchQuery(content)}
        </pre>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0A0A0A] rounded-2xl border border-white/5 shadow-2xl 
          max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden relative
          transition-all duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-none px-6 py-4 border-b border-white/5 flex items-center justify-between 
          bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-100">Certificate Details</h3>
            <span className="text-sm text-gray-500 font-medium">
              {(() => {
                if (typeof certificate.subject === 'string') {
                  const cn = certificate.subject.split(',').find(part => part.trim().startsWith('CN='))?.split('=')[1];
                  return cn || 'Unknown Certificate';
                }
                return certificate.subject.CN || 'Unknown Certificate';
              })()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {hasValidData && (
              <>
                <motion.button
                  onClick={() => handleCopy(data, 'main')}
                  className="inline-flex items-center px-4 py-2 text-sm
                    text-gray-300 hover:text-gray-100 bg-white/[0.03] hover:bg-white/[0.06]
                    rounded-xl border border-white/5 hover:border-white/10
                    focus:outline-none focus:ring-1 focus:ring-white/10
                    transition-all duration-200"
                  title="Copy to Clipboard"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copySuccess['main'] ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="ml-2">{copySuccess['main'] ? 'Copied!' : 'Copy All'}</span>
                </motion.button>
                <motion.button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 text-sm
                    text-gray-300 hover:text-gray-100 bg-white/[0.03] hover:bg-white/[0.06]
                    rounded-xl border border-white/5 hover:border-white/10
                    focus:outline-none focus:ring-1 focus:ring-white/10
                    transition-all duration-200"
                  title="Download Certificate"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-4 h-4" />
                  <span className="ml-2">Download</span>
                </motion.button>
              </>
            )}
            <motion.button
              onClick={onClose}
              className="inline-flex items-center justify-center w-10 h-10
                text-gray-400 hover:text-gray-300
                rounded-xl border border-white/5 hover:border-white/10
                focus:outline-none focus:ring-1 focus:ring-white/10
                transition-all duration-200"
              title="Close"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="flex-none px-6 py-3 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <motion.button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${activeTab === 'details' 
                    ? 'bg-white/[0.08] text-white shadow-sm shadow-white/5' 
                    : 'text-gray-400 hover:text-gray-300'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Details
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('pem')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${activeTab === 'pem' 
                    ? 'bg-white/[0.08] text-white shadow-sm shadow-white/5' 
                    : 'text-gray-400 hover:text-gray-300'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                PEM Data
              </motion.button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-64 px-4 py-2 pl-10 text-sm text-gray-300 
                  bg-white/[0.03] border border-white/5 rounded-lg
                  focus:outline-none focus:ring-1 focus:ring-white/10
                  placeholder-gray-500 hover:bg-white/[0.04]"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6 custom-scrollbar">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {renderCertificateSection('Subject', 
                typeof certificate.subject === 'string' 
                  ? certificate.subject 
                  : JSON.stringify(certificate.subject, null, 2),
                'subject'
              )}
              {renderCertificateSection('Issuer', 
                typeof certificate.issuer === 'string'
                  ? certificate.issuer
                  : JSON.stringify(certificate.issuer, null, 2),
                'issuer'
              )}
              {renderCertificateSection('Serial Number', certificate.serialNumber, 'serialNumber')}
              
              <div className="grid grid-cols-2 gap-6">
                {renderCertificateSection('Valid From', 
                  new Date(certificate.validFrom).toLocaleString(),
                  'validFrom'
                )}
                {renderCertificateSection('Valid To',
                  new Date(certificate.validTo).toLocaleString(),
                  'validTo'
                )}
              </div>

              {certificate.sans && renderCertificateSection('Subject Alternative Names',
                certificate.sans.join('\n'),
                'sans'
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-400">PEM Certificate</h4>
              {hasValidData ? (
                <div className="rounded-xl overflow-hidden border border-white/5">
                  <SyntaxHighlighter
                    language="plaintext"
                    style={atomOneDark}
                    customStyle={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '1rem',
                      margin: 0,
                      borderRadius: '0.75rem',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                    wrapLongLines={true}
                  >
                    {data}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-sm text-gray-500 italic p-4 
                  bg-white/[0.02] rounded-xl border border-white/5">
                  <AlertCircle className="w-4 h-4" />
                  <span>No PEM data available for this certificate</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export { RawCertificateData };
export default RawCertificateData;