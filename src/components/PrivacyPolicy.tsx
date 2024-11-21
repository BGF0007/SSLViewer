import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
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
            <h3 className="text-lg font-medium text-gray-100">Privacy Policy</h3>
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
              <h3 className="text-base font-medium text-gray-100">Privacy First</h3>
              <p className="text-gray-400 leading-relaxed">
                This SSL Certificate Checker operates entirely in your browser. We do not collect, store, 
                or transmit your certificates or any other sensitive data. All certificate processing 
                happens locally on your device.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-medium text-gray-100">Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                We use basic analytics to understand how the app is used and to fix bugs. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>Page views</li>
                <li>Error rates</li>
                <li>Browser type</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-medium text-gray-100">Contact</h3>
              <p className="text-gray-400 leading-relaxed">
                Questions about privacy? Contact us on GitHub.
              </p>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PrivacyPolicy;
