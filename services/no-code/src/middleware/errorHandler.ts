import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  DatabaseError,
  ServiceUnavailableError
} from '../utils/errors';

interface ErrorResponse {
  status: 'error';
  message: string;
  code: string;
  details?: unknown;
  requestId?: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response<ErrorResponse> => {
  // Generate request ID for tracking
  const requestId = req.id || Math.random().toString(36).substring(7);

  // Log error with context
  logger.error('Error occurred', {
    requestId,
    error: {
      name: err.name,
      message: err.message,
      stack: isDevelopment ? err.stack : undefined
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      ip: req.ip
    }
  });

  // Handle specific error types
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      })),
      requestId
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      code: 'VALIDATION_ERROR',
      details: err.details,
      requestId
    });
  }

  if (err instanceof BadRequestError) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      code: 'BAD_REQUEST',
      requestId
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      status: 'error',
      message: err.message,
      code: 'UNAUTHORIZED',
      requestId
    });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      status: 'error',
      message: err.message,
      code: 'FORBIDDEN',
      requestId
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 'error',
      message: err.message,
      code: 'NOT_FOUND',
      requestId
    });
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({
      status: 'error',
      message: err.message,
      code: 'CONFLICT',
      requestId
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({
      status: 'error',
      message: 'Database operation failed',
      code: 'DATABASE_ERROR',
      details: isDevelopment ? err.message : undefined,
      requestId
    });
  }

  if (err instanceof ServiceUnavailableError) {
    return res.status(503).json({
      status: 'error',
      message: err.message,
      code: 'SERVICE_UNAVAILABLE',
      requestId
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
      requestId
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
      requestId
    });
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      status: 'error',
      message: 'Database operation failed',
      code: 'DATABASE_ERROR',
      details: isDevelopment ? err.message : undefined,
      requestId
    });
  }

  // Handle network errors
  if (err.message.includes('network') || err.message.includes('ECONNREFUSED')) {
    return res.status(503).json({
      status: 'error',
      message: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
      requestId
    });
  }

  // Handle timeout errors
  if (err.message.includes('timeout')) {
    return res.status(504).json({
      status: 'error',
      message: 'Request timeout',
      code: 'TIMEOUT',
      requestId
    });
  }

  // Default error response
  return res.status(500).json({
    status: 'error',
    message: isDevelopment ? err.message : 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    requestId
  });
}; 