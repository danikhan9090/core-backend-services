import mongoose, { Document, Schema } from 'mongoose';
import config from '../config';

export interface IWebhook extends Document {
  source: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: any;
  ip: string;
  timestamp: Date;
  processed: boolean;
  error?: string;
}

const WebhookSchema = new Schema<IWebhook>({
  source: {
    type: String,
    required: true,
    index: true
  },
  method: {
    type: String,
    required: true,
    enum: config.webhook.allowedMethods
  },
  headers: {
    type: Map,
    of: String,
    required: true
  },
  query: {
    type: Map,
    of: String,
    required: true
  },
  body: {
    type: Schema.Types.Mixed,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  processed: {
    type: Boolean,
    default: false
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Create TTL index for automatic document deletion after retention period
WebhookSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: config.webhook.retentionDays * 24 * 60 * 60 }
);

// Create compound index for efficient querying
WebhookSchema.index({ source: 1, timestamp: -1 });

export default mongoose.model<IWebhook>('Webhook', WebhookSchema); 