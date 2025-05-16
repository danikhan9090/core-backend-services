import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { connectDB, errorHandler } from '@backend-services/shared';
import postRoutes from './routes/post';
import commentRoutes from './routes/comment';
import config from './config';

const app = express();

// Load Swagger document
const swaggerDocument = YAML.load('./swagger.yaml');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

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
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);

// Error handling
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    // Set MongoDB URI from config
    process.env.MONGODB_URI = config.mongodb.uri;
    await connectDB();
    
    app.listen(config.port, () => {
      console.log(`Blog service listening on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start Blog service:', error);
    process.exit(1);
  }
};

start(); 