import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define configuration schema
const configSchema = z.object({
  // Server
  port: z.string().transform(Number).default('3004'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),

  // MongoDB
  mongodb: z.object({
    uri: z.string().min(1, 'MongoDB URI is required'),
  }),

  // JWT
  jwt: z.object({
    secret: z.string().min(1, 'JWT secret is required'),
  }),
});

// Create and validate config
const config = configSchema.parse({
  port: process.env.BLOG_PORT,
  nodeEnv: process.env.NODE_ENV,
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});

export default config; 