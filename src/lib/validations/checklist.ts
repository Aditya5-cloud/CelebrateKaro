import { z } from 'zod';

export const createChecklistItemSchema = z.object({
  task: z
    .string()
    .trim()
    .min(1, 'Task description is required')
    .max(250, 'Task description must be 250 characters or fewer'),
  category: z
    .string()
    .trim()
    .max(50, 'Category must be 50 characters or fewer')
    .default('general'),
  completed: z.boolean().default(false),
  ai_generated: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
});

export const updateChecklistItemSchema = createChecklistItemSchema.partial();

export const generateChecklistSchema = z.object({
  focus: z
    .string()
    .trim()
    .max(200, 'Focus instructions must be 200 characters or fewer')
    .optional()
    .default(''),
  replaceExisting: z.boolean().optional().default(false),
});

export type CreateChecklistItemSchemaInput = z.input<typeof createChecklistItemSchema>;
export type UpdateChecklistItemSchemaInput = z.input<typeof updateChecklistItemSchema>;
export type GenerateChecklistSchemaInput = z.infer<typeof generateChecklistSchema>;
