import { useState } from 'react';
import { Shield, ShieldAlert, ExternalLink, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateForm from './components/CertificateForm';
import CertificateChain from './components/CertificateChain';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import { Certificate, ValidationIssue } from './types';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Force dark mode
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  const handleSubmit = async (hostname: string, port?: number) => {
    setLoading(true);
    setError(null);
    setCertificates([]);
    setValidationIssues([]); // Changed this line
    
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/certificates'
        : 'http://localhost:3000/api/certificates';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          hostname,
          port: port || 443
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setCertificates(result.chain);
      } else {
        let errorMessage = result.error;
        if (result.details && Array.isArray(result.details)) {
          errorMessage = result.details.map((err: any) => err.msg).join(', ');
        }
        setError(errorMessage || 'Failed to validate certificate');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#111111] to-[#0A0A0A] text-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between flex-col sm:flex-row gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-emerald-400/20 to-emerald-400/10 p-3 rounded-2xl border border-emerald-400/20 shadow-lg shadow-emerald-500/5">
                {error ? (
                  <ShieldAlert className="h-7 w-7 text-rose-400" />
                ) : (
                  <Shield className="h-7 w-7 text-emerald-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">
                    SSL Certificate Checker
                  </h1>
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 shadow-sm shadow-blue-500/10">
                    BETA
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-sm text-gray-400">
                    Validate and inspect SSL certificates for any domain
                  </p>
                  <span className="text-xs text-gray-500">
                    by <a href="https://github.com/bgf0007" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300 transition-colors hover:underline">@bgf0007</a>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <a
                href="https://www.ssllabs.com/ssltest/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 rounded-xl 
                  bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 
                  hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
              >
                <span>SSL Labs</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setShowHelp(prev => !prev)}
                className="p-2.5 text-gray-400 hover:text-gray-300 rounded-xl 
                  bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 
                  hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
                title="Help & Information"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 shadow-xl shadow-black/20">
                <div className="flex items-start space-x-4">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-200">About SSL Certificate Checker</h2>
                    <div className="text-sm text-gray-400 space-y-3">
                      <p>
                        This tool helps you inspect SSL/TLS certificates for any domain. Enter a domain name
                        and optionally specify a port to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-1">
                        <li className="hover:text-gray-300 transition-colors">View the complete certificate chain</li>
                        <li className="hover:text-gray-300 transition-colors">Check certificate validity and expiration</li>
                        <li className="hover:text-gray-300 transition-colors">Inspect detailed certificate information</li>
                        <li className="hover:text-gray-300 transition-colors">Validate the certificate chain integrity</li>
                        <li className="hover:text-gray-300 transition-colors">View raw certificate data in PEM format</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CertificateForm onSubmit={handleSubmit} loading={loading} />
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6 bg-gradient-to-br from-rose-500/10 to-rose-500/5 rounded-xl border border-rose-500/10 text-rose-400 text-sm shadow-lg shadow-rose-500/5"
              >
                <div className="flex items-center space-x-4">
                  <ShieldAlert className="h-6 w-6 flex-shrink-0" />
                  <div className="space-y-1.5">
                    <p className="font-medium text-base">Certificate Check Failed</p>
                    <p className="text-rose-400/80">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {certificates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-12"
              >
                <CertificateChain 
                  certificates={certificates}
                  validationIssues={validationIssues.map(issue => ({
                    certificateIndex: issue.certificateIndex,
                    severity: issue.severity,
                    message: issue.message,
                    type: issue.severity === 'error' ? 'error' : 'warning'
                  }))}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && !error && certificates.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12"
            >
              <motion.div 
                className="inline-flex items-center justify-center p-4 rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/5 mb-5 shadow-lg shadow-black/10"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Shield className="w-8 h-8 text-gray-500" />
              </motion.div>
              <h3 className="text-lg font-medium text-gray-300 mb-3">
                Enter a domain to check its SSL certificates
              </h3>
              <p className="text-sm text-gray-500">
                Example: github.com, google.com, or your own domain
              </p>
            </motion.div>
          )}
        </motion.div>

        <footer className="mt-16 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p> 2024 SSL Certificate Checker</p>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setShowPrivacy(true)}
                className="hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setShowTerms(true)}
                className="hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </button>
              <a href="https://github.com/bgf0007" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">GitHub</a>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}
          {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;