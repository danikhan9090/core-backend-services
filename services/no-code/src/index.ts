import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from '@backend-services/shared';
import { connectDB } from './config/database';
import { logger, stream } from './utils/logger';
import { requestId } from './middleware/requestId';
import { createRateLimiter } from './middleware/rateLimit';
import formRoutes from './routes/form';

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));
app.use(express.json());
app.use(requestId);
app.use(morgan('combined', { stream }));
app.use(createRateLimiter());

// Routes
app.use('/api/v1/forms', formRoutes);

// Error handling
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      logger.info(`No-Code service listening on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start No-Code service:', error);
    process.exit(1);
  }
};

start(); 