import { createBudgetCategorySchema, updateBudgetCategorySchema } from '../budget';

describe('Budget Validations', () => {
  describe('createBudgetCategorySchema', () => {
    it('accepts valid category input', () => {
      const result = createBudgetCategorySchema.safeParse({
        name: 'Catering & Beverages',
        planned_amount: 5000,
        actual_amount: 2500,
        notes: 'Includes buffet dinner and bar service',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Catering & Beverages');
        expect(result.data.planned_amount).toBe(5000);
        expect(result.data.actual_amount).toBe(2500);
      }
    });

    it('defaults actual_amount to 0 if omitted', () => {
      const result = createBudgetCategorySchema.safeParse({
        name: 'Venue Rental',
        planned_amount: 8000,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.actual_amount).toBe(0);
        expect(result.data.notes).toBe('');
      }
    });

    it('rejects empty name', () => {
      const result = createBudgetCategorySchema.safeParse({
        name: '   ',
        planned_amount: 1000,
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative planned amount', () => {
      const result = createBudgetCategorySchema.safeParse({
        name: 'Floral',
        planned_amount: -50,
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative actual amount', () => {
      const result = createBudgetCategorySchema.safeParse({
        name: 'Photography',
        planned_amount: 1000,
        actual_amount: -200,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateBudgetCategorySchema', () => {
    it('accepts partial updates', () => {
      const result = updateBudgetCategorySchema.safeParse({
        actual_amount: 3200,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid partial update', () => {
      const result = updateBudgetCategorySchema.safeParse({
        planned_amount: -10,
      });
      expect(result.success).toBe(false);
    });
  });
});
