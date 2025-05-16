import { z } from 'zod';

export const generateCompletionSchema = z.object({
  prompt: z.string({
    required_error: 'Prompt is required',
    invalid_type_error: 'Prompt must be a string',
  }).min(1, 'Prompt cannot be empty').trim(),
});

export const generateImageSchema = z.object({
  prompt: z.string({
    required_error: 'Prompt is required',
    invalid_type_error: 'Prompt must be a string',
  }).min(1, 'Prompt cannot be empty').trim(),
}); 