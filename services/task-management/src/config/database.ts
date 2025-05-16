import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const connectDB = async (retryCount = 0): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    const options: mongoose.ConnectOptions = {
      retryWrites: true,
      w: 'majority' as mongoose.ConnectOptions['w'],
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };

    if (!uri) {
      throw new Error('MongoDB URI is not configured. Please check your environment variables.');
    }

    await mongoose.connect(uri, options);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('Task Management Service: MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Task Management Service: MongoDB connection error:', err);
      // Don't exit here, let the retry mechanism handle it
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Task Management Service: MongoDB disconnected');
      // Attempt to reconnect
      if (retryCount < MAX_RETRIES) {
        console.log(`Task Management Service: Attempting to reconnect (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => connectDB(retryCount + 1), RETRY_DELAY);
      } else {
        console.error('Task Management Service: Max retry attempts reached. Could not connect to MongoDB.');
        process.exit(1);
      }
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('Task Management Service: MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Task Management Service: Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Task Management Service: MongoDB connection error:', error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Task Management Service: Retrying connection (${retryCount + 1}/${MAX_RETRIES})...`);
      await sleep(RETRY_DELAY);
      return connectDB(retryCount + 1);
    } else {
      console.error('Task Management Service: Max retry attempts reached. Could not connect to MongoDB.');
      console.error('Please check:');
      console.error('1. Your MongoDB URI is correct');
      console.error('2. Your IP address is whitelisted in MongoDB Atlas');
      console.error('3. Your MongoDB Atlas cluster is running');
      console.error('4. Your network connection is stable');
      process.exit(1);
    }
  }
}; 