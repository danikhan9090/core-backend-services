import dotenv from 'dotenv';
import { SignOptions } from 'jsonwebtoken';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  jwt: {
    secret: string;
    expiresIn: SignOptions['expiresIn'];
  };
  mongodb: {
    uri: string;
  };
}

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config: Config = {
  port: parseInt(process.env.AUTH_PORT || '3001', 10),
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'],
  },
  mongodb: {
    uri: process.env.MONGODB_URI!,
  },
};

export default config; 