import axios from 'axios';
import logger from '../config/logger';
import config from '../config';
import { IWebhook } from '../models/Webhook';

interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
}

export class SlackService {
  /**
   * Send webhook notification to Slack
   */
  static async sendNotification(webhook: IWebhook): Promise<void> {
    if (!config.slack.enabled || !config.slack.webhookUrl) {
      logger.debug('Slack notifications are disabled');
      return;
    }

    try {
      const message = this.formatMessage(webhook);
      await axios.post(config.slack.webhookUrl, message);
      logger.info(`Slack notification sent for webhook ${webhook._id}`);
    } catch (error) {
      logger.error('Error sending Slack notification:', error);
      // Don't throw the error to prevent webhook processing from failing
    }
  }

  /**
   * Format webhook data for Slack message
   */
  private static formatMessage(webhook: IWebhook): { blocks: SlackBlock[]; text: string } {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🔔 New Webhook Received from ${webhook.source}`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Method:*\n${webhook.method}`
          },
          {
            type: 'mrkdwn',
            text: `*Source:*\n${webhook.source}`
          },
          {
            type: 'mrkdwn',
            text: `*IP:*\n${webhook.ip}`
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${webhook.timestamp.toISOString()}`
          }
        ]
      }
    ];

    // Add query parameters if present
    if (Object.keys(webhook.query).length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Query Parameters:*\n\`\`\`${JSON.stringify(webhook.query, null, 2)}\`\`\``
        }
      });
    }

    // Add headers if present
    if (Object.keys(webhook.headers).length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Headers:*\n\`\`\`${JSON.stringify(webhook.headers, null, 2)}\`\`\``
        }
      });
    }

    // Add body if present
    if (webhook.body) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Body:*\n\`\`\`${JSON.stringify(webhook.body, null, 2)}\`\`\``
        }
      });
    }

    return {
      blocks,
      text: `New webhook received from ${webhook.source}` // Fallback text
    };
  }
} 