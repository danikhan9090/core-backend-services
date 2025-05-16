import { z } from 'zod';

// Form field schema
const formFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['text', 'email', 'number', 'select', 'checkbox', 'radio', 'textarea'], {
    errorMap: () => ({ message: 'Invalid field type' })
  }),
  required: z.boolean(),
  options: z.array(z.string()).optional()
});

// Create form schema
export const createFormSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    fields: z.array(formFieldSchema).min(1, 'At least one field is required')
  })
});

// Update form schema
export const updateFormSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Form ID is required')
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    fields: z.array(formFieldSchema).min(1, 'At least one field is required')
  })
});

// Get form schema
export const getFormSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Form ID is required')
  })
});

// Delete form schema
export const deleteFormSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Form ID is required')
  })
}); 