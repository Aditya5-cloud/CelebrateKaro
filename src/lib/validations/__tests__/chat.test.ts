import { sendChatMessageSchema } from '../chat';

describe('Chat Message Validation', () => {
  it('validates a proper chat message', () => {
    const result = sendChatMessageSchema.safeParse({
      message: 'What vendors should I prioritize booking for my wedding?',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe('What vendors should I prioritize booking for my wedding?');
    }
  });

  it('rejects empty or whitespace-only messages', () => {
    const result = sendChatMessageSchema.safeParse({ message: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects messages over 2000 characters', () => {
    const longMsg = 'x'.repeat(2001);
    const result = sendChatMessageSchema.safeParse({ message: longMsg });
    expect(result.success).toBe(false);
  });
});
