import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { logger } from '../utils/logger';

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    // Check if authorization header exists
    if (!authHeader) {
      logger.warn('Authentication failed: Missing authorization header', {
        ip: req.ip,
        path: req.path
      });
      res.status(401).json({
        status: 'error',
        message: 'Authorization header is missing',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: Invalid authorization format', {
        ip: req.ip,
        path: req.path
      });
      res.status(401).json({
        status: 'error',
        message: 'Invalid authorization format. Use: Bearer <token>',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      logger.warn('Authentication failed: Missing token', {
        ip: req.ip,
        path: req.path
      });
      res.status(401).json({
        status: 'error',
        message: 'Token is missing',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

      // Validate decoded data
      if (!decoded.userId || !decoded.email) {
        logger.warn('Authentication failed: Invalid token payload', {
          ip: req.ip,
          path: req.path
        });
        res.status(401).json({
          status: 'error',
          message: 'Invalid token payload',
          code: 'UNAUTHORIZED'
        });
        return;
      }

      // Check token expiration
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        logger.warn('Authentication failed: Token expired', {
          ip: req.ip,
          path: req.path
        });
        res.status(401).json({
          status: 'error',
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
        return;
      }

      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };

      logger.debug('Authentication successful', {
        userId: decoded.userId,
        email: decoded.email,
        path: req.path
      });

      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        logger.warn('Authentication failed: Token expired', {
          ip: req.ip,
          path: req.path
        });
        res.status(401).json({
          status: 'error',
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
        return;
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        logger.warn('Authentication failed: Invalid token', {
          ip: req.ip,
          path: req.path,
          error: jwtError.message
        });
        res.status(401).json({
          status: 'error',
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
        return;
      }
      logger.error('Authentication failed: Token verification error', {
        ip: req.ip,
        path: req.path,
        error: jwtError
      });
      res.status(401).json({
        status: 'error',
        message: 'Token verification failed',
        code: 'UNAUTHORIZED'
      });
      return;
    }
  } catch (error) {
    // Log unexpected errors
    logger.error('Unexpected authentication error', {
      ip: req.ip,
      path: req.path,
      error
    });
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed',
      code: 'INTERNAL_SERVER_ERROR'
    });
    return;
  }
}; 