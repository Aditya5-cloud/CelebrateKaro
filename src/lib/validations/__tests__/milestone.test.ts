import { createMilestoneSchema, updateMilestoneSchema } from '../milestone';

describe('Milestone Validations', () => {
  describe('createMilestoneSchema', () => {
    it('validates a complete valid milestone', () => {
      const result = createMilestoneSchema.safeParse({
        title: 'Book Photography & Videography',
        due_date: '2027-05-01',
        description: 'Review portfolios and sign agreement',
        completed: false,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Book Photography & Videography');
        expect(result.data.due_date).toBe('2027-05-01');
        expect(result.data.completed).toBe(false);
      }
    });

    it('defaults completed to false and description to empty string', () => {
      const result = createMilestoneSchema.safeParse({
        title: 'Send Save the Dates',
        due_date: '2027-03-15',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.completed).toBe(false);
        expect(result.data.description).toBe('');
      }
    });

    it('rejects empty title', () => {
      const result = createMilestoneSchema.safeParse({
        title: '   ',
        due_date: '2027-03-15',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid date format', () => {
      const result = createMilestoneSchema.safeParse({
        title: 'Order Cake',
        due_date: '03-15-2027',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateMilestoneSchema', () => {
    it('accepts partial updates such as toggling completed', () => {
      const result = updateMilestoneSchema.safeParse({
        completed: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.completed).toBe(true);
      }
    });
  });
});
