import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TermsOfServiceProps {
  onClose: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0A0A0A] rounded-2xl border border-white/5 shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-none px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-100">Terms of Service</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-300" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-8 text-sm max-w-3xl mx-auto">
            <section className="space-y-3">
              <h3 className="text-base font-medium text-gray-100">Usage</h3>
              <p className="text-gray-400 leading-relaxed">
                This SSL Certificate Checker is provided as-is, free of charge. Use it to validate and inspect 
                SSL certificates. All processing happens in your browser - we don't see or store your certificates.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-medium text-gray-100">Limitations</h3>
              <p className="text-gray-400 leading-relaxed">
                While we strive for accuracy, we cannot guarantee:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>100% uptime</li>
                <li>Perfect accuracy of results</li>
                <li>Compatibility with all certificate types</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-medium text-gray-100">Your Responsibility</h3>
              <p className="text-gray-400 leading-relaxed">
                You are responsible for your use of this tool. Don't use it for anything illegal, 
                and verify important certificates through multiple sources.
              </p>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TermsOfService;
