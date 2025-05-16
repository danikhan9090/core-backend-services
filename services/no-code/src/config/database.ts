import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { DatabaseError } from '../utils/errors';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoUri, options);
    
    logger.info('MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw new DatabaseError('Failed to connect to MongoDB');
  }
}; 