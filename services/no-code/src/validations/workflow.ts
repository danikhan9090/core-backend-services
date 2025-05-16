import { z } from 'zod';

export const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  steps: z.array(
    z.object({
      name: z.string().min(1, 'Step name is required'),
      action: z.string().min(1, 'Action is required'),
      config: z.record(z.any()),
    })
  ),
  triggers: z.array(
    z.object({
      type: z.string().min(1, 'Trigger type is required'),
      config: z.record(z.any()),
    })
  ),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  steps: z.array(
    z.object({
      name: z.string().min(1),
      action: z.string().min(1),
      config: z.record(z.any()),
    })
  ).optional(),
  triggers: z.array(
    z.object({
      type: z.string().min(1),
      config: z.record(z.any()),
    })
  ).optional(),
}); 