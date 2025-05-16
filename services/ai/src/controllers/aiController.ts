import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '@backend-services/shared';
import { aiService } from '../services/aiService';
import { generateCompletionSchema, generateImageSchema } from '../validations/ai';

export const generateCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prompt } = generateCompletionSchema.parse(req.body);
    const result = await aiService.generateCompletion(prompt);
    return res.json({ result });
  } catch (error) {
    if (error instanceof Error) {
      return next(new BadRequestError(error.message));
    }
    return next(error);
  }
};

export const generateImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prompt } = generateImageSchema.parse(req.body);
    const imageUrl = await aiService.generateImage(prompt);
    return res.json({ imageUrl });
  } catch (error) {
    if (error instanceof Error) {
      return next(new BadRequestError(error.message));
    }
    return next(error);
  }
}; 