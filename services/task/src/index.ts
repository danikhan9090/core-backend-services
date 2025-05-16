import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { connectDB, errorHandler } from '@backend-services/shared';
import taskRoutes from './routes/task';

const app = express();
const port = process.env.TASK_PORT || 3002;

// Load Swagger document
const swaggerDocument = YAML.load('./swagger.yaml');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/tasks', taskRoutes);

// Error handling
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Task service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start task service:', error);
    process.exit(1);
  }
};

start(); 