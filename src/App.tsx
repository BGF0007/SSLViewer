import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, AlertCircle, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateForm from './components/CertificateForm';
import BatchCertificateForm from './components/BatchCertificateForm';
import CertificateChain from './components/CertificateChain';
import BatchResults from './components/BatchResults';
import About from './components/About';
import { Analytics } from "@vercel/analytics/react"
import SSLChecks from './components/SSLChecks';
import { Certificate, ValidationIssue } from './types';

interface BatchResult {
  domain: string;
  port: number;
  certificates: Certificate[];
  error?: string;
}

const App = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.classList.add('dark');
    document.body.className = 'min-h-screen bg-[#0A0A0A]';
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showAbout, setShowAbout] = useState(false);
  const [searchedDomain, setSearchedDomain] = useState<string>('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);

  const handleSingleSubmit = async (hostname: string, port?: number) => {
    setLoading(true);
    setError(null);
    setCertificates([]);
    setValidationIssues([]);
    setSearchedDomain(hostname);
    setBatchResults([]);

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

  const handleBatchSubmit = async (domains: Array<{ hostname: string; port?: number }>) => {
    setLoading(true);
    setError(null);
    setCertificates([]);
    setValidationIssues([]);
    setBatchResults([]);

    const results: BatchResult[] = [];
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? '/api/certificates'
      : 'http://localhost:3000/api/certificates';

    for (const { hostname, port } of domains) {
      try {
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
          results.push({
            domain: hostname,
            port: port || 443,
            certificates: [],
            error: `HTTP error! status: ${response.status}`
          });
          continue;
        }

        const result = await response.json();

        if (result.success) {
          results.push({
            domain: hostname,
            port: port || 443,
            certificates: result.chain
          });
        } else {
          let errorMessage = result.error;
          if (result.details && Array.isArray(result.details)) {
            errorMessage = result.details.map((err: any) => err.msg).join(', ');
          }
          results.push({
            domain: hostname,
            port: port || 443,
            certificates: [],
            error: errorMessage || 'Failed to validate certificate'
          });
        }
      } catch (err) {
        results.push({
          domain: hostname,
          port: port || 443,
          certificates: [],
          error: err instanceof Error ? err.message : 'An error occurred while fetching certificate'
        });
      }
    }

    setBatchResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative text-white pt-8">
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-[#0A0A0A]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative">
        <div className="container mx-auto p-6 sm:p-8 max-w-[1920px]">
          <div className="flex justify-between items-center mb-16">
            <div className="relative flex-1">
              <div className="max-w-5xl mx-auto w-full flex flex-col min-h-screen">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-16"
                >
                  <div className="flex items-center justify-between flex-col sm:flex-row gap-8">
                    <div className="flex items-center space-x-6">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="relative group"
                      >
                        <div className="relative">
                          {error ? (
                            <div className="relative">
                              <ShieldAlert className="h-12 w-12 text-rose-400/90 drop-shadow-lg transition-transform duration-200 group-hover:scale-110" />
                              <div className="absolute inset-0 animate-pulse-slow opacity-50 blur-md">
                                <ShieldAlert className="h-12 w-12 text-rose-400/70" />
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <Shield className="h-12 w-12 text-[#25FFBE]/90 drop-shadow-lg transition-transform duration-200 group-hover:scale-110" />
                              <div className="absolute inset-0 animate-pulse-slow opacity-50 blur-md">
                                <Shield className="h-12 w-12 text-[#25FFBE]/70" />
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-4 mb-3">
                          <motion.h1 
                            className="text-4xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                          >
                            SSL Viewer
                          </motion.h1>
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-sm shadow-lg shadow-black/20"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#25FFBE] animate-pulse shadow-lg shadow-[#25FFBE]/20"></div>
                            <span className="text-[11px] font-medium text-white/50 tracking-wide">BETA</span>
                          </motion.div>
                        </div>
                        <motion.p 
                          className="text-sm text-white/50"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          Inspect SSL certificates with ease
                        </motion.p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/[0.02] p-1 rounded-full border border-white/5 backdrop-blur-sm">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsBatchMode(!isBatchMode)}
                        className={`px-4 py-2 text-xs rounded-full transition-all duration-300 ${
                          !isBatchMode
                            ? 'bg-white/10 text-white shadow-lg shadow-black/10 border border-white/10'
                            : 'text-white/60 hover:text-white/80'
                        }`}
                      >
                        Single Check
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsBatchMode(!isBatchMode)}
                        className={`px-4 py-2 text-xs rounded-full transition-all duration-300 ${
                          isBatchMode
                            ? 'bg-white/10 text-white shadow-lg shadow-black/10 border border-white/10'
                            : 'text-white/60 hover:text-white/80'
                        }`}
                      >
                        Batch Check
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {showAbout && <About onClose={() => setShowAbout(false)} />}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl p-8 sm:p-12 shadow-2xl"
                >
                  <motion.div 
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <h2 className="text-2xl font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                      {isBatchMode ? 'Batch Check SSL Certificates' : 'Check SSL Certificate'}
                    </h2>
                    <p className="text-sm text-white/40">
                      {isBatchMode 
                        ? 'Enter multiple domains or upload a CSV file to check multiple certificates at once'
                        : 'Enter a domain name to inspect its SSL certificates and security status'
                      }
                    </p>
                  </motion.div>
                  
                  <div className="bg-black/40 rounded-2xl border border-white/10 p-8 sm:p-12 backdrop-blur-xl shadow-inner">
                    {isBatchMode ? (
                      <BatchCertificateForm onSubmit={handleBatchSubmit} loading={loading} />
                    ) : (
                      <CertificateForm onSubmit={handleSingleSubmit} loading={loading} />
                    )}
                  </div>
                </motion.div>

                {/* Results Section */}
                <div className="relative z-10">
                  <AnimatePresence>
                    {((certificates.length > 0 || error) && !isBatchMode) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="mt-12"
                      >
                        {error ? (
                          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-sm">
                            <div className="flex items-center gap-3 text-rose-400">
                              <AlertCircle className="w-5 h-5" />
                              {error}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-8">
                            <SSLChecks certificates={certificates} validationIssues={validationIssues} />
                            <div className="relative">
                              <CertificateChain certificates={certificates} domain={searchedDomain} />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {batchResults.length > 0 && isBatchMode && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="mt-12"
                      >
                        <BatchResults results={batchResults} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <footer className="mt-auto pt-12 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
                    <p> 2024 SSL Viewer</p>
                    <div className="flex items-center space-x-6">
                      <button 
                        onClick={() => setShowAbout(true)}
                        className="hover:text-white/60 transition-colors"
                      >
                        About
                      </button>
                      <a 
                        href="https://github.com/bgf0007" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-white/60 transition-colors"
                      >
                        GitHub
                      </a>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;