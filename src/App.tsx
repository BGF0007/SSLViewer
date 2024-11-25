import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateForm from './components/CertificateForm';
import CertificateChain from './components/CertificateChain';
import About from './components/About';
import { Analytics } from "@vercel/analytics/react"
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
    <div className="min-h-screen bg-gradient-to-b from-[#0C0B0B] via-[#121212] to-[#0C0C0C] text-gray-100 relative flex flex-col">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-emerald-500/5 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-repeat"></div>
      </div>
      <Analytics/>
      {/* Main content */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full flex flex-col min-h-screen">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between flex-col sm:flex-row gap-8">
              <div className="flex items-center space-x-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="relative group"
                >
                  <div className="relative">
                    {error ? (
                      <ShieldAlert className="h-12 w-12 text-rose-400 drop-shadow-glow-red transition-transform duration-200 group-hover:scale-110" />
                    ) : (
                      <Shield className="h-12 w-12 text-[#25FFBE] drop-shadow-glow-green transition-transform duration-200 group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 animate-pulse-slow opacity-50 blur-md">
                      {error ? (
                        <ShieldAlert className="h-12 w-12 text-rose-400" />
                      ) : (
                        <Shield className="h-12 w-12 text-[#25FFBE]" />
                      )}
                    </div>
                  </div>
                </motion.div>
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <motion.h1 
                      className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-50 via-blue-100 to-emerald-200 tracking-tight"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      SSL Viewer
                    </motion.h1>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 text-xs font-semibold bg-[#57A3FF]/10 text-[#57A3FF] rounded-full border border-[#57A3FF]/20 backdrop-blur-sm shadow-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      BETA
                    </motion.span>
                  </div>
                  <motion.div 
                    className="flex items-center gap-4 flex-wrap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <p className="text-base text-gray-300 font-medium">
                      Validate and inspect SSL certificates instantly
                    </p>
                  </motion.div>
                </div>
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
                  Check SSL Certificate
                </h2>
                <p className="text-sm text-gray-400">
                  Enter a domain name to inspect its SSL certificates and security status
                </p>
              </motion.div>
              
              <div className="bg-black/20 rounded-2xl border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-inner">
                <CertificateForm onSubmit={handleSubmit} loading={loading} />
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {(certificates.length > 0 || error) && (
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