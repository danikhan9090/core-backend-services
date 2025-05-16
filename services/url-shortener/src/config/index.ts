import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Configuration schema
const configSchema = z.object({
  server: z.object({
    port: z.number().default(3001),
    env: z.enum(['development', 'production', 'test']).default('development'),
  }),
  mongodb: z.object({
    uri: z.string().min(1, 'MongoDB URI is required'),
    options: z.object({
      retryWrites: z.boolean().default(true),
      w: z.string().default('majority'),
      serverSelectionTimeoutMS: z.number().default(10000),
      socketTimeoutMS: z.number().default(45000),
      connectTimeoutMS: z.number().default(10000),
    }),
  }),
  url: z.object({
    shortCodeLength: z.number().default(6),
    maxUrlLength: z.number().default(2048),
    allowedProtocols: z.array(z.string()).default(['http:', 'https:']),
    expiryDays: z.number().default(30),
  }),
  rateLimit: z.object({
    windowMs: z.number().default(900000), // 15 minutes
    max: z.number().default(100),
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
    format: z.enum(['json', 'simple']).default('json'),
  }),
});

// Parse and validate configuration
const config = configSchema.parse({
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    },
  },
  url: {
    shortCodeLength: parseInt(process.env.SHORT_CODE_LENGTH || '6', 10),
    maxUrlLength: parseInt(process.env.MAX_URL_LENGTH || '2048', 10),
    allowedProtocols: (process.env.ALLOWED_PROTOCOLS || 'http:,https:').split(','),
    expiryDays: parseInt(process.env.URL_EXPIRY_DAYS || '30', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
});

export type Config = z.infer<typeof configSchema>;
export default config; 