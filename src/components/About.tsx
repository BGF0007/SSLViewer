import { X, Server, Shield, Code2, GitBranch, Terminal, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Prism from 'prismjs';
import { useEffect, useState } from 'react';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';

interface AboutProps {
  onClose: () => void;
}

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="!bg-neutral-900/50 rounded-lg !p-4 border border-neutral-800 !m-0">
        <button
          onClick={copyToClipboard}
          className="absolute top-3 right-3 p-2 rounded-md bg-neutral-800/50 
                   opacity-0 group-hover:opacity-100 transition-opacity
                   hover:bg-neutral-700/50"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-neutral-400" />
          )}
        </button>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

const ProcessCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800 hover:border-neutral-700 
                 transition-colors cursor-default"
    >
      <h3 className="font-medium text-neutral-200 mb-1">{title}</h3>
      <p className="text-sm text-neutral-400">{description}</p>
    </motion.div>
  );
};

const TechStack = ({ title, items }: { title: string; items: string[] }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800 hover:border-neutral-700 
                 transition-colors"
    >
      <h3 className="font-medium text-neutral-200 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-sm text-neutral-400 flex items-center space-x-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

const Section = ({ icon, title, content }: { icon: React.ReactNode; title: string; content: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-neutral-900/50 border border-neutral-800">
          {icon}
        </div>
        <h2 className="text-lg font-medium text-neutral-200">{title}</h2>
      </div>
      {content}
    </motion.div>
  );
};

const About = ({ onClose }: AboutProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0F1014] border border-neutral-800 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden
                  shadow-xl shadow-black/20 flex flex-col"
      >
        {/* Sticky header */}
        <div className="flex items-start justify-between p-6 bg-[#0F1014] border-b border-neutral-800 sticky top-0 z-10">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-semibold text-neutral-100"
          >
            About SSLViewer.com
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-neutral-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400 hover:text-neutral-300" />
          </motion.button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* How It Works Section */}
            <Section
              icon={<Server className="w-5 h-5 text-blue-400" />}
              title="How It Works"
              content={
                <div className="space-y-4">
                  <p className="text-neutral-400 leading-relaxed">
                    SSLViewer.com provides comprehensive SSL/TLS certificate analysis.
                    Our tool establishes a secure connection to the server, retrieves the complete certificate
                    chain, and validates each certificate according to X.509 standards.
                  </p>
                  <CodeBlock
                    language="typescript"
                    code={`// Example of certificate chain validation
const validateCertChain = async (hostname: string, port = 443) => {
  // 1. Establish TLS connection
  const socket = tls.connect({ host: hostname, port });
  
  // 2. Get certificate chain
  const chain = socket.getPeerCertificate(true);
  
  // 3. Validate each certificate
  for (const cert of chain) {
    validateDates(cert);      // Check validity period
    validateDomain(cert);     // Verify hostname
    validatePurpose(cert);    // Check certificate usage
    validateSignature(cert);  // Verify digital signature
  }
}`} />
                </div>
              }
            />

            {/* Certificate Validation Process */}
            <Section
              icon={<Shield className="w-5 h-5 text-emerald-400" />}
              title="Certificate Validation Process"
              content={
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ProcessCard 
                      title="Connection" 
                      description="Establishes secure TLS connection and retrieves server certificates" 
                    />
                    <ProcessCard 
                      title="Chain Validation" 
                      description="Verifies the complete chain from leaf to root certificate" 
                    />
                    <ProcessCard 
                      title="Date Verification" 
                      description="Ensures certificates are within their valid time period" 
                    />
                    <ProcessCard 
                      title="Domain Validation" 
                      description="Checks if certificate is valid for the requested domain" 
                    />
                    <ProcessCard 
                      title="Usage Check" 
                      description="Confirms certificates are used for their intended purpose" 
                    />
                    <ProcessCard 
                      title="Trust Check" 
                      description="Validates issuer trust and certificate signatures" 
                    />
                  </div>
                  <CodeBlock
                    language="typescript"
                    code={`// Example of domain validation logic
const validateDomain = (cert: Certificate, hostname: string): boolean => {
  const names = [
    cert.subject.CN,           // Common Name
    ...cert.subjectAltNames   // Subject Alternative Names
  ];

  // Check if hostname matches any valid names
  return names.some(name => {
    if (name.startsWith('*.')) {  // Wildcard certificate
      const domain = hostname.split('.').slice(1).join('.');
      const pattern = name.slice(2);
      return domain === pattern;
    }
    return hostname === name;
  });
}`} />
                </div>
              }
            />

            {/* Technologies Used */}
            <Section
              icon={<Code2 className="w-5 h-5 text-purple-400" />}
              title="Technologies Used"
              content={
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TechStack
                      title="Frontend"
                      items={[
                        "React 18 with TypeScript",
                        "Tailwind CSS for styling",
                        "Framer Motion animations",
                        "Lucide React icons",
                        "Prism.js syntax highlighting"
                      ]}
                    />
                    <TechStack
                      title="Backend"
                      items={[
                        "Node.js runtime",
                        "Native TLS/SSL libraries",
                        "X.509 Certificate Parser",
                        "Express.js server",
                        "TypeScript for type safety"
                      ]}
                    />
                  </div>
                  <CodeBlock
                    language="typescript"
                    code={`// Example React component with Framer Motion
const CertificateCard: React.FC<{ cert: Certificate }> = ({ cert }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-lg border border-neutral-800"
    >
      <h3 className="text-lg font-medium">{cert.subject.CN}</h3>
      <p className="text-sm text-neutral-400">
        Valid until: {new Date(cert.validTo).toLocaleDateString()}
      </p>
    </motion.div>
  );
}`} />
                </div>
              }
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default About;
