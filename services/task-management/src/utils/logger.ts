import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const logDir = process.env.LOG_DIR || 'logs';
const logLevel = process.env.LOG_LEVEL || 'info';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create daily rotate file transport
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'task-management-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  zippedArchive: true
});

// Create console transport
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
});

// Create logger instance
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'task-management' },
  transports: [
    fileRotateTransport,
    consoleTransport
  ]
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Log unhandled errors
process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
}); 