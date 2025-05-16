import { z } from 'zod';
import { getConfig } from '@backend-services/shared';

const config = getConfig();
const { priorityLevels, statusOptions } = config.task;

// Base task schema
const taskBaseSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters long'),
  priority: z.enum(['low', 'medium', 'high'] as const, {
    errorMap: () => ({ message: `Priority must be one of: ${priorityLevels}` })
  }),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'] as const, {
    errorMap: () => ({ message: `Status must be one of: ${statusOptions}` })
  }),
  dueDate: z.string()
    .transform((str) => new Date(str))
    .refine((date) => date > new Date(), {
      message: 'Due date must be in the future'
    }),
  assignedTo: z.string().min(1, 'Assignee is required'),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional()
});

// Create task schema
export const createTaskSchema = z.object({
  body: taskBaseSchema
});

// Update task schema
export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().min(1, 'Task ID is required')
  }),
  body: taskBaseSchema.partial()
});

// Get task schema
export const getTaskSchema = z.object({
  params: z.object({
    taskId: z.string().min(1, 'Task ID is required')
  })
});

// Delete task schema
export const deleteTaskSchema = z.object({
  params: z.object({
    taskId: z.string().min(1, 'Task ID is required')
  })
});

// List tasks schema
export const listTasksSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'] as const).optional(),
    priority: z.enum(['low', 'medium', 'high'] as const).optional(),
    assignedTo: z.string().optional(),
    createdBy: z.string().optional(),
    sortBy: z.enum(['dueDate', 'priority', 'status', 'createdAt']).default('dueDate'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    search: z.string().optional()
  })
});

// Add comment schema
export const addCommentSchema = z.object({
  params: z.object({
    taskId: z.string().min(1, 'Task ID is required')
  }),
  body: z.object({
    text: z.string().min(1, 'Comment text is required')
  })
});

// Update comment schema
export const updateCommentSchema = z.object({
  params: z.object({
    taskId: z.string().min(1, 'Task ID is required'),
    commentId: z.string().min(1, 'Comment ID is required')
  }),
  body: z.object({
    text: z.string().min(1, 'Comment text is required')
  })
});

// Delete comment schema
export const deleteCommentSchema = z.object({
  params: z.object({
    taskId: z.string().min(1, 'Task ID is required'),
    commentId: z.string().min(1, 'Comment ID is required')
  })
}); 