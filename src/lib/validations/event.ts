import { z } from 'zod';

export const eventTypeEnum = z.enum(['wedding', 'birthday', 'community', 'other'], {
  message: 'Event type must be wedding, birthday, community, or other',
});

// ISO date string format (YYYY-MM-DD)
const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const createEventSchema = z.object({
  user_id: z.string().trim().optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Event name cannot be empty')
    .max(120, 'Event name must be 120 characters or fewer'),
  event_type: eventTypeEnum,
  event_date: z
    .string()
    .regex(dateRegex, 'Event date must be in YYYY-MM-DD format')
    .refine((val) => !isNaN(Date.parse(val)), 'Event date must be a valid calendar date'),
  guest_count: z.coerce
    .number()
    .int('Guest count must be a whole number')
    .min(0, 'Guest count cannot be negative')
    .max(500000, 'Guest count must be realistic (500,000 max)'),
  // Budget supplied in dollars (e.g., 5000 or 5000.50); converted to cents by service layer
  total_budget: z.coerce
    .number()
    .min(0, 'Total budget cannot be negative')
    .max(100000000, 'Total budget cannot exceed $100,000,000'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must be 2,000 characters or fewer')
    .default(''),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventSchemaInput = z.infer<typeof createEventSchema>;
export type UpdateEventSchemaInput = z.infer<typeof updateEventSchema>;

