import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@backend-services/shared';
import config from '../config';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid token'));
  }
}; 