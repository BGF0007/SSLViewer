import React, { useState, useEffect } from 'react';
import { Globe, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
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
      <div className="max-w-xl mx-auto space-y-4">
        {/* Error messages */}
        {(hostnameError || portError) && (
          <div>
            {hostnameError && (
              <div className="fade-enter fade-enter-active">
                <div className="px-3 py-1.5 bg-rose-500/10 text-rose-400/90 text-xs rounded-lg flex items-center gap-1.5 border border-rose-500/10">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {hostnameError}
                </div>
              </div>
            )}
            {portError && (
              <div className="fade-enter fade-enter-active mt-2">
                <div className="px-3 py-1.5 bg-rose-500/10 text-rose-400/90 text-xs rounded-lg flex items-center gap-1.5 border border-rose-500/10">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {portError}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <Globe className="h-4 w-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={hostname}
            onChange={handleHostnameChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setTouched({ ...touched, hostname: true })}
            placeholder="Enter domain name"
            className={`
              w-full pl-10 pr-24 py-3 bg-white/[0.03] rounded-2xl
              border border-white/5 text-gray-300 placeholder-gray-600
              focus:outline-none focus:ring-1 
              ${hostnameError 
                ? 'focus:ring-rose-500/10 focus:border-rose-500/20' 
                : 'focus:ring-white/10 focus:border-white/10'}
              hover:bg-white/[0.04]
            `}
          />
          <div className="absolute right-0 top-0 h-full flex items-center">
            <div className="flex items-center mr-3 space-x-2">
              <span className="text-gray-500 text-sm">:</span>
              <input
                type="text"
                value={port}
                onChange={handlePortChange}
                onKeyDown={handleKeyDown}
                onBlur={() => setTouched({ ...touched, port: true })}
                placeholder="443"
                className={`
                  w-14 py-1 px-1 bg-transparent
                  border-b border-white/10 text-gray-300 placeholder-gray-600 text-center
                  focus:outline-none
                  ${portError 
                    ? 'border-rose-500/20' 
                    : 'focus:border-white/20'}
                `}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !hostname || !validState.hostname || !validState.port}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-3 
            rounded-2xl text-sm font-medium
            ${loading || !hostname || !validState.hostname || !validState.port
              ? 'bg-white/[0.02] text-gray-600 cursor-not-allowed'
              : 'bg-[#28F8BA]/10 text-[#28F8BA] hover:bg-[#28F8BA]/20 border border-[#28F8BA]/20'}
            transition-colors duration-200
          `}
        >
          <span>Check Certificate</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default CertificateForm;