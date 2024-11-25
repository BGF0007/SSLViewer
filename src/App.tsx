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
    document.documentElement.classList.add('dark');
    document.body.className = 'min-h-screen bg-green';
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
    <div className="min-h-screen text-gray-100 relative flex flex-col">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-500/[0.02] via-transparent to-gray-500/[0.02] animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-repeat"></div>
      </div>
      <Analytics/>
      {/* Main content */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex flex-col min-h-screen">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between flex-col sm:flex-row gap-6">
              <div className="flex items-center space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="relative group"
                >
                  <div className="relative">
                    {error ? (
                      <ShieldAlert className="h-10 w-10 text-rose-400/90 drop-shadow-sm transition-transform duration-200 group-hover:scale-110" />
                    ) : (
                      <Shield className="h-10 w-10 text-[#25FFBE]/90 drop-shadow-sm transition-transform duration-200 group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 animate-pulse-slow opacity-40 blur-sm">
                      {error ? (
                        <ShieldAlert className="h-10 w-10 text-rose-400/70" />
                      ) : (
                        <Shield className="h-10 w-10 text-[#25FFBE]/70" />
                      )}
                    </div>
                  </div>
                </motion.div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <motion.h1 
                      className="text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-50/90 via-gray-100/90 to-gray-50/90 tracking-tight"
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
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-sm"
                    >
                      <div className="w-1 h-1 rounded-full bg-red-400"></div>
                      <span className="text-[11px] text-white/40">BETA</span>
                    </motion.div>
                  </div>
                  <motion.p 
                    className="text-sm text-white/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    Inspect SSL certificates with ease
                  </motion.p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsBatchMode(!isBatchMode)}
                  className={`px-3 py-1.5 text-xs rounded-full border backdrop-blur-sm transition-all duration-300 ${
                    isBatchMode
                      ? 'bg-white/[0.03] border-white/10 text-white/60'
                      : 'bg-white/[0.06] border-white/20 text-white/80'
                  }`}
                >
                  Single Check
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsBatchMode(!isBatchMode)}
                  className={`px-3 py-1.5 text-xs rounded-full border backdrop-blur-sm transition-all duration-300 ${
                    !isBatchMode
                      ? 'bg-white/[0.03] border-white/10 text-white/60'
                      : 'bg-white/[0.06] border-white/20 text-white/80'
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
            className="w-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 sm:p-14 shadow-2xl"
          >
            <div className="max-w-2xl mx-auto">
              <motion.div 
                className="mb-8 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <h2 className="text-2xl font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-gray-50 to-gray-300">
                  {isBatchMode ? 'Batch Check SSL Certificates' : 'Check SSL Certificate'}
                </h2>
                <p className="text-sm text-gray-400">
                  {isBatchMode 
                    ? 'Enter multiple domains or upload a CSV file to check multiple certificates at once'
                    : 'Enter a domain name to inspect its SSL certificates and security status'
                  }
                </p>
              </motion.div>
              
              <div className="bg-black/20 rounded-2xl border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-inner">
                {isBatchMode ? (
                  <BatchCertificateForm onSubmit={handleBatchSubmit} loading={loading} />
                ) : (
                  <CertificateForm onSubmit={handleSingleSubmit} loading={loading} />
                )}
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence>
            {((certificates.length > 0 || error) && !isBatchMode) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                {error ? (
                  <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-rose-400">
                      <AlertCircle className="w-5 h-5" />
                      <p>{error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <SSLChecks certificates={certificates} validationIssues={validationIssues} />
                    <CertificateChain certificates={certificates} domain={searchedDomain} />
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
                className="mt-8"
              >
                <BatchResults results={batchResults} />
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