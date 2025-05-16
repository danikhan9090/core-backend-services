import { Request } from 'express';
import Webhook, { IWebhook } from '../models/Webhook';
import logger from '../config/logger';
import config from '../config';
import { WebhookError } from '../utils/errors';

export class WebhookService {
  /**
   * Store a new webhook payload
   */
  static async storeWebhook(req: Request): Promise<IWebhook> {
    try {
      // Validate payload size
      const contentLength = parseInt(req.headers['content-length'] || '0');
      if (contentLength > config.webhook.maxPayloadSize) {
        throw new WebhookError(`Payload size exceeds maximum limit of ${config.webhook.maxPayloadSize} bytes`);
      }

      // Create webhook document
      const webhook = new Webhook({
        source: req.headers['x-webhook-source'] || 'unknown',
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
        ip: req.ip
      });

      // Save to database
      await webhook.save();
      logger.info(`Webhook stored successfully: ${webhook._id}`);

      return webhook;
    } catch (error) {
      logger.error('Error storing webhook:', error);
      throw error;
    }
  }

  /**
   * Get recent webhooks with optional filtering
   */
  static async getRecentWebhooks(options: {
    source?: string;
    method?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  } = {}): Promise<{ webhooks: IWebhook[]; total: number }> {
    try {
      const query: any = {};

      // Apply filters
      if (options.source) query.source = options.source;
      if (options.method) query.method = options.method;
      if (options.startDate || options.endDate) {
        query.timestamp = {};
        if (options.startDate) query.timestamp.$gte = options.startDate;
        if (options.endDate) query.timestamp.$lte = options.endDate;
      }

      // Execute query with pagination
      const [webhooks, total] = await Promise.all([
        Webhook.find(query)
          .sort({ timestamp: -1 })
          .skip(options.skip || 0)
          .limit(options.limit || 50),
        Webhook.countDocuments(query)
      ]);

      return { webhooks, total };
    } catch (error) {
      logger.error('Error fetching webhooks:', error);
      throw error;
    }
  }

  /**
   * Get webhook by ID
   */
  static async getWebhookById(id: string): Promise<IWebhook> {
    try {
      const webhook = await Webhook.findById(id);
      if (!webhook) {
        throw new WebhookError('Webhook not found');
      }
      return webhook;
    } catch (error) {
      logger.error(`Error fetching webhook ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete webhook by ID
   */
  static async deleteWebhook(id: string): Promise<void> {
    try {
      const result = await Webhook.findByIdAndDelete(id);
      if (!result) {
        throw new WebhookError('Webhook not found');
      }
      logger.info(`Webhook deleted successfully: ${id}`);
    } catch (error) {
      logger.error(`Error deleting webhook ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark webhook as processed
   */
  static async markAsProcessed(id: string, error?: string): Promise<IWebhook> {
    try {
      const webhook = await Webhook.findByIdAndUpdate(
        id,
        { 
          processed: true,
          ...(error && { error })
        },
        { new: true }
      );

      if (!webhook) {
        throw new WebhookError('Webhook not found');
      }

      logger.info(`Webhook marked as processed: ${id}`);
      return webhook;
    } catch (error) {
      logger.error(`Error marking webhook ${id} as processed:`, error);
      throw error;
    }
  }
} 