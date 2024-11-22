import React, { useState, useEffect } from 'react';
import { Loader2, Globe, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        hostname: isValidHostname(hostname),
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

  const isValidHostname = (host: string) => {
    if (!host) return false;
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return hostnameRegex.test(host);
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
    ? 'Please enter a valid domain name (e.g., example.com)'
    : '';
  
  const portError = touched.port && port && !validState.port
    ? 'Port must be between 1 and 65535'
    : '';

  const getInputIcon = (field: 'hostname' | 'port') => {
    if (!touched[field] || isTyping) return null;
    if (field === 'hostname' && !hostname) return null;
    if (field === 'port' && !port) return null;

    return validState[field] ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-500/70" />
    ) : (
      <AlertCircle className="h-4 w-4 text-rose-500/70" />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative group">
            <input
              type="text"
              value={hostname}
              onChange={handleHostnameChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setTouched({ ...touched, hostname: true })}
              placeholder="Enter domain name (e.g., example.com)"
              className={`
                w-full pl-10 pr-24 py-3 bg-white/[0.03] rounded-2xl
                border ${hostnameError ? 'border-rose-500/20' : 'border-white/5'}
                text-gray-100 placeholder-gray-600
                focus:outline-none focus:ring-1 
                ${hostnameError 
                  ? 'focus:ring-rose-500/10 focus:border-rose-500/20' 
                  : 'focus:ring-white/10 focus:border-white/10'}
                hover:bg-white/[0.04]
                transition-all duration-200
              `}
            />
            <Globe className="h-4 w-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            
            <AnimatePresence mode="wait">
              {hostnameError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2"
                >
                  <div className="px-3 py-1.5 bg-rose-500/10 text-rose-400/90 text-xs rounded-lg flex items-center gap-1.5 border border-rose-500/10">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {hostnameError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key="port-input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative mr-2"
                >
                  <input
                    type="text"
                    value={port}
                    onChange={handlePortChange}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setTouched({ ...touched, port: true })}
                    placeholder="443"
                    className={`
                      w-16 px-2 py-1.5 bg-white/[0.04] rounded-lg text-sm
                      border ${portError ? 'border-rose-500/20' : 'border-white/5'}
                      text-gray-300 placeholder-gray-600 text-center
                      focus:outline-none focus:ring-1 
                      ${portError 
                        ? 'focus:ring-rose-500/10 focus:border-rose-500/20' 
                        : 'focus:ring-white/10 focus:border-white/10'}
                      hover:bg-white/[0.06]
                      transition-all duration-200
                    `}
                  />
                  {portError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 whitespace-nowrap"
                    >
                      <div className="px-3 py-1.5 bg-rose-500/10 text-rose-400/90 text-xs rounded-lg flex items-center gap-1.5 border border-rose-500/10">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {portError}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading || !hostname || !validState.hostname || !validState.port}
                className={`
                  p-2.5 rounded-xl
                  flex items-center justify-center
                  transition-all duration-300
                  ${loading || !hostname || !validState.hostname || !validState.port
                    ? 'bg-white/[0.02] text-gray-600 cursor-not-allowed'
                    : 'bg-[#28F8BA]/10 text-[#28F8BA] hover:bg-[#28F8BA]/20 hover:scale-105 border border-[#28F8BA]/20'}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, rotate: 0 }}
                      animate={{ opacity: 1, rotate: 360 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="arrow"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CertificateForm;