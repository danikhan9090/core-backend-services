import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create the configuration object
const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || '',
    options: {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  server: {
    port: process.env.PORT || '3006',
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  },
  task: {
    priorityLevels: process.env.TASK_PRIORITY_LEVELS || 'low,medium,high',
    statusOptions: process.env.TASK_STATUS_OPTIONS || 'pending,in_progress,completed,cancelled',
  },
};

// Export the configuration
export const getConfig = () => config; 