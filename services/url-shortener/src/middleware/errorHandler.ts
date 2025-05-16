import { Request, Response, NextFunction } from 'express';
import { BaseError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

const isDevelopment = process.env.NODE_ENV === 'development';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred:', {
    error: {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined
    },
    request: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body,
      userId: req.user?.userId
    }
  });

  // Handle known errors
  if (error instanceof BaseError) {
    res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message,
      ...(error instanceof ValidationError && { details: error.details })
    });
    return;
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: error.errors
    });
    return;
  }

  // Handle Mongoose errors
  if (error instanceof mongoose.Error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Database validation failed',
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
      return;
    }

    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid ID format'
      });
      return;
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Invalid token'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      code: 'TOKEN_EXPIRED',
      message: 'Token expired'
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: isDevelopment ? error.message : 'Internal server error'
  });
}; 