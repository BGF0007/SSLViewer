import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, X, CheckCircle } from 'lucide-react';
import { Certificate } from '../types';

interface RawCertificateDataProps {
  certificate: Certificate;
  onClose: () => void;
}

const RawCertificateData = ({ certificate, onClose }: RawCertificateDataProps) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'pem'>('details');
  const data = activeTab === 'pem' ? certificate.pemEncoded : certificate.raw;
  const hasValidData = (data?.trim()?.length ?? 0) > 0;

  const handleCopy = async () => {
    if (!data) {
      console.error('No certificate data available');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(data);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      console.log('Certificate data copied to clipboard');
    } catch (error) {
      console.error('Failed to copy certificate data:', error);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0A0A0A] rounded-2xl border border-white/5 shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-none px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
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
                  onClick={handleCopy}
                  className="inline-flex items-center px-4 py-2 text-sm
                    text-gray-300 hover:text-gray-100 bg-white/[0.03] hover:bg-white/[0.06]
                    rounded-xl border border-white/5 hover:border-white/10
                    focus:outline-none focus:ring-1 focus:ring-white/10
                    transition-all duration-200"
                  title="Copy to Clipboard"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copySuccess ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="ml-2">{copySuccess ? 'Copied!' : 'Copy'}</span>
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
                text-gray-400 hover:text-gray-100
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

        {/* Tab Navigation */}
        <div className="flex-none px-6 py-2 border-b border-white/5 bg-white/[0.01]">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${activeTab === 'details' 
                  ? 'bg-white/[0.06] text-white' 
                  : 'text-gray-400 hover:text-gray-300'}`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('pem')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${activeTab === 'pem' 
                  ? 'bg-white/[0.06] text-white' 
                  : 'text-gray-400 hover:text-gray-300'}`}
            >
              PEM Data
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400">Subject</h4>
                <pre className="text-sm text-gray-300 font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5 whitespace-pre-wrap break-words">
                  {certificate.subject}
                </pre>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400">Issuer</h4>
                <pre className="text-sm text-gray-300 font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5 whitespace-pre-wrap break-words">
                  {certificate.issuer}
                </pre>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400">Serial Number</h4>
                <pre className="text-sm text-gray-300 font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5 whitespace-pre-wrap break-all">
                  {certificate.serialNumber}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400">Valid From</h4>
                  <pre className="text-sm text-gray-300 font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5 whitespace-pre-wrap break-words">
                    {new Date(certificate.validFrom).toLocaleString()}
                  </pre>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400">Valid To</h4>
                  <pre className="text-sm text-gray-300 font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5 whitespace-pre-wrap break-words">
                    {new Date(certificate.validTo).toLocaleString()}
                  </pre>
                </div>
              </div>

              {certificate.sans && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400">Subject Alternative Names</h4>
                  <pre className="text-sm text-gray-300 font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5 whitespace-pre-wrap break-words">
                    {certificate.sans.join('\n')}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-400">PEM Certificate</h4>
              {hasValidData ? (
                <pre className="text-sm text-gray-300 font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5 whitespace-pre overflow-x-auto">
                  {data}
                </pre>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No PEM data available for this certificate
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