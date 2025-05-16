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
    message = 'Too many requests from this IP, please try again later'
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    handler: (_req, _res, _next, options) => {
      throw new ServiceUnavailableError(options.message as string);
    }
  });
}; 