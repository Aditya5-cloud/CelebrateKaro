import { z } from 'zod';

export const standardBudgetCategories = [
  'Venue & Rentals',
  'Catering & Food',
  'Beverages & Bar',
  'Photography & Video',
  'Music & Entertainment',
  'Decorations & Floral',
  'Attire & Styling',
  'Invitations & Marketing',
  'Permits & Security',
  'Activities & Favors',
  'Miscellaneous & Contingency',
] as const;

export const createBudgetCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(80, 'Category name must be 80 characters or fewer'),
  planned_amount: z.coerce
    .number()
    .min(0, 'Planned amount cannot be negative')
    .max(100000000, 'Planned amount exceeds maximum allowable limit'),
  actual_amount: z.coerce
    .number()
    .min(0, 'Actual amount cannot be negative')
    .max(100000000, 'Actual amount exceeds maximum allowable limit')
    .default(0),
  notes: z
    .string()
    .trim()
    .max(500, 'Notes must be 500 characters or fewer')
    .default(''),
});

export const updateBudgetCategorySchema = createBudgetCategorySchema.partial();

export type CreateBudgetCategorySchemaInput = z.infer<typeof createBudgetCategorySchema>;
export type UpdateBudgetCategorySchemaInput = z.infer<typeof updateBudgetCategorySchema>;
