import mongoose from 'mongoose';
import dns from 'dns';
import config from './index';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds
const DNS_TIMEOUT = 10000; // 10 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mask sensitive information in URI
const maskUri = (uri: string): string => {
  return uri.replace(/(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)@/, '$1****:****@');
};

// Custom DNS resolver with timeout
const resolveDNS = async (hostname: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    console.log(`Attempting DNS resolution for ${hostname}...`);
    console.log('Using DNS servers:', dns.getServers());
    
    const timeout = setTimeout(() => {
      reject(new Error(`DNS resolution timeout for ${hostname}`));
    }, DNS_TIMEOUT);

    dns.resolveTxt(hostname, (err, records) => {
      clearTimeout(timeout);
      if (err) {
        console.error('DNS resolution error:', err);
        reject(err);
      } else {
        console.log('DNS resolution successful. Records:', records);
        resolve(records.flat());
      }
    });
  });
};

// Extract hostname from MongoDB URI
const getHostnameFromUri = (uri: string): string => {
  const match = uri.match(/@([^/]+)/);
  return match ? match[1] : '';
};

export const connectDB = async (retryCount = 0): Promise<void> => {
  try {
    const { uri, options } = config.mongodb;

    if (!uri) {
      throw new Error('MongoDB URI is not configured. Please check your environment variables.');
    }

    // Log the masked URI
    console.log('Attempting to connect to MongoDB with URI:', maskUri(uri));

    // Try to resolve DNS before connecting
    try {
      const hostname = getHostnameFromUri(uri);
      if (hostname) {
        console.log(`\nDNS Resolution Details:`);
        console.log(`Hostname: ${hostname}`);
        console.log(`Current DNS servers:`, dns.getServers());
        
        // Try to resolve using different DNS servers
        const googleDNS = ['8.8.8.8', '8.8.4.4'];
        console.log(`\nTrying with Google DNS servers:`, googleDNS);
        dns.setServers(googleDNS);
        
        await resolveDNS(hostname);
        console.log('DNS resolution successful');
      }
    } catch (error) {
      const dnsError = error as Error;
      console.warn('DNS resolution warning:', dnsError.message);
      // Continue with connection attempt even if DNS resolution fails
    }

    // Set up connection options with DNS settings
    const connectionOptions: mongoose.ConnectOptions = {
      ...options,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4, // Force IPv4
      w: 'majority' as const, // Type assertion to ensure correct type
    };

    console.log('\nConnection Options:', {
      ...connectionOptions,
      // Mask any sensitive information in options
      auth: connectionOptions.auth ? { ...connectionOptions.auth, password: '****' } : undefined
    });

    // Attempt connection
    await mongoose.connect(uri, connectionOptions);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('URL Shortener Service: MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('URL Shortener Service: MongoDB connection error:', err);
      // Don't exit here, let the retry mechanism handle it
    });

    mongoose.connection.on('disconnected', () => {
      console.log('URL Shortener Service: MongoDB disconnected');
      // Attempt to reconnect
      if (retryCount < MAX_RETRIES) {
        console.log(`URL Shortener Service: Attempting to reconnect (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => connectDB(retryCount + 1), RETRY_DELAY);
      } else {
        console.error('URL Shortener Service: Max retry attempts reached. Could not connect to MongoDB.');
        process.exit(1);
      }
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('URL Shortener Service: MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('URL Shortener Service: Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('URL Shortener Service: MongoDB connection error:', error);
    
    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(RETRY_DELAY * Math.pow(2, retryCount), 30000); // Exponential backoff with max 30s
      console.log(`URL Shortener Service: Retrying connection (${retryCount + 1}/${MAX_RETRIES}) in ${delay/1000}s...`);
      await sleep(delay);
      return connectDB(retryCount + 1);
    } else {
      console.error('URL Shortener Service: Max retry attempts reached. Could not connect to MongoDB.');
      console.error('\nTroubleshooting steps:');
      console.error('1. Check your MongoDB URI format:');
      console.error('   - Should be: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>');
      console.error('   - Current URI: ' + (config.mongodb.uri ? maskUri(config.mongodb.uri) : 'Not set'));
      console.error('\n2. Network connectivity:');
      console.error('   - Check if you can ping the MongoDB cluster');
      console.error('   - Verify your network/firewall settings');
      console.error('   - Try using a different network connection');
      console.error('\n3. MongoDB Atlas:');
      console.error('   - Verify your IP is whitelisted in MongoDB Atlas');
      console.error('   - Check if your cluster is running');
      console.error('   - Verify your username and password');
      console.error('\n4. DNS Resolution:');
      console.error('   - Try using Google DNS (8.8.8.8)');
      console.error('   - Check your local DNS settings');
      console.error('\n5. Environment:');
      console.error('   - Verify NODE_ENV is set correctly');
      console.error('   - Check if all required environment variables are set');
      
      // Don't exit immediately, give time to read the error message
      setTimeout(() => process.exit(1), 5000);
    }
  }
}; 