/**
 * Shared API route utilities for request parameter parsing and standardized error handling.
 *
 * This module provides clean, tested helpers for Next.js App Router route handlers.
 */

/**
 * Parse a raw URL route parameter into a positive integer ID.
 * Returns the parsed positive integer, or null if invalid (NaN, non-integer, or <= 0).
 *
 * @param raw - The string route parameter to parse.
 * @returns A positive integer number, or null if the string is invalid or <= 0.
 *
 * @example
 * parseNumericId('42')  // 42
 * parseNumericId('-1')  // null
 * parseNumericId('abc') // null
 * parseNumericId(null)  // null
 */
export function parseNumericId(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

/**
 * Parse two route parameters into a pair of positive integer IDs.
 * Commonly used for nested routes like `/events/[id]/budget/[categoryId]`.
 *
 * @param rawFirst - The first route parameter (e.g. event ID).
 * @param rawSecond - The second route parameter (e.g. child resource ID).
 * @returns A tuple of `[first, second]`, or null if either parameter is invalid.
 */
export function parseNestedNumericIds(
  rawFirst: string | undefined | null,
  rawSecond: string | undefined | null
): [number, number] | null {
  const first = parseNumericId(rawFirst);
  const second = parseNumericId(rawSecond);
  if (first === null || second === null) {
    return null;
  }
  return [first, second];
}
