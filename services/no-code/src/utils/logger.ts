import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom format for development
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Custom format for production
const prodFormat = combine(
  timestamp(),
  json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    // Console transport for all environments
    new winston.transports.Console(),
    // File transports for production
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '14d'
      }),
      new winston.transports.DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d'
      })
    ] : [])
  ]
});

// Handle uncaught exceptions and rejections
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  );

  logger.rejections.handle(
    new winston.transports.DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  );
}

// Export a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

export { logger }; 