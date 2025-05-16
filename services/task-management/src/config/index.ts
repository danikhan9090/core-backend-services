import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Configuration schema
const configSchema = z.object({
  server: z.object({
    port: z.number().default(3006),
    env: z.enum(['development', 'production', 'test']).default('development'),
    nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
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
  task: z.object({
    priorityLevels: z.string().default('low,medium,high'),
    statusOptions: z.string().default('pending,in-progress,completed'),
    maxTasksPerUser: z.number().default(100),
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
    port: parseInt(process.env.PORT || '3006', 10),
    env: process.env.NODE_ENV || 'development',
    nodeEnv: process.env.NODE_ENV || 'development',
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
  task: {
    priorityLevels: process.env.TASK_PRIORITY_LEVELS || 'low,medium,high',
    statusOptions: process.env.TASK_STATUS_OPTIONS || 'pending,in-progress,completed',
    maxTasksPerUser: parseInt(process.env.MAX_TASKS_PER_USER || '100', 10),
    expiryDays: parseInt(process.env.TASK_EXPIRY_DAYS || '30', 10),
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