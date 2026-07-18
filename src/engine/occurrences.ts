import type { Frequency, TargetMonth } from '../types/budget';

/**
 * Number of days in a given target month. Handles leap years via JS Date's
 * day-0-of-next-month trick (day 0 rolls back to the last day of this month).
 */
export function daysInMonth(month: TargetMonth): number {
  // `month.month` is 1-based; passing it as the (0-based) month index of Date
  // actually points at the *next* month, and day 0 is the last day of ours.
  return new Date(month.year, month.month, 0).getDate();
}

/**
 * How many times a purchase of the given frequency occurs in the target month.
 *
 * - daily   → the number of days in the month (28–31)
 * - weekly  → ceil(daysInMonth / 7), so a partial week is still fully funded
 * - monthly → 1
 */
export function occurrences(frequency: Frequency, month: TargetMonth): number {
  switch (frequency) {
    case 'daily':
      return daysInMonth(month);
    case 'weekly':
      return Math.ceil(daysInMonth(month) / 7);
    case 'monthly':
      return 1;
  }
}
