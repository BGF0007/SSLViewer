import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, AlertCircle, Search, Database } from 'lucide-react';

interface BatchCertificateFormProps {
  onSubmit: (domains: Array<{ hostname: string; port?: number }>) => void;
  loading: boolean;
}

const BatchCertificateForm = ({ onSubmit, loading }: BatchCertificateFormProps) => {
  const [hostnames, setHostnames] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [defaultPort, setDefaultPort] = useState<number>(443);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const domains = hostnames
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Split by comma or space, but keep only the first two parts
        const parts = line.split(/[,\s]+/, 2);
        const hostname = parts[0];
        let port: number | undefined = undefined;

        // Check if hostname includes port
        if (hostname.includes(':')) {
          const [host, portStr] = hostname.split(':');
          port = parseInt(portStr);
          return { hostname: host, port };
        }

        // Use port from parts or default port
        if (parts[1]) {
          port = parseInt(parts[1]);
        }

        return {
          hostname,
          port: port || defaultPort
        };
      });

    if (domains.length === 0) {
      setError('Please enter at least one domain');
      return;
    }

    onSubmit(domains);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/[\r\n]+/);
        const domains = lines
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            const [hostname, port] = line.split(',');
            return {
              hostname: hostname.trim(),
              port: port ? parseInt(port.trim()) : defaultPort
            };
          });

        if (domains.length === 0) {
          setError('No valid domains found in the CSV file');
          return;
        }

        setHostnames(domains.map(d => `${d.hostname}${d.port ? `:${d.port}` : ''}`).join('\n'));
      } catch (err) {
        setError('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileRead(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    handleFileRead(file);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-2.5 bg-rose-500/10 text-rose-400/90 text-sm rounded-xl flex items-center gap-2.5 border border-rose-500/10 backdrop-blur-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <div className="relative group">
              <div className="absolute inset-2 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <textarea
                value={hostnames}
                onChange={(e) => {
                  setHostnames(e.target.value);
                  setError(null);
                }}
                placeholder="Enter domains (one per line)&#10;example.com&#10;example.org:8443&#10;example.net,443"
                className="w-full h-48 px-6 py-4 bg-white/[0.02] border border-white/10 focus:border-white/20 rounded-xl outline-none transition-all duration-200 placeholder-gray-500 text-gray-200 backdrop-blur-sm resize-none focus:ring-2 focus:ring-white/5 shadow-lg shadow-black/10 relative z-10 font-mono text-sm"
              />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.01] via-white/5 to-white/[0.01]" />
              <span className="text-xs text-gray-500">Batch SSL Certificate Inspection</span>
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.01] via-white/5 to-white/[0.01]" />
            </div>
          </div>
          
          <div className="sm:w-48 space-y-4">
            <div className="relative">
              <input
                type="number"
                value={defaultPort}
                onChange={(e) => setDefaultPort(parseInt(e.target.value))}
                placeholder="Default Port (443)"
                className="w-full px-6 py-4 bg-white/[0.02] border border-white/10 focus:border-white/20 rounded-xl outline-none transition-all duration-200 placeholder-gray-500 text-gray-200 backdrop-blur-sm focus:ring-2 focus:ring-white/5 shadow-lg shadow-black/10"
              />
            </div>

            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-4 flex flex-col items-center gap-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all duration-200 text-gray-400 hover:text-gray-300 backdrop-blur-sm shadow-lg shadow-black/10"
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs">Upload CSV</span>
              </motion.button>
            </div>
          </div>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading || !hostnames.trim()}
          className={`group w-full px-8 py-4 flex items-center justify-center gap-3 rounded-xl font-medium transition-all duration-200 ${
            loading || !hostnames.trim()
              ? 'bg-white/[0.02] text-gray-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/20 text-gray-100 border border-white/10 hover:border-white/20 backdrop-blur-sm shadow-lg shadow-black/10'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Check Certificates</span>
              <Search className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
            </>
          )}
        </motion.button>

        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-white/[0.02] px-3 py-2 rounded-full border border-white/5 shadow-lg shadow-black/10"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
            <span className="text-xs text-gray-400">Bulk Processing</span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-white/[0.02] px-3 py-2 rounded-full border border-white/5 shadow-lg shadow-black/10"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20"></div>
            <span className="text-xs text-gray-400">CSV Support</span>
          </motion.div>
        </div>
      </div>
    </form>
  );
};

export default BatchCertificateForm;
