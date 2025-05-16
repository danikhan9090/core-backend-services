import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { BadRequestError, UnauthorizedError } from '@backend-services/shared';
import { registerSchema, loginSchema } from '../validations/auth';
import config from '../config';
import { ZodError } from 'zod';

interface AuthTokenPayload {
  userId: string;
  role: string;
}

// Helper function to format Zod validation errors
const formatZodError = (error: ZodError) => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
};

// Helper function to ensure expiresIn is in correct format
const getExpiresIn = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Convert time string to seconds
    const match = value.match(/^(\d+)([hdm])$/);
    if (match) {
      const [, num, unit] = match;
      const multiplier = unit === 'h' ? 3600 : unit === 'm' ? 60 : 1;
      return parseInt(num, 10) * multiplier;
    }
    // Try to convert to number
    const num = parseInt(value, 10);
    return isNaN(num) ? 86400 : num;
  }
  return 86400; // Default to 24 hours in seconds
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, role } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email already registered');
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      role,
    });

    res.status(201).json({
      message: 'Registration successful',
      userId: user._id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = formatZodError(error);
      return res.status(400).json({
        message: 'Validation failed',
        errors: formattedErrors
      });
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate JWT token
    const payload: AuthTokenPayload = {
      userId: user._id.toString(),
      role: user.role
    };
    const options: SignOptions = { 
      expiresIn: getExpiresIn(config.jwt.expiresIn)
    };
    
    const token = jwt.sign(
      payload,
      config.jwt.secret,
      options
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = formatZodError(error);
      return res.status(400).json({
        message: 'Validation failed',
        errors: formattedErrors
      });
    }
    next(error);
  }
}; 