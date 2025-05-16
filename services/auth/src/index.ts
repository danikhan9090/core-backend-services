import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { connectDB } from '@backend-services/shared';
import { errorHandler } from '@backend-services/shared';
import authRoutes from './routes/auth';
import config from './config';
import path from 'path';

const app = express();
const port = config.port;

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Auth service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start auth service:', error);
    process.exit(1);
  }
};

start(); 