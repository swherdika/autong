import { describe, expect, it } from 'vitest';
import type { Component, Item, Preset, TargetMonth } from '../types/budget';
import { componentTotal, itemNeed, monthlyTotal, remaining } from './totals';

const aug2026: TargetMonth = { year: 2026, month: 8 }; // 31 days, weekly → 5

const item = (over: Partial<Item> = {}): Item => ({
  id: 'i',
  name: 'item',
  amount: 0,
  frequency: 'monthly',
  ...over,
});

describe('itemNeed', () => {
  it('daily meals: Rp60,000 × 31 days = Rp1,860,000', () => {
    expect(itemNeed(item({ amount: 60_000, frequency: 'daily' }), aug2026)).toBe(
      1_860_000,
    );
  });

  it('weekly laundry: Rp50,000 × ceil(31/7)=5 = Rp250,000', () => {
    expect(itemNeed(item({ amount: 50_000, frequency: 'weekly' }), aug2026)).toBe(
      250_000,
    );
  });

  it('monthly electricity: Rp300,000 × 1 = Rp300,000', () => {
    expect(
      itemNeed(item({ amount: 300_000, frequency: 'monthly' }), aug2026),
    ).toBe(300_000);
  });
});

describe('componentTotal', () => {
  it('sums the needs of its items', () => {
    const meals: Component = {
      id: 'c1',
      name: 'Meals',
      items: [
        item({ amount: 60_000, frequency: 'daily' }), // 1,860,000
        item({ amount: 25_000, frequency: 'weekly' }), //   125,000
      ],
    };
    expect(componentTotal(meals, aug2026)).toBe(1_985_000);
  });

  it('is 0 for a component with no items', () => {
    expect(componentTotal({ id: 'c', name: 'Empty', items: [] }, aug2026)).toBe(0);
  });
});

describe('monthlyTotal', () => {
  const preset: Preset = {
    id: 'p',
    name: 'My Budget',
    components: [
      {
        id: 'c1',
        name: 'Meals',
        items: [item({ amount: 60_000, frequency: 'daily' })], // 1,860,000
      },
      {
        id: 'c2',
        name: 'Bills',
        items: [item({ amount: 300_000, frequency: 'monthly' })], //  300,000
      },
    ],
  };

  it('sums every component total', () => {
    expect(monthlyTotal(preset, aug2026)).toBe(2_160_000);
  });

  it('is 0 for an empty preset', () => {
    expect(
      monthlyTotal({ id: 'p', name: 'Empty', components: [] }, aug2026),
    ).toBe(0);
  });
});

describe('remaining', () => {
  it('reports a surplus when income exceeds the plan', () => {
    expect(remaining(2_160_000, 5_000_000)).toBe(2_840_000);
  });

  it('reports a shortfall (negative) when the plan exceeds income', () => {
    expect(remaining(6_000_000, 5_000_000)).toBe(-1_000_000);
  });

  it('is 0 when income exactly covers the plan', () => {
    expect(remaining(5_000_000, 5_000_000)).toBe(0);
  });
});
