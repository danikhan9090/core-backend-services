import mongoose, { Document, Schema } from 'mongoose';
import config from '../config';
import { WebhookError } from '../utils/errors';

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
    required: [true, 'Source is required'],
    index: true,
    trim: true,
    minlength: [1, 'Source cannot be empty']
  },
  method: {
    type: String,
    required: [true, 'Method is required'],
    enum: {
      values: config.webhook.allowedMethods,
      message: `Method must be one of: ${config.webhook.allowedMethods.join(', ')}`
    }
  },
  headers: {
    type: Map,
    of: String,
    required: [true, 'Headers are required'],
    validate: {
      validator: function(headers: Map<string, string>) {
        return headers.size > 0;
      },
      message: 'Headers cannot be empty'
    }
  },
  query: {
    type: Map,
    of: String,
    required: [true, 'Query parameters are required']
  },
  body: {
    type: Schema.Types.Mixed,
    required: [true, 'Body is required'],
    validate: {
      validator: function(body: any) {
        return body !== null && body !== undefined;
      },
      message: 'Body cannot be null or undefined'
    }
  },
  ip: {
    type: String,
    required: [true, 'IP address is required'],
    trim: true
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
    type: String,
    trim: true
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

// Add pre-save middleware for validation
WebhookSchema.pre('save', function(next) {
  try {
    // Validate payload size
    const payloadSize = JSON.stringify(this.body).length;
    if (payloadSize > config.webhook.maxPayloadSize) {
      throw new WebhookError(`Payload size exceeds maximum limit of ${config.webhook.maxPayloadSize} bytes`);
    }
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('Unknown error occurred during webhook validation'));
    }
  }
});

export default mongoose.model<IWebhook>('Webhook', WebhookSchema); 