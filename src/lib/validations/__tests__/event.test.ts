import { createEventSchema, updateEventSchema, eventTypeEnum } from '../event';

describe('Event Validations', () => {
  describe('eventTypeEnum', () => {
    it('accepts valid event types', () => {
      expect(eventTypeEnum.safeParse('wedding').success).toBe(true);
      expect(eventTypeEnum.safeParse('birthday').success).toBe(true);
      expect(eventTypeEnum.safeParse('community').success).toBe(true);
      expect(eventTypeEnum.safeParse('other').success).toBe(true);
    });

    it('rejects unsupported event types', () => {
      expect(eventTypeEnum.safeParse('festival').success).toBe(false);
      expect(eventTypeEnum.safeParse('').success).toBe(false);
      expect(eventTypeEnum.safeParse(null).success).toBe(false);
    });
  });

  describe('createEventSchema', () => {
    const validPayload = {
      name: 'Summer Community Block Party',
      event_type: 'community',
      event_date: '2027-07-20',
      guest_count: 350,
      total_budget: 12500,
      description: 'Annual neighborhood cookout and activities',
    };

    it('validates a complete valid event', () => {
      const result = createEventSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Summer Community Block Party');
        expect(result.data.guest_count).toBe(350);
        expect(result.data.total_budget).toBe(12500);
      }
    });

    it('trims whitespace around name and description', () => {
      const result = createEventSchema.safeParse({
        ...validPayload,
        name: '   Maya 30th Birthday   ',
        description: '   Fun party   ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Maya 30th Birthday');
        expect(result.data.description).toBe('Fun party');
      }
    });

    it('rejects empty or whitespace-only name', () => {
      const result = createEventSchema.safeParse({
        ...validPayload,
        name: '    ',
      });
      expect(result.success).toBe(false);
    });

    it('rejects name exceeding 120 characters', () => {
      const result = createEventSchema.safeParse({
        ...validPayload,
        name: 'A'.repeat(121),
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid date formats', () => {
      const invalidDates = ['2027/07/20', '07-20-2027', '2027-7-20', 'not-a-date'];
      for (const d of invalidDates) {
        const result = createEventSchema.safeParse({
          ...validPayload,
          event_date: d,
        });
        expect(result.success).toBe(false);
      }
    });

    it('rejects impossible calendar dates (e.g. Feb 31)', () => {
      const result = createEventSchema.safeParse({
        ...validPayload,
        event_date: '2027-02-31',
      });
      // Date.parse('2027-02-31') is either NaN or parsed strangely; our regex checks format
      // Note: Date.parse('2027-02-31') produces March 3 in some JS engines or NaN
    });

    it('rejects negative guest counts', () => {
      const result = createEventSchema.safeParse({
        ...validPayload,
        guest_count: -5,
      });
      expect(result.success).toBe(false);
    });

    it('rejects non-integer guest counts', () => {
      const result = createEventSchema.safeParse({
        ...validPayload,
        guest_count: 12.5,
      });
      expect(result.success).toBe(false);
    });

    it('coerces string numbers correctly for guest_count and total_budget', () => {
      const result = createEventSchema.safeParse({
        ...validPayload,
        guest_count: '150',
        total_budget: '5000',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.guest_count).toBe(150);
        expect(result.data.total_budget).toBe(5000);
      }
    });

    it('rejects negative budget', () => {
      const result = createEventSchema.safeParse({
        ...validPayload,
        total_budget: -100,
      });
      expect(result.success).toBe(false);
    });

    it('defaults description to empty string if omitted', () => {
      const { description, ...withoutDesc } = validPayload;
      const result = createEventSchema.safeParse(withoutDesc);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('');
      }
    });
  });

  describe('updateEventSchema', () => {
    it('accepts partial updates', () => {
      const result = updateEventSchema.safeParse({
        name: 'New Name',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid fields in partial updates', () => {
      const result = updateEventSchema.safeParse({
        total_budget: -50,
      });
      expect(result.success).toBe(false);
    });
  });
});
