import {
  createChecklistItemSchema,
  updateChecklistItemSchema,
  generateChecklistSchema,
} from '../checklist';

describe('Checklist Validation Schemas', () => {
  it('validates a correct checklist item', () => {
    const input = {
      task: 'Book floral designer for table centerpieces',
      category: 'decor',
      completed: false,
      ai_generated: true,
    };

    const result = createChecklistItemSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.task).toBe('Book floral designer for table centerpieces');
      expect(result.data.category).toBe('decor');
      expect(result.data.completed).toBe(false);
      expect(result.data.ai_generated).toBe(true);
    }
  });

  it('rejects empty or whitespace-only task description', () => {
    const result = createChecklistItemSchema.safeParse({
      task: '   ',
    });
    expect(result.success).toBe(false);
  });

  it('rejects tasks exceeding 250 characters', () => {
    const longTask = 'A'.repeat(251);
    const result = createChecklistItemSchema.safeParse({
      task: longTask,
    });
    expect(result.success).toBe(false);
  });

  it('validates generateChecklistSchema with defaults', () => {
    const emptyResult = generateChecklistSchema.safeParse({});
    expect(emptyResult.success).toBe(true);
    if (emptyResult.success) {
      expect(emptyResult.data.focus).toBe('');
      expect(emptyResult.data.replaceExisting).toBe(false);
    }

    const customResult = generateChecklistSchema.safeParse({
      focus: 'Eco-friendly and sustainable decor',
      replaceExisting: true,
    });
    expect(customResult.success).toBe(true);
    if (customResult.success) {
      expect(customResult.data.focus).toBe('Eco-friendly and sustainable decor');
      expect(customResult.data.replaceExisting).toBe(true);
    }
  });
});
