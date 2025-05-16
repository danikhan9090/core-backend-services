import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { NotFoundError, ValidationError, UnauthorizedError, ForbiddenError } from '../utils/errors';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Default error
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}; 