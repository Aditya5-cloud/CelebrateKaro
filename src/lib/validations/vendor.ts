import { z } from 'zod';

export const vendorStatusEnum = z.enum(['considering', 'contacted', 'booked', 'paid', 'cancelled'], {
  message: 'Status must be considering, contacted, booked, paid, or cancelled',
});

export const vendorCategoryEnum = z.enum([
  'venue',
  'catering',
  'photography',
  'music',
  'florist',
  'bakery',
  'transportation',
  'decoration',
  'officiant',
  'other',
]);

export const createVendorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Vendor name is required')
    .max(100, 'Vendor name must be 100 characters or fewer'),
  category: z.string().trim().min(1).default('other'),
  status: vendorStatusEnum.default('considering'),
  contact_name: z.string().trim().max(100).default(''),
  contact_email: z
    .string()
    .trim()
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: 'Invalid email address',
    })
    .default(''),
  contact_phone: z.string().trim().max(30).default(''),
  price_quote: z.coerce
    .number()
    .min(0, 'Price quote cannot be negative')
    .max(100000000, 'Price quote exceeds allowable maximum')
    .default(0),
  notes: z.string().trim().max(1000).default(''),
});

export const updateVendorSchema = createVendorSchema.partial();

export type CreateVendorSchemaInput = z.input<typeof createVendorSchema>;
export type UpdateVendorSchemaInput = z.input<typeof updateVendorSchema>;

export const emailTypeEnum = z.enum(['inquiry', 'quote', 'tasting_tour', 'negotiation']);
export const emailToneEnum = z.enum(['professional', 'warm', 'direct']);

export const draftVendorEmailSchema = z.object({
  emailType: emailTypeEnum.default('inquiry'),
  tone: emailToneEnum.default('professional'),
  specificQuestions: z
    .string()
    .trim()
    .max(500, 'Specific questions must be 500 characters or fewer')
    .optional()
    .default(''),
});

export type DraftVendorEmailInput = z.infer<typeof draftVendorEmailSchema>;
