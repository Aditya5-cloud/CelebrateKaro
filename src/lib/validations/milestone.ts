import { z } from 'zod';

const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const createMilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Milestone title is required')
    .max(120, 'Title must be 120 characters or fewer'),
  due_date: z
    .string()
    .regex(dateRegex, 'Due date must be in YYYY-MM-DD format')
    .refine((val) => !isNaN(Date.parse(val)), 'Due date must be a valid calendar date'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be 1,000 characters or fewer')
    .default(''),
  completed: z.boolean().default(false),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();

export type CreateMilestoneSchemaInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneSchemaInput = z.infer<typeof updateMilestoneSchema>;
