import { parseNumericId, parseNestedNumericIds } from '../api-utils';

describe('api-utils', () => {
  describe('parseNumericId', () => {
    it('returns positive integer for valid number strings', () => {
      expect(parseNumericId('1')).toBe(1);
      expect(parseNumericId('42')).toBe(42);
      expect(parseNumericId('999999')).toBe(999999);
    });

    it('returns null for non-positive or zero values', () => {
      expect(parseNumericId('0')).toBeNull();
      expect(parseNumericId('-1')).toBeNull();
      expect(parseNumericId('-42')).toBeNull();
    });

    it('returns null for decimal strings or non-integers', () => {
      expect(parseNumericId('3.14')).toBeNull();
      expect(parseNumericId('0.5')).toBeNull();
    });

    it('returns null for non-numeric strings', () => {
      expect(parseNumericId('abc')).toBeNull();
      expect(parseNumericId('12abc')).toBeNull();
      expect(parseNumericId('')).toBeNull();
    });

    it('returns null for undefined or null values', () => {
      expect(parseNumericId(undefined)).toBeNull();
      expect(parseNumericId(null)).toBeNull();
    });
  });

  describe('parseNestedNumericIds', () => {
    it('returns tuple of parsed IDs when both are valid positive integers', () => {
      expect(parseNestedNumericIds('10', '20')).toEqual([10, 20]);
      expect(parseNestedNumericIds('1', '999')).toEqual([1, 999]);
    });

    it('returns null if either parameter is invalid', () => {
      expect(parseNestedNumericIds('10', 'invalid')).toBeNull();
      expect(parseNestedNumericIds('invalid', '20')).toBeNull();
      expect(parseNestedNumericIds('0', '20')).toBeNull();
      expect(parseNestedNumericIds('10', '-5')).toBeNull();
      expect(parseNestedNumericIds(undefined, '20')).toBeNull();
      expect(parseNestedNumericIds('10', null)).toBeNull();
    });
  });
});
