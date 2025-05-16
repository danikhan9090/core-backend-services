import * as winston from 'winston';
import 'winston-daily-rotate-file';
import config from './index';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create daily rotate file transport
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/webhook-catcher-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  format: logFormat,
});

// Create console transport
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`;
    })
  ),
});

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'webhook-catcher' },
  transports: [fileRotateTransport, consoleTransport],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
    }),
  ],
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger; 