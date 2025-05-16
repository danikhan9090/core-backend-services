import mongoose from 'mongoose';
import config from './index';
import logger from './logger';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const connectDB = async (retryCount = 0): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      ...config.mongodb.options,
      w: 'majority' as const // Fix type error by explicitly typing as 'majority'
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      connectDB();
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error during MongoDB connection closure:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('MongoDB connection error:', error);

    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying connection in ${RETRY_DELAY/1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY);
      return connectDB(retryCount + 1);
    } else {
      logger.error('Max retries reached. Could not connect to MongoDB.');
      logger.error('Please check:');
      logger.error('1. MongoDB URI is correct');
      logger.error('2. MongoDB server is running');
      logger.error('3. Network connectivity');
      logger.error('4. IP whitelist if using MongoDB Atlas');
      process.exit(1);
    }
  }
}; 