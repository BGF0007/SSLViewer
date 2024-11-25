import React, { useState, useEffect } from 'react';
import { Globe, AlertCircle, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import '../styles/transitions.css';

interface CertificateFormProps {
  onSubmit: (hostname: string, port?: number) => void;
  loading: boolean;
}

const CertificateForm: React.FC<CertificateFormProps> = ({ onSubmit, loading }) => {
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState('');
  const [touched, setTouched] = useState({ hostname: false, port: false });
  const [isTyping, setIsTyping] = useState(false);
  const [validState, setValidState] = useState({ hostname: false, port: true });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
      setValidState({
        hostname: validateHostname(hostname) === "",
        port: isValidPort(port)
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [hostname, port]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && hostname && validState.hostname && validState.port) {
      onSubmit(hostname, port ? parseInt(port, 10) : undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && hostname && validState.hostname && validState.port) {
      e.preventDefault();
      onSubmit(hostname, port ? parseInt(port, 10) : undefined);
    }
  };

  const validateHostname = (value: string) => {
    if (!value) {
      return "Please enter a domain name";
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(value)) {
      return "Please enter a valid domain name";
    }
    return "";
  };

  const isValidPort = (p: string) => {
    if (!p) return true;
    const portNum = parseInt(p, 10);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  };

  const handleHostnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHostname(e.target.value);
    setIsTyping(true);
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 65535)) {
      setPort(value);
      setIsTyping(true);
    }
  };

  const hostnameError = touched.hostname && hostname && !validState.hostname
    ? validateHostname(hostname)
    : '';
  
  const portError = touched.port && port && !validState.port
    ? 'Port must be between 1 and 65535'
    : '';

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="max-w-xl mx-auto space-y-4">
        <AnimatePresence>
          {(hostnameError || portError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {hostnameError && (
                <div className="px-4 py-2.5 bg-rose-500/10 text-rose-400/90 text-sm rounded-xl flex items-center gap-2.5 border border-rose-500/10 backdrop-blur-sm">
                  <AlertCircle className="w-4 h-4" />
                  {hostnameError}
                </div>
              )}
              {portError && (
                <div className="px-4 py-2.5 bg-rose-500/10 text-rose-400/90 text-sm rounded-xl flex items-center gap-2.5 border border-rose-500/10 backdrop-blur-sm">
                  <AlertCircle className="w-4 h-4" />
                  {portError}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-hover:text-gray-300" />
              <input
                type="text"
                value={hostname}
                onChange={handleHostnameChange}
                onBlur={() => setTouched({ ...touched, hostname: true })}
                onKeyDown={handleKeyDown}
                placeholder="Enter domain name (e.g., example.com)"
                className={`w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border ${
                  touched.hostname && !validState.hostname
                    ? 'border-rose-500/50 focus:border-rose-500'
                    : touched.hostname && validState.hostname
                    ? 'border-emerald-500/50 focus:border-emerald-500'
                    : 'border-white/10 focus:border-white/20'
                } rounded-xl outline-none transition-all duration-200 placeholder-gray-500 text-gray-200 backdrop-blur-sm
                focus:ring-2 ${
                  touched.hostname && !validState.hostname
                    ? 'focus:ring-rose-500/10'
                    : touched.hostname && validState.hostname
                    ? 'focus:ring-emerald-500/10'
                    : 'focus:ring-white/5'
                }`}
              />
            </div>
          </div>

          <div className="w-full sm:w-32">
            <input
              type="text"
              value={port}
              onChange={handlePortChange}
              onBlur={() => setTouched({ ...touched, port: true })}
              onKeyDown={handleKeyDown}
              placeholder="Port"
              className={`w-full px-4 py-3.5 bg-white/[0.03] border ${
                touched.port && !validState.port
                  ? 'border-rose-500/50 focus:border-rose-500'
                  : touched.port && validState.port && port
                  ? 'border-emerald-500/50 focus:border-emerald-500'
                  : 'border-white/10 focus:border-white/20'
              } rounded-xl outline-none transition-all duration-200 placeholder-gray-500 text-gray-200 backdrop-blur-sm
              focus:ring-2 ${
                touched.port && !validState.port
                  ? 'focus:ring-rose-500/10'
                  : touched.port && validState.port && port
                  ? 'focus:ring-emerald-500/10'
                  : 'focus:ring-white/5'
              }`}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading || !hostname || !validState.hostname || !validState.port}
          className={`group w-full mt-4 px-6 py-3.5 flex items-center justify-center gap-3 rounded-xl font-medium transition-all duration-200 ${
            loading || !hostname || !validState.hostname || !validState.port
              ? 'bg-gray-400/10 text-gray-500 cursor-not-allowed'
              : 'bg-white/[0.03] hover:bg-white/[0.06] text-gray-100 border border-white/10 hover:border-white/20 backdrop-blur-sm'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Check Certificate</span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
            </>
          )}
        </motion.button>

        <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs text-gray-400">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-white/[0.03] px-3 py-2 rounded-full border border-white/5"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
            <span>Certificate Validation</span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-white/[0.03] px-3 py-2 rounded-full border border-white/5"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20"></div>
            <span>Chain Verification</span>
          </motion.div>
        </div>
      </div>
    </form>
  );
};

export default CertificateForm;