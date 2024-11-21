import express from 'express';
import { validationResult } from 'express-validator';
import { validateDomain } from '../middleware/validation.js';
import { getCertificateChain } from '../certificateChecker.js';

const router = express.Router();

router.post('/certificates', validateDomain, async (req, res) => {
  console.log('Received request body:', req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: errors.array(),
        hostname: req.body.hostname,
        port: req.body.port,
        receivedBody: req.body
      });
    }

    const { hostname, port = 443 } = req.body;

    if (!hostname) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing hostname',
        message: 'Hostname is required',
        hostname: req.body.hostname,
        port: req.body.port
      });
    }

    const chain = await getCertificateChain(hostname, port);
    
    // Ensure chain is an array before sending
    if (!Array.isArray(chain)) {
      throw new Error('Certificate chain must be an array');
    }
    
    res.json({ 
      success: true,
      hostname,
      port,
      chain
    });
  } catch (error) {
    console.error('Certificate check error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check certificate',
      hostname: req.body.hostname,
      port: req.body.port
    });
  }
});

export default router;