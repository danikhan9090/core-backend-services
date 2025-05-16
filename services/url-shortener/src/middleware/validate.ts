import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Update request with validated data
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Validation failed', error.errors));
      } else {
        next(error);
      }
    }
  };
}; 