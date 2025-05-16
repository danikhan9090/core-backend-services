import winston from 'winston';
import 'winston-daily-rotate-file';

const isDevelopment = process.env.NODE_ENV === 'development';

// Custom format for development
const devFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Custom format for production
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isDevelopment ? devFormat : prodFormat,
  transports: [
    // Console transport
    new winston.transports.Console(),
    // File transports for production
    ...(isDevelopment
      ? []
      : [
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
        ])
  ]
});

// Handle uncaught exceptions and rejections
if (!isDevelopment) {
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

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

export { logger }; 