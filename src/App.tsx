import { useState, useEffect } from 'react';
import { Shield, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateForm from './components/CertificateForm';
import CertificateChain from './components/CertificateChain';
import About from './components/About';
import SSLChecks from './components/SSLChecks';
import { Certificate, ValidationIssue } from './types';

const App = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showAbout, setShowAbout] = useState(false);
  const [searchedDomain, setSearchedDomain] = useState<string>('');

  const handleSubmit = async (hostname: string, port?: number) => {
    setLoading(true);
    setError(null);
    setCertificates([]);
    setValidationIssues([]);
    setSearchedDomain(hostname);

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
    <div className="min-h-screen bg-gradient-to-b from-[#0C0B0B] to-[#0C0C0C] text-gray-100 relative flex flex-col">
      {/* Fixed position background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
      </div>

      {/* Scrollable content container */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex flex-col min-h-screen">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between flex-col sm:flex-row gap-6">
              <div className="flex items-center space-x-5">
                <div className="relative">
                  <div className="relative">
                    {error ? (
                      <ShieldAlert className="h-10 w-10 text-rose-400 drop-shadow-glow-red" />
                    ) : (
                      <Shield className="h-10 w-10 text-[#25FFBE] drop-shadow-glow-green" />
                    )}
                    <div className="absolute inset-0 animate-pulse-slow opacity-50 blur-sm">
                      {error ? (
                        <ShieldAlert className="h-10 w-10 text-rose-400" />
                      ) : (
                        <Shield className="h-10 w-10 text-[#25FFBE]" />
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-50 via-blue-100 to-gray-300 tracking-tight">
                      SSL Viewer
                    </h1>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-[#57A3FF]/10 text-[#57A3FF] rounded-full border border-[#57A3FF]/20 backdrop-blur-sm">
                      BETA
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <p className="text-sm text-gray-400 font-medium">
                      Validate and inspect SSL certificates instantly
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showAbout && <About onClose={() => setShowAbout(false)} />}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full backdrop-blur-md bg-white/[0.02] rounded-xl border border-white/10 p-8 shadow-2xl"
          >
            <div className="max-w-2xl mx-auto">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-emerald-100">
                  Check SSL Certificate
                </h2>
                <p className="text-sm text-gray-400">
                  Enter a domain name to inspect its SSL certificates and security status
                </p>
              </div>
              
              <div className="bg-black/10 rounded-xl border border-white/10 p-6">
                <CertificateForm onSubmit={handleSubmit} loading={loading} />
                
                <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>Certificate Validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Chain Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Security Checks</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-8 text-center"
              >
                <div className="inline-block p-3 bg-white/[0.02] rounded-lg backdrop-blur-sm border border-white/10">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                </div>
                <p className="mt-4 text-gray-400">Analyzing SSL certificates...</p>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg backdrop-blur-sm"
              >
                <p className="text-rose-300">{error}</p>
              </motion.div>
            )}

            {certificates.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-8 space-y-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-400">
                    Results for <span className="text-white font-medium">{searchedDomain}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCertificates([]);
                      setValidationIssues([]);
                      setError(null);
                      setSearchedDomain('');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-300 rounded-xl 
                      bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 
                      hover:border-white/10 transition-colors duration-200"
                  >
                    <Shield className="w-4 h-4" />
                    Check another domain
                  </button>
                </div>

                <div className="space-y-6">
                  <SSLChecks 
                    certificates={certificates}
                    validationIssues={validationIssues} 
                  />
                  <CertificateChain 
                    certificates={certificates} 
                    domain={searchedDomain}
                    validationIssues={validationIssues}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="mt-auto pt-8 border-t border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <p> 2024 SSL Viewer</p>
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => setShowAbout(true)}
                  className="hover:text-gray-300"
                >
                  About
                </button>
                <a href="https://github.com/bgf0007" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">GitHub</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;