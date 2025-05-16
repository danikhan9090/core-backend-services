import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../utils/logger';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error:', {
          errors: error.errors,
          path: req.path,
          method: req.method,
        });
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}; 