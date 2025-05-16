import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuration schema
const configSchema = z.object({
  server: z.object({
    port: z.number().default(3003),
    env: z.enum(['development', 'production', 'test']).default('development'),
  }),
  mongodb: z.object({
    uri: z.string().url().default('mongodb://localhost:27017/webhook-catcher'),
    options: z.object({
      retryWrites: z.boolean().default(true),
      w: z.string().default('majority'),
      maxPoolSize: z.number().default(10),
      serverSelectionTimeoutMS: z.number().default(5000),
      socketTimeoutMS: z.number().default(45000),
    }),
  }),
  webhook: z.object({
    maxPayloadSize: z.number().default(1024 * 1024), // 1MB
    retentionDays: z.number().default(30),
    allowedMethods: z.array(z.string()).default(['POST', 'PUT', 'PATCH']),
  }),
  slack: z.object({
    enabled: z.boolean().default(false),
    webhookUrl: z.string().url().optional(),
    channel: z.string().optional(),
    username: z.string().default('Webhook Catcher'),
    iconEmoji: z.string().default(':incoming_envelope:'),
  }).refine(
    (data) => !data.enabled || (data.enabled && data.webhookUrl),
    {
      message: "Webhook URL is required when Slack is enabled",
      path: ["webhookUrl"]
    }
  ),
  rateLimit: z.object({
    windowMs: z.number().default(900000), // 15 minutes
    max: z.number().default(100),
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
    format: z.enum(['json', 'simple']).default('json'),
  }),
});

// Parse and validate configuration
const config = configSchema.parse({
  server: {
    port: parseInt(process.env.PORT || '3003', 10),
    env: process.env.NODE_ENV || 'development',
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      retryWrites: process.env.MONGODB_RETRY_WRITES !== 'false',
      w: process.env.MONGODB_WRITE_CONCERN || 'majority',
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10', 10),
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000', 10),
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000', 10),
    },
  },
  webhook: {
    maxPayloadSize: parseInt(process.env.WEBHOOK_MAX_PAYLOAD_SIZE || '1048576', 10),
    retentionDays: parseInt(process.env.WEBHOOK_RETENTION_DAYS || '30', 10),
    allowedMethods: process.env.WEBHOOK_ALLOWED_METHODS 
      ? process.env.WEBHOOK_ALLOWED_METHODS.split(',')
      : undefined,
  },
  slack: {
    enabled: process.env.SLACK_ENABLED === 'true',
    webhookUrl: process.env.SLACK_WEBHOOK_URL || undefined,
    channel: process.env.SLACK_CHANNEL,
    username: process.env.SLACK_USERNAME,
    iconEmoji: process.env.SLACK_ICON_EMOJI,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL,
    format: process.env.LOG_FORMAT,
  },
});

// Log configuration status
console.log('\nConfiguration loaded successfully');
console.log('Environment:', config.server.env);
console.log('MongoDB:', {
  uri: config.mongodb.uri.replace(/\/\/[^:]+:[^@]+@/, '//****:****@'),
  options: config.mongodb.options,
});
console.log('Webhook:', {
  maxPayloadSize: `${config.webhook.maxPayloadSize / 1024 / 1024}MB`,
  retentionDays: config.webhook.retentionDays,
  allowedMethods: config.webhook.allowedMethods,
});
console.log('Slack:', {
  enabled: config.slack.enabled,
  channel: config.slack.channel || 'Not configured',
});
console.log('Rate limiting:', {
  windowMs: `${config.rateLimit.windowMs / 60000} minutes`,
  maxRequests: config.rateLimit.max,
});
console.log('Logging:', {
  level: config.logging.level,
  format: config.logging.format,
}, '\n');

export type Config = z.infer<typeof configSchema>;
export default config; 