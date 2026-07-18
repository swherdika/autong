import { describe, expect, it } from 'vitest';
import type { TargetMonth } from '../types/budget';
import { daysInMonth, occurrences } from './occurrences';

const jan2026: TargetMonth = { year: 2026, month: 1 }; // 31 days
const apr2026: TargetMonth = { year: 2026, month: 4 }; // 30 days
const feb2026: TargetMonth = { year: 2026, month: 2 }; // 28 days (non-leap)
const feb2024: TargetMonth = { year: 2024, month: 2 }; // 29 days (leap)

describe('daysInMonth', () => {
  it('knows 31-day months', () => {
    expect(daysInMonth(jan2026)).toBe(31);
  });

  it('knows 30-day months', () => {
    expect(daysInMonth(apr2026)).toBe(30);
  });

  it('knows a non-leap February', () => {
    expect(daysInMonth(feb2026)).toBe(28);
  });

  it('knows a leap February', () => {
    expect(daysInMonth(feb2024)).toBe(29);
  });
});

describe('occurrences', () => {
  it('daily → number of days in the month', () => {
    expect(occurrences('daily', jan2026)).toBe(31);
    expect(occurrences('daily', apr2026)).toBe(30);
    expect(occurrences('daily', feb2024)).toBe(29);
  });

  it('monthly → always 1', () => {
    expect(occurrences('monthly', jan2026)).toBe(1);
    expect(occurrences('monthly', feb2026)).toBe(1);
  });

  describe('weekly → ceil(daysInMonth / 7)', () => {
    it('rounds a 31-day month (4.43 weeks) up to 5', () => {
      expect(occurrences('weekly', jan2026)).toBe(5);
    });

    it('rounds a 30-day month (4.29 weeks) up to 5', () => {
      expect(occurrences('weekly', apr2026)).toBe(5);
    });

    it('gives exactly 4 for a 28-day February (no rounding needed)', () => {
      expect(occurrences('weekly', feb2026)).toBe(4);
    });

    it('rounds a 29-day February up to 5', () => {
      expect(occurrences('weekly', feb2024)).toBe(5);
    });
  });
});
