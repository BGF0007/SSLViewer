import { VercelRequest, VercelResponse } from '@vercel/node';
import { checkCertificate } from './certificateChecker.js';
import { validateHostname } from './validation.js';
import { CertificateError } from './types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Received request:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  const hostname = req.body?.hostname;
  const port = req.body?.port || 443;

  console.log('Processing request for:', { hostname, port });

  // Validate hostname
  const validationError = validateHostname(hostname);
  if (validationError) {
    console.error('Validation error:', validationError);
    return res.status(400).json({ 
      success: false,
      error: validationError 
    });
  }

  try {
    console.log('Checking certificate...');
    const chain = await checkCertificate(hostname, port);
    console.log('Certificate check successful');
    return res.status(200).json({
      success: true,
      chain
    });
  } catch (error: unknown) {
    console.error('Error checking certificate:', error);
    const errorResponse: CertificateError = {
      error: 'Failed to check certificate',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    return res.status(500).json({ 
      success: false,
      ...errorResponse 
    });
  }
}
