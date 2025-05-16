import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  port: process.env.AUTH_SERVICE_PORT || 3001,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/auth-service'
  }
};

export default config; 