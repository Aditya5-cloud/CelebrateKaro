import { createVendorSchema, updateVendorSchema, vendorStatusEnum } from '../vendor';

describe('Vendor Validations', () => {
  describe('vendorStatusEnum', () => {
    it('accepts all valid vendor lifecycle statuses', () => {
      expect(vendorStatusEnum.safeParse('considering').success).toBe(true);
      expect(vendorStatusEnum.safeParse('contacted').success).toBe(true);
      expect(vendorStatusEnum.safeParse('booked').success).toBe(true);
      expect(vendorStatusEnum.safeParse('paid').success).toBe(true);
      expect(vendorStatusEnum.safeParse('cancelled').success).toBe(true);
    });

    it('rejects unsupported statuses', () => {
      expect(vendorStatusEnum.safeParse('unknown').success).toBe(false);
      expect(vendorStatusEnum.safeParse('done').success).toBe(false);
    });
  });

  describe('createVendorSchema', () => {
    it('validates a complete vendor profile', () => {
      const result = createVendorSchema.safeParse({
        name: 'Grand Horizon Ballroom',
        category: 'venue',
        status: 'booked',
        contact_name: 'Sarah Jenkins',
        contact_email: 'sarah@grandhorizon.com',
        contact_phone: '+1 (555) 234-5678',
        price_quote: 6500,
        notes: 'Deposit paid; includes tables and chairs',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Grand Horizon Ballroom');
        expect(result.data.status).toBe('booked');
        expect(result.data.price_quote).toBe(6500);
      }
    });

    it('defaults status to considering and price_quote to 0', () => {
      const result = createVendorSchema.safeParse({
        name: 'Sound Wave DJs',
        category: 'music',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('considering');
        expect(result.data.price_quote).toBe(0);
      }
    });

    it('rejects empty name', () => {
      const result = createVendorSchema.safeParse({
        name: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email address', () => {
      const result = createVendorSchema.safeParse({
        name: 'Joe Caterers',
        contact_email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('accepts empty string for contact_email', () => {
      const result = createVendorSchema.safeParse({
        name: 'Joe Caterers',
        contact_email: '',
      });
      expect(result.success).toBe(true);
    });

    it('rejects negative price quote', () => {
      const result = createVendorSchema.safeParse({
        name: 'Joe Caterers',
        price_quote: -100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateVendorSchema', () => {
    it('accepts partial status updates', () => {
      const result = updateVendorSchema.safeParse({
        status: 'paid',
        price_quote: 4500,
      });
      expect(result.success).toBe(true);
    });
  });
});
