import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { connectDB } from './config/database';
import urlRoutes from './routes/url';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3003;

// Load Swagger document
const swaggerDocument = YAML.load('./swagger.yaml');

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/', urlRoutes);

// Error handling
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      logger.info(`URL Shortener service is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start URL Shortener service:', error);
    process.exit(1);
  }
};

start(); 