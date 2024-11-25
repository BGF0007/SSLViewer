import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, AlertCircle, ArrowRight, FileText, Info, Shield, Zap, Database, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BatchCertificateFormProps {
  onSubmit: (domains: Array<{ hostname: string; port?: number }>) => void;
  loading: boolean;
}

const BatchCertificateForm = ({ onSubmit, loading }: BatchCertificateFormProps) => {
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const domains = textInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Split by comma or space, but keep only the first two parts
        const parts = line.split(/[,\s]+/).filter(part => part.length > 0).slice(0, 2);
        const [hostname, port] = parts;
        return {
          hostname: hostname.trim(),
          port: port ? parseInt(port.trim(), 10) : undefined
        };
      })
      .filter(({ hostname }) => hostname && hostname.length > 0);

    if (domains.length === 0) {
      setError('Please enter at least one domain');
      return;
    }

    onSubmit(domains);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    handleFileRead(file);
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const domains = lines
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            const [hostname, port] = line.split(',').map(item => item.trim());
            return {
              hostname,
              port: port ? parseInt(port, 10) : undefined
            };
          })
          .filter(({ hostname }) => hostname && hostname.length > 0);

        if (domains.length === 0) {
          setError('No valid domains found in the CSV file');
          return;
        }

        setTextInput(domains.map(d => `${d.hostname}${d.port ? ` ${d.port}` : ''}`).join('\n'));
      } catch (err) {
        setError('Error parsing CSV file');
      }
    };

    reader.readAsText(file);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    handleFileRead(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-3 bg-rose-500/10 text-rose-400 text-sm rounded-2xl flex items-center gap-2.5 border border-rose-500/20 backdrop-blur-sm shadow-lg"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group space-y-3 p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
                <FileText className="w-4 h-4 text-white/60 group-hover:text-white/80 transition-colors duration-300" />
              </div>
              <label 
                htmlFor="domains" 
                className="text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300"
              >
                Enter Domains
              </label>
            </div>
            <motion.span 
              animate={{ scale: textInput.trim() ? 1 : 0.95, opacity: textInput.trim() ? 1 : 0.7 }}
              className="text-xs text-white/40 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300"
            >
              {textInput.split('\n').filter(line => line.trim()).length} domains
            </motion.span>
          </div>

          <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10 backdrop-blur-sm group-hover:border-white/20 transition-colors duration-300">
            <div className="text-xs text-white/60">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <p className="font-medium">Format Instructions</p>
              </div>
              <div className="font-mono text-[11px] bg-black/20 rounded-xl p-2.5 space-y-1">
                <p>example.com</p>
                <p>example.org 443</p>
                <p>example.net 8443</p>
              </div>
              <p className="mt-2 text-white/40">One domain per line. Port number is optional (defaults to 443).</p>
            </div>
          </div>

          <textarea
            id="domains"
            rows={6}
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              setError(null);
            }}
            placeholder="Enter domains here..."
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl placeholder-white/20 focus:border-white/20 focus:ring-2 focus:ring-white/20 transition-all duration-300 font-mono text-sm resize-none hover:border-white/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group p-5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-2xl' 
              : 'border-white/10 hover:border-white/20 bg-gradient-to-br from-white/[0.03] to-transparent hover:scale-[1.01] hover:shadow-xl'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
            
          <motion.div 
            animate={{ 
              rotate: isDragging ? 180 : 0,
              scale: isDragging ? 1.1 : 1
            }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-xl ${
              isDragging 
                ? 'bg-indigo-500/20' 
                : 'bg-white/5 group-hover:bg-white/10'
            } transition-colors duration-300`}
          >
            <Upload className={`w-6 h-6 ${
              isDragging 
                ? 'text-indigo-400' 
                : 'text-white/60 group-hover:text-white/80'
            } transition-colors duration-300`} />
          </motion.div>

          <div className="text-center space-y-2">
            <h3 className={`text-sm font-medium ${
              isDragging 
                ? 'text-indigo-400' 
                : 'text-white/80 group-hover:text-white'
            } transition-colors duration-300`}>
              Drop CSV file here
            </h3>
            <p className="text-xs text-white/40">or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`px-4 py-2 text-xs font-medium rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                isDragging
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white/80'
              }`}
            >
              Choose File
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center">
            <div className="px-3.5 py-2 bg-black/20 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-white/40" />
                <p className="text-[11px] text-white/40">Supports CSV with optional port numbers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading || !textInput.trim()}
          className="relative group flex-1 px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] rounded-xl font-medium shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="relative z-10">Checking Certificates...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <span className="relative z-10">Check Certificates</span>
            </div>
          )}
        </motion.button>

        <div className="flex gap-1.5 flex-wrap sm:flex-nowrap justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="group flex items-center gap-1.5 bg-gradient-to-br from-emerald-500/[0.03] to-emerald-500/[0.01] px-2.5 py-1 rounded-full border border-emerald-500/10 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all duration-300"
          >
            <Zap className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-[11px] text-emerald-400">Bulk validation</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="group flex items-center gap-1.5 bg-gradient-to-br from-blue-500/[0.03] to-blue-500/[0.01] px-2.5 py-1 rounded-full border border-blue-500/10 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-blue-500/20 transition-all duration-300"
          >
            <Database className="w-3 h-3 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-[11px] text-blue-400">CSV import</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className="group flex items-center gap-1.5 bg-gradient-to-br from-amber-500/[0.03] to-amber-500/[0.01] px-2.5 py-1 rounded-full border border-amber-500/10 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-amber-500/20 transition-all duration-300"
          >
            <Server className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-[11px] text-amber-400">Custom ports</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BatchCertificateForm;
