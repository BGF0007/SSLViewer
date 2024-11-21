import React, { useState, useEffect } from 'react';
import { Loader2, Globe, Hash, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    // Match server-side validation
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return hostnameRegex.test(host);
  };

  const isValidPort = (p: string) => {
    if (!p) return true; // Empty port is valid (will use default)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex-1 space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400 pl-1">Domain Name</label>
              {hostnameError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {hostnameError}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <div className="relative group flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-4 w-4 text-gray-500 group-focus-within:text-gray-400 transition-colors" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {getInputIcon('hostname')}
                </div>
                <input
                  type="text"
                  value={hostname}
                  onChange={handleHostnameChange}
                  onBlur={() => setTouched(t => ({ ...t, hostname: true }))}
                  onKeyDown={handleKeyDown}
                  placeholder="example.com"
                  spellCheck={false}
                  required
                  aria-label="Domain name"
                  className={`w-full h-11 pl-10 pr-10 bg-white/[0.03] text-gray-100 
                    placeholder-gray-600 rounded-xl border ${hostnameError ? 'border-rose-500/50' : 'border-white/5'}
                    focus:outline-none focus:ring-1 ${hostnameError ? 'focus:ring-rose-500/50' : 'focus:ring-white/10'}
                    hover:border-white/10 transition-all duration-150
                    group-hover:bg-white/[0.04]`}
                />
                <div className={`absolute -bottom-4 left-0 right-0 h-0.5 scale-x-0 bg-white/10
                  group-focus-within:scale-x-100 transition-transform duration-300 origin-left
                  ${hostnameError ? '!bg-rose-500/20' : ''}`} />
              </div>

              <button
                type="submit"
                disabled={loading || !hostname || !validState.hostname || !validState.port}
                className="h-11 px-5 bg-white/[0.03] hover:bg-white/[0.06] 
                  disabled:opacity-50 disabled:hover:bg-white/[0.03] disabled:cursor-not-allowed
                  text-sm font-medium text-gray-300 rounded-xl border border-white/5
                  hover:border-white/10 focus:outline-none focus:ring-1 focus:ring-white/10
                  transition-all duration-200 ease-out flex items-center justify-center gap-2
                  disabled:text-gray-500 shrink-0 min-w-[120px] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Check</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-48 space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400 pl-1">Port <span className="text-gray-600">(optional)</span></label>
              {portError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {portError}
                </p>
              )}
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-4 w-4 text-gray-500 group-focus-within:text-gray-400 transition-colors" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {getInputIcon('port')}
              </div>
              <input
                type="number"
                value={port}
                onChange={handlePortChange}
                onBlur={() => setTouched(t => ({ ...t, port: true }))}
                onKeyDown={handleKeyDown}
                placeholder="443"
                min="1"
                max="65535"
                aria-label="Port number"
                className={`w-full h-11 pl-10 pr-10 bg-white/[0.03] text-gray-100 
                  placeholder-gray-600 rounded-xl border ${portError ? 'border-rose-500/50' : 'border-white/5'}
                  focus:outline-none focus:ring-1 ${portError ? 'focus:ring-rose-500/50' : 'focus:ring-white/10'}
                  hover:border-white/10 transition-all duration-150
                  group-hover:bg-white/[0.04]
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
              <div className={`absolute -bottom-4 left-0 right-0 h-0.5 scale-x-0 bg-white/10
                group-focus-within:scale-x-100 transition-transform duration-300 origin-left
                ${portError ? '!bg-rose-500/20' : ''}`} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CertificateForm;