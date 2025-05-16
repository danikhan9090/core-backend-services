import { z } from 'zod';

// URL validation schema
const urlSchema = z.string().url('Invalid URL format');

// Create URL schema
export const createUrlSchema = z.object({
  body: z.object({
    originalUrl: urlSchema,
    expiresIn: z.number().min(1).max(365).optional(), // Expiration in days
    customCode: z.string().min(3).max(20).optional()
  })
});

// Get URL schema
export const getUrlSchema = z.object({
  params: z.object({
    shortCode: z.string().min(1, 'Short code is required')
  })
});

// Update URL schema
export const updateUrlSchema = z.object({
  params: z.object({
    shortCode: z.string().min(1, 'Short code is required')
  }),
  body: z.object({
    originalUrl: urlSchema.optional(),
    expiresIn: z.number().min(1).max(365).optional()
  })
});

// Delete URL schema
export const deleteUrlSchema = z.object({
  params: z.object({
    shortCode: z.string().min(1, 'Short code is required')
  })
});

// List URLs schema
export const listUrlsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
    sortBy: z.enum(['clicks', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  })
});

// URL query schema for filtering
export const urlQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
    sortBy: z.enum(['clicks', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    createdBy: z.string().optional()
  })
}); 