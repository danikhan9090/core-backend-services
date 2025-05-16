import rateLimit from 'express-rate-limit';
import { ServiceUnavailableError } from '../utils/errors';

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

export const createRateLimiter = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later'
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: new ServiceUnavailableError(message),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        code: 'RATE_LIMIT_EXCEEDED',
        message
      });
    }
  });
}; 