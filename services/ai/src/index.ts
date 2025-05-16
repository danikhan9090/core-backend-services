import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { connectDB, BadRequestError } from '@backend-services/shared';
import aiRoutes from './routes/ai';
import config from './config';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Load Swagger document
const swaggerDocument = YAML.load('./swagger.yaml');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({
  verify: (_req, _res, buf) => {
    try {
      if (buf && buf.length) {
        JSON.parse(buf.toString());
      }
    } catch (e) {
      throw new BadRequestError('Invalid JSON payload');
    }
  }
}));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai'
    }
  }
}));

// Routes
app.use('/ai', aiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    code: 'NOT_FOUND'
  });
});

// Error handling
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    // Set MongoDB URI from config
    process.env.MONGODB_URI = config.mongodb.uri;
    await connectDB();
    
    app.listen(config.port, () => {
      console.log(`AI service listening on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start AI service:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

start(); 