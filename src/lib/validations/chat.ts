import { z } from 'zod';

export const sendChatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be 2,000 characters or fewer'),
  userName: z.string().trim().optional(),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
