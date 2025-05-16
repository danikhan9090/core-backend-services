import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as cron from 'node-cron';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger, { stream } from './config/logger';
import stockPriceService from './services/stockPrice';
import notificationService from './services/notification';

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stock price endpoint
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await stockPriceService.getStockPrice(symbol);
    res.json(price);
  } catch (error) {
    logger.error('Error in stock price endpoint', { error });
    res.status(500).json({ error: 'Failed to fetch stock price' });
  }
});

// Start the server
const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info(`Stock Price Notifier service is running on port ${PORT}`);
});

// Set up monitoring schedule
cron.schedule(config.notification.checkInterval, async () => {
  try {
    logger.info('Starting scheduled stock price check');
    await stockPriceService.checkThresholds();
    logger.info('Completed scheduled stock price check');
  } catch (error) {
    logger.error('Error in scheduled stock price check', { error });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
}); 