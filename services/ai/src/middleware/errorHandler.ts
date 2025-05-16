import { Request, Response, NextFunction } from 'express';
import { BadRequestError, UnauthorizedError, NotFoundError } from '@backend-services/shared';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';

interface ErrorResponse {
  status: 'error';
  message: string;
  details?: string;
  code?: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response<ErrorResponse> => {
  // Log error with stack trace in development
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      details: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      code: 'VALIDATION_ERROR'
    });
  }

  // Handle JWT errors
  if (err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      status: 'error',
      message: 'Token has expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  // Handle custom errors
  if (err instanceof BadRequestError) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      code: 'BAD_REQUEST'
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      status: 'error',
      message: err.message,
      code: 'UNAUTHORIZED'
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 'error',
      message: err.message,
      code: 'NOT_FOUND'
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload',
      details: isDevelopment ? err.message : undefined,
      code: 'INVALID_JSON'
    });
  }

  // Handle OpenAI API errors
  if (err.message.includes('OpenAI API')) {
    return res.status(500).json({
      status: 'error',
      message: 'AI service error',
      details: isDevelopment ? err.message : undefined,
      code: 'AI_SERVICE_ERROR'
    });
  }

  // Handle network errors
  if (err.message.includes('network') || err.message.includes('ECONNREFUSED')) {
    return res.status(503).json({
      status: 'error',
      message: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE'
    });
  }

  // Handle timeout errors
  if (err.message.includes('timeout')) {
    return res.status(504).json({
      status: 'error',
      message: 'Request timeout',
      code: 'TIMEOUT'
    });
  }

  // Default error
  return res.status(500).json({
    status: 'error',
    message: isDevelopment ? err.message : 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR'
  });
}; 