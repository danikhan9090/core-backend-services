import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Define configuration schema
const configSchema = z.object({
  // Server
  port: z.string().transform(Number).default('3005'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),

  // MongoDB
  mongodb: z.object({
    uri: z.string({
      required_error: 'MongoDB URI is required. Please check your .env file.',
    }).min(1, 'MongoDB URI cannot be empty'),
  }),

  // JWT
  jwt: z.object({
    secret: z.string({
      required_error: 'JWT secret is required. Please check your .env file.',
    }).min(1, 'JWT secret cannot be empty'),
  }),

  // OpenAI
  openai: z.object({
    apiKey: z.string({
      required_error: 'OpenAI API key is required. Please check your .env file.',
    }).min(1, 'OpenAI API key cannot be empty'),
    model: z.string().default('gpt-3.5-turbo'),
    maxTokens: z.string().transform(Number).default('1000'),
    temperature: z.string().transform(Number).default('0.7'),
  }),
});

// Create and validate config
const config = configSchema.parse({
  port: process.env.AI_PORT,
  nodeEnv: process.env.NODE_ENV,
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
    maxTokens: process.env.OPENAI_MAX_TOKENS,
    temperature: process.env.OPENAI_TEMPERATURE,
  },
});

// Log configuration status
console.log('Environment:', config.nodeEnv);
console.log('Server port:', config.port);
console.log('MongoDB URI:', config.mongodb.uri ? '✓ Configured' : '✗ Missing');
console.log('JWT Secret:', config.jwt.secret ? '✓ Configured' : '✗ Missing');
console.log('OpenAI API Key:', config.openai.apiKey ? '✓ Configured' : '✗ Missing');

export default config; 