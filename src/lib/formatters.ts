/**
 * Formatting utilities for currency, dates, and intervals.
 */

import { fromCents } from './currency';

/**
 * Format cents into a clean Indian Rupee string (e.g. 1500000 -> "₹15,000").
 */
export function formatCurrency(cents: number): string {
  const amount = fromCents(cents);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/**
 * Format a YYYY-MM-DD string into a human readable date (e.g. "Saturday, Sep 18, 2027").
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  // Create UTC date to avoid timezone shift
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Return human-readable countdown or status relative to today.
 */
export function getRelativeDays(dateString: string): { label: string; isPast: boolean; days: number } {
  if (!dateString) return { label: '', isPast: false, days: 0 };
  const [year, month, day] = dateString.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1, day));
  
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: 'Today!', isPast: false, days: 0 };
  } else if (diffDays === 1) {
    return { label: 'Tomorrow', isPast: false, days: 1 };
  } else if (diffDays > 1) {
    return { label: `In ${diffDays} days`, isPast: false, days: diffDays };
  } else if (diffDays === -1) {
    return { label: 'Celebrated yesterday', isPast: true, days: -1 };
  } else {
    return { label: `Celebrated (${Math.abs(diffDays)}d ago)`, isPast: true, days: diffDays };
  }
}
