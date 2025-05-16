import mongoose from 'mongoose';
import { getConfig } from './config';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const connectDB = async (retryCount = 0): Promise<void> => {
  try {
    const config = getConfig();
    const { uri, options } = config.mongodb;

    if (!uri) {
      throw new Error('MongoDB URI is not configured. Please check your environment variables.');
    }

    await mongoose.connect(uri, {
      ...options,
      w: options.w as mongoose.ConnectOptions['w'],
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 10000, // 10 seconds
    });

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      // Don't exit here, let the retry mechanism handle it
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      // Attempt to reconnect
      if (retryCount < MAX_RETRIES) {
        console.log(`Attempting to reconnect (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => connectDB(retryCount + 1), RETRY_DELAY);
      } else {
        console.error('Max retry attempts reached. Could not connect to MongoDB.');
        process.exit(1);
      }
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection (${retryCount + 1}/${MAX_RETRIES})...`);
      await sleep(RETRY_DELAY);
      return connectDB(retryCount + 1);
    } else {
      console.error('Max retry attempts reached. Could not connect to MongoDB.');
      console.error('Please check:');
      console.error('1. Your MongoDB URI is correct');
      console.error('2. Your IP address is whitelisted in MongoDB Atlas');
      console.error('3. Your MongoDB Atlas cluster is running');
      console.error('4. Your network connection is stable');
      process.exit(1);
    }
  }
}; 