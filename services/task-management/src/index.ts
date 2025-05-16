import express from 'express';
import cors from 'cors';
import { rateLimiter } from './middleware/rateLimiter';
import taskRoutes from './routes/task';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './config/database';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/api/tasks', taskRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3006;

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Task Management Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Task Management Service:', error);
    process.exit(1);
  }
};

startServer(); 