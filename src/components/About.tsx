import { X, Server, Shield, Code2, Terminal } from 'lucide-react';
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-auto bg-[#16181E] rounded-xl border border-neutral-800 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#16181E] border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-400/80" />
            <h2 className="text-xl font-semibold text-neutral-200">About SSL Viewer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-300 rounded-lg hover:bg-white/[0.02]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          <Section
            icon={Shield}
            title="Overview"
            content={
              <p>
                SSL Viewer is a modern tool designed to help you inspect and validate SSL certificates.
                It provides detailed insights into certificate chains, validity periods, and security features
                with a clean, user-friendly interface.
              </p>
            }
          />

          <Section
            icon={Server}
            title="Certificate Validation Process"
            content={
              <>
                <p className="mb-4">
                  The application performs SSL/TLS certificate validation through these key steps:
                </p>
                <div className="space-y-2 mb-4">
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-800">
                    <span className="text-emerald-400/80">1. Certificate Chain Retrieval</span>
                    <p className="text-sm mt-1">Connects to the server on the specified port (default 443) and retrieves the complete certificate chain.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-800">
                    <span className="text-emerald-400/80">2. Chain Validation</span>
                    <p className="text-sm mt-1">Verifies the certificate chain length and presence of root and intermediate certificates.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-800">
                    <span className="text-emerald-400/80">3. Certificate Analysis</span>
                    <p className="text-sm mt-1">Examines validity period, domain match, and key usage extensions.</p>
                  </div>
                </div>
                <CodeBlock code={`// Certificate chain validation checks
const validateCertificateChain = (certificates: Certificate[]) => {
  const checks = [
    {
      name: 'Certificate Chain',
      passed: certificates.length > 0,
      description: 'Valid certificate chain found',
      details: certificates.length > 0 
        ? \`Complete chain with \${certificates.length} certificates\`
        : 'No certificate chain found',
      subChecks: [
        {
          name: 'Root Certificate',
          passed: certificates.length >= 2,
          message: certificates.length >= 2 ? 'Present' : 'Missing'
        },
        {
          name: 'Intermediate Certificates',
          passed: certificates.length >= 2,
          message: \`\${certificates.length - 2} intermediate(s)\`
        }
      ]
    }
  ];
  
  // Validate expiry dates
  const expiryStatus = getExpiryStatus(certificates[0]);
  const days = getRemainingDays(certificates[0].validTo);
  
  if (days < 0) return 'Certificate has expired';
  if (days <= 30) return \`Warning: Expires in \${days} days\`;
  return \`Valid for \${days} days\`;
};`} />
              </>
            }
          />

          <Section
            icon={Terminal}
            title="Certificate Information Processing"
            content={
              <>
                <p className="mb-4">
                  The application extracts and processes certificate information in the following ways:
                </p>
                <CodeBlock code={`// Certificate information extraction
const processCertificateInfo = (cert: Certificate) => {
  // Extract and format subject information
  const subject = typeof cert.subject === 'string'
    ? cert.subject.match(/CN=([^,]+)/)?.[1] || 'Not Available'
    : cert.subject?.CN || 'Not Available';

  // Extract and format issuer information
  const issuer = typeof cert.issuer === 'string'
    ? cert.issuer.match(/O=([^,]+)/)?.[1] || 'Not Available'
    : cert.issuer?.O || 'Not Available';

  // Process validity dates
  const validFrom = new Date(cert.validFrom).toLocaleDateString();
  const validTo = new Date(cert.validTo).toLocaleDateString();
  
  return {
    subject,
    issuer,
    validFrom,
    validTo,
    keyLength: cert.bits ? \`\${cert.bits} bits\` : 'Not Available',
    extensions: cert.ext_key_usage || ['Standard Usage'],
    serialNumber: cert.serialNumber,
    version: cert.version || 'v3'
  };
};`} />
                <div className="mt-4 space-y-2">
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-800">
                    <span className="text-emerald-400/80">Domain Name Validation</span>
                    <p className="text-sm mt-1">Validates certificate against the requested domain name using Common Name (CN) and Subject Alternative Names.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-800">
                    <span className="text-emerald-400/80">Certificate Details</span>
                    <p className="text-sm mt-1">Extracts and displays key information including subject, issuer, validity dates, and key usage.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-neutral-800">
                    <span className="text-emerald-400/80">PEM Format</span>
                    <p className="text-sm mt-1">Provides certificate data in both human-readable and PEM-encoded formats for download.</p>
                  </div>
                </div>
              </>
            }
          />

          <Section
            icon={Code2}
            title="Technical Stack"
            content={
              <div className="space-y-2">
                <p>Built with modern web technologies:</p>
                <ul className="space-y-1 mt-2">
                  <li>• React with TypeScript for type-safe frontend</li>
                  <li>• Node.js backend for certificate processing</li>
                  <li>• TLS/SSL native libraries for secure connections</li>
                  <li>• Framer Motion for smooth animations</li>
                  <li>• TailwindCSS for responsive design</li>
                </ul>
              </div>
            }
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-between items-center p-6 bg-[#16181E] border-t border-neutral-800">
          <div className="text-sm text-neutral-500">
            Version 1.0.0
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default About;
