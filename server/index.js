import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PORT, CORS_OPTIONS, RATE_LIMIT_OPTIONS } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import certificateRoutes from './routes/certificates.js';

const app = express();

// Monitor memory usage
function logMemoryUsage() {
  const used = process.memoryUsage();
  console.log('Memory usage:');
  for (let key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
}

// Log memory usage every 30 seconds
setInterval(logMemoryUsage, 30000);

// Security middleware
app.use(helmet());
app.use(cors(CORS_OPTIONS));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  ...RATE_LIMIT_OPTIONS,
  handler: (req, res) => {
    console.log('Rate limit exceeded for IP:', req.ip);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please try again later'
    });
  }
});

// Apply rate limiting and routes to /api
app.use('/api', limiter);
app.use('/api', certificateRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logMemoryUsage();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  logMemoryUsage();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logMemoryUsage();
});