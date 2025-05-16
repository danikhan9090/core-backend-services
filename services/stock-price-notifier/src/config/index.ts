import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define types for stock monitoring
type StockCondition = 'above' | 'below';
interface MonitoredStock {
  symbol: string;
  threshold: number;
  condition: StockCondition;
}

// Default monitored stocks
const DEFAULT_MONITORED_STOCKS: MonitoredStock[] = [
  { symbol: 'AAPL', threshold: 150, condition: 'above' as const },
  { symbol: 'GOOGL', threshold: 2800, condition: 'below' as const },
  { symbol: 'MSFT', threshold: 400, condition: 'above' as const },
  { symbol: 'AMZN', threshold: 170, condition: 'below' as const },
];

// Configuration schema
const configSchema = z.object({
  server: z.object({
    port: z.number().default(3002),
    env: z.enum(['development', 'production', 'test']).default('development'),
  }),
  monitoring: z.object({
    stocks: z.array(z.object({
      symbol: z.string(),
      threshold: z.number(),
      condition: z.enum(['above', 'below']),
    })).default(DEFAULT_MONITORED_STOCKS),
    logLevel: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  }),
  notification: z.object({
    email: z.object({
      enabled: z.boolean().default(false),
      from: z.string().email().optional(),
      to: z.string().email().optional(),
      smtpHost: z.string().optional(),
      smtpPort: z.number().optional(),
      smtpUser: z.string().optional(),
      smtpPass: z.string().optional(),
    }),
    checkInterval: z.string().default('*/1 * * * *'), // Every minute
  }),
  rateLimit: z.object({
    windowMs: z.number().default(900000), // 15 minutes
    max: z.number().default(100),
  }),
});

// Helper function to safely parse JSON
function safeJsonParse<T extends MonitoredStock[]>(json: string | undefined, defaultValue: T): T {
  if (!json) {
    console.log('No MONITORED_STOCKS environment variable set, using default configuration');
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(json);
    
    if (!Array.isArray(parsed)) {
      console.warn('MONITORED_STOCKS must be an array, using default configuration');
      return defaultValue;
    }

    const validatedStocks = parsed.map((item, index) => {
      const stock = {
        symbol: String(item.symbol || ''),
        threshold: Number(item.threshold || 0),
        condition: (item.condition === 'above' || item.condition === 'below') 
          ? item.condition 
          : defaultValue[0].condition
      };

      // Validate the stock configuration
      if (!stock.symbol) {
        console.warn(`Stock at index ${index} has no symbol, skipping`);
        return null;
      }
      if (stock.threshold <= 0) {
        console.warn(`Stock ${stock.symbol} has invalid threshold (${stock.threshold}), using default`);
        stock.threshold = defaultValue[0].threshold;
      }

      return stock;
    }).filter((stock): stock is MonitoredStock => stock !== null);

    if (validatedStocks.length === 0) {
      console.warn('No valid stocks found in MONITORED_STOCKS, using default configuration');
      return defaultValue;
    }

    console.log(`Successfully loaded ${validatedStocks.length} stock(s) from configuration`);
    return validatedStocks as T;
  } catch (error) {
    console.warn('Failed to parse MONITORED_STOCKS, using default configuration:', error);
    return defaultValue;
  }
}

// Parse and validate configuration
const config = configSchema.parse({
  server: {
    port: parseInt(process.env.PORT || '3002', 10),
    env: process.env.NODE_ENV || 'development',
  },
  monitoring: {
    stocks: safeJsonParse<MonitoredStock[]>(process.env.MONITORED_STOCKS, DEFAULT_MONITORED_STOCKS),
    logLevel: process.env.LOG_LEVEL,
  },
  notification: {
    email: {
      enabled: process.env.EMAIL_ENABLED === 'true',
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
    },
    checkInterval: process.env.CHECK_INTERVAL,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
});

// Log configuration status
console.log('\nConfiguration loaded successfully');
console.log('Environment:', config.server.env);
console.log('Monitoring:', {
  stocks: config.monitoring.stocks.map(s => `${s.symbol} (${s.condition} ${s.threshold})`).join(', '),
  logLevel: config.monitoring.logLevel,
});
console.log('Rate limiting:', {
  windowMs: `${config.rateLimit.windowMs / 60000} minutes`,
  maxRequests: config.rateLimit.max,
});
console.log('Email notifications:', config.notification.email.enabled ? 'enabled' : 'disabled');
console.log('Check interval:', config.notification.checkInterval, '\n');

export type Config = z.infer<typeof configSchema>;
export default config; 