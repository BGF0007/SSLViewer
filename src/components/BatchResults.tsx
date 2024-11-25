import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ChevronDown, Clock, CheckCircle2, XCircle, Calendar, Lock, Download, FileText, AlertCircle } from 'lucide-react';
import { Certificate } from '../types';
import CertificateChain from './CertificateChain';
import { generateCSVReport, generateHTMLReport } from '../utils/reportGenerator';
import { getCertificateStatus, getDaysRemainingText } from '../utils/certificateStatus';

interface BatchResult {
  domain: string;
  port: number;
  certificates: Certificate[];
  error?: string;
}

interface BatchResultsProps {
  results: BatchResult[];
}

const BatchResults = ({ results }: BatchResultsProps) => {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  const validDomains = results.filter(result => !result.error);
  const invalidDomains = results.filter(result => result.error);

  const filteredResults = filter === 'all' 
    ? results 
    : filter === 'valid' 
      ? validDomains 
      : invalidDomains;

  const handleExport = (format: 'csv' | 'html') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `ssl-certificate-report-${timestamp}.${format}`;
    const content = format === 'csv' ? generateCSVReport(results) : generateHTMLReport(results);
    
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCertificateStatusDisplay = (certificates: Certificate[]) => {
    if (!certificates.length) return null;
    const status = getCertificateStatus(certificates[0]);
    
    if (status.status === 'expired') {
      return (
        <span className="text-sm text-rose-400/80 flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          Certificate expired
        </span>
      );
    }
    
    if (status.status === 'warning') {
      return (
        <span className="text-sm text-yellow-400/80 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {getDaysRemainingText(status.days)}
        </span>
      );
    }
    
    if (status.status === 'notice') {
      return (
        <span className="text-sm text-blue-400/80 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {getDaysRemainingText(status.days)}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8">
      {/* Export Buttons */}
      <div className="flex justify-end gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('csv')}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 text-sm font-medium text-white/80 hover:text-white transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('html')}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 text-sm font-medium text-white/80 hover:text-white transition-all duration-200"
        >
          <FileText className="w-4 h-4" />
          Export HTML Report
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group hover:scale-[1.02] transition-all duration-300 p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-md shadow-xl hover:shadow-2xl hover:border-white/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
              <Clock className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors duration-300" />
            </div>
            <h3 className="text-base font-medium text-white/80 group-hover:text-white transition-colors duration-300">Total Checked</h3>
          </div>
          <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <p className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent pl-1">
            {results.length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group hover:scale-[1.02] transition-all duration-300 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/[0.05] to-emerald-500/[0.02] border border-emerald-500/20 backdrop-blur-md shadow-xl hover:shadow-2xl hover:border-emerald-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
            </div>
            <h3 className="text-base font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">Valid Certificates</h3>
          </div>
          <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-500/60 bg-clip-text text-transparent pl-1">
            {validDomains.length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group hover:scale-[1.02] transition-all duration-300 p-5 rounded-2xl bg-gradient-to-br from-rose-500/[0.05] to-rose-500/[0.02] border border-rose-500/20 backdrop-blur-md shadow-xl hover:shadow-2xl hover:border-rose-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors duration-300">
              <XCircle className="w-5 h-5 text-rose-400 group-hover:text-rose-300 transition-colors duration-300" />
            </div>
            <h3 className="text-base font-medium text-rose-400 group-hover:text-rose-300 transition-colors duration-300">Invalid Certificates</h3>
          </div>
          <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <p className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-rose-500/60 bg-clip-text text-transparent pl-1">
            {invalidDomains.length}
          </p>
        </motion.div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center justify-center gap-2 p-1 bg-white/5 backdrop-blur-md rounded-2xl w-fit mx-auto">
        {(['all', 'valid', 'invalid'] as const).map((filterType) => (
          <motion.button
            key={filterType}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter(filterType)}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filter === filterType
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            <span className="ml-2 text-xs">
              ({filterType === 'all' 
                ? results.length 
                : filterType === 'valid' 
                  ? validDomains.length 
                  : invalidDomains.length})
            </span>
          </motion.button>
        ))}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {filteredResults.map((result, index) => (
            <motion.div
              key={`${result.domain}:${result.port}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`group rounded-2xl border backdrop-blur-xl shadow-lg overflow-hidden ${
                result.error 
                  ? 'bg-gradient-to-br from-rose-500/[0.02] to-rose-500/[0.01] border-rose-500/10 hover:border-rose-500/20' 
                  : 'bg-gradient-to-br from-emerald-500/[0.02] to-emerald-500/[0.01] border-emerald-500/10 hover:border-emerald-500/20'
              }`}
            >
              <motion.div
                className="p-6 cursor-pointer hover:bg-white/[0.02] transition-colors duration-200"
                onClick={() => setExpandedDomain(
                  expandedDomain === `${result.domain}:${result.port}` 
                    ? null 
                    : `${result.domain}:${result.port}`
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${
                      result.error 
                        ? 'bg-rose-500/5 group-hover:bg-rose-500/10' 
                        : 'bg-emerald-500/5 group-hover:bg-emerald-500/10'
                    } transition-colors duration-200`}>
                      {result.error ? (
                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                      ) : (
                        <Shield className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-white group-hover:text-white/90 transition-colors duration-200">
                          {result.domain}
                        </h3>
                        <span className="text-sm text-white/40">
                          Port {result.port}
                        </span>
                      </div>
                      {result.error ? (
                        <p className="text-sm text-rose-400/80 mt-1 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          {result.error}
                        </p>
                      ) : (
                        getCertificateStatusDisplay(result.certificates)
                      )}
                    </div>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ 
                      rotate: expandedDomain === `${result.domain}:${result.port}` ? 180 : 0,
                      scale: expandedDomain === `${result.domain}:${result.port}` ? 1.1 : 1
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-white/40 group-hover:text-white/60 transition-colors duration-200"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </div>
              </motion.div>

              <AnimatePresence>
                {expandedDomain === `${result.domain}:${result.port}` && !result.error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pt-4 pb-6 border-t border-white/5">
                      <CertificateChain 
                        certificates={result.certificates} 
                        domain={result.domain}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BatchResults;
