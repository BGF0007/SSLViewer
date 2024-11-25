import { X, Server, Shield, Code2, Terminal, Link, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
interface AboutProps {
  onClose: () => void;
}

const Section = ({ 
  icon: Icon, 
  title, 
  content 
}: { 
  icon: React.ElementType; 
  title: string; 
  content: React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-white/[0.02] text-neutral-300">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-medium text-neutral-200">{title}</h3>
    </div>
    <div className="text-sm leading-relaxed text-neutral-400 pl-12">
      {content}
    </div>
  </div>
);

const CodeBlock = ({ code }: { code: string }) => {
  return (
    <div className="mt-4 relative font-mono text-sm">
      <pre className="!bg-black/20 !p-4 rounded-lg border border-neutral-800 overflow-x-auto">
        <code className="language-typescript">{code}</code>
      </pre>
    </div>
  );
};

const About = ({ onClose }: AboutProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-2xl w-full bg-[#0C0B0B]/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-emerald-500/5"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-50 to-gray-300"
              >
                About SSL Viewer
              </motion.h2>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <p className="text-gray-300">
                  SSL Viewer is a powerful tool designed to help you inspect and validate SSL certificates for any domain.
                  Our tool provides detailed insights into certificate chains, validation status, and potential security issues.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-medium text-gray-200">Certificate Validation</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Comprehensive validation of SSL certificates including expiration, trust chain, and security features.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Link className="w-5 h-5 text-blue-400" />
                      <h3 className="font-medium text-gray-200">Chain Analysis</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Detailed analysis of the complete certificate chain from leaf to root certificates.
                    </p>
                  </motion.div>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium text-gray-200">Features</h3>
                  <ul className="space-y-3">
                    {[
                      'Real-time certificate validation',
                      'Complete chain visualization',
                      'Security vulnerability checks',
                      'Detailed certificate information',
                      'Modern and intuitive interface'
                    ].map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center gap-2 text-gray-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 text-xs font-semibold bg-[#57A3FF]/10 text-[#57A3FF] rounded-full border border-[#57A3FF]/20"
                    >
                      BETA
                    </motion.div>
                    <span className="text-sm text-gray-500">Version 1.0.0</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                    onClick={onClose}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default About;
