import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database';
import logger from './config/logger';
import config from './config';
import { WebhookService } from './services/webhook';
import { SlackService } from './services/slack';
import { WebhookError } from './utils/errors';
import { stream } from './config/logger';

// Create Express app
const app = express();

// Connect to MongoDB
connectDB().catch(err => {
  logger.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream }));
app.use(express.json({ limit: config.webhook.maxPayloadSize }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Routes
app.post('/webhook', async (req, res) => {
  try {
    if (!config.webhook.allowedMethods.includes(req.method)) {
      throw new WebhookError(`Method ${req.method} not allowed. Allowed methods: ${config.webhook.allowedMethods.join(', ')}`);
    }

    const webhook = await WebhookService.storeWebhook(req);
    
    // Send Slack notification if enabled
    await SlackService.sendNotification(webhook);
    
    res.status(200).json({ 
      success: true, 
      message: 'Webhook received and stored',
      id: webhook._id 
    });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    if (error instanceof WebhookError) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Get recent webhooks
app.get('/webhooks', async (req, res) => {
  try {
    const { source, method, startDate, endDate, limit, skip } = req.query;
    const result = await WebhookService.getRecentWebhooks({
      source: source as string,
      method: method as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined
    });
    res.json(result);
  } catch (error) {
    logger.error('Error fetching webhooks:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get webhook by ID
app.get('/webhooks/:id', async (req, res) => {
  try {
    const webhook = await WebhookService.getWebhookById(req.params.id);
    res.json(webhook);
  } catch (error) {
    logger.error(`Error fetching webhook ${req.params.id}:`, error);
    if (error instanceof WebhookError) {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Delete webhook by ID
app.delete('/webhooks/:id', async (req, res) => {
  try {
    await WebhookService.deleteWebhook(req.params.id);
    res.json({ success: true, message: 'Webhook deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting webhook ${req.params.id}:`, error);
    if (error instanceof WebhookError) {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info(`Webhook Catcher service running on port ${PORT}`);
  logger.info(`Environment: ${config.server.env}`);
  logger.info(`MongoDB URI: ${config.mongodb.uri.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')}`);
  logger.info(`Webhook retention: ${config.webhook.retentionDays} days`);
  logger.info(`Rate limit: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs/1000} seconds`);
  logger.info(`Slack notifications: ${config.slack.enabled ? 'enabled' : 'disabled'}`);
}); 