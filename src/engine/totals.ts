import type { Component, Item, Preset, TargetMonth } from '../types/budget';
import { occurrences } from './occurrences';

/** Money one item needs for the month: amount × its occurrences. */
export function itemNeed(item: Item, month: TargetMonth): number {
  return item.amount * occurrences(item.frequency, month);
}

/** Money a component needs: the sum of its items' needs. */
export function componentTotal(component: Component, month: TargetMonth): number {
  return component.items.reduce((sum, item) => sum + itemNeed(item, month), 0);
}

/** The whole budget's monthly need: the sum of every component's total. */
export function monthlyTotal(preset: Preset, month: TargetMonth): number {
  return preset.components.reduce(
    (sum, component) => sum + componentTotal(component, month),
    0,
  );
}

/**
 * What's left after covering the plan.
 * Positive = surplus (can be saved); negative = shortfall (over budget).
 */
export function remaining(monthlyTotal: number, income: number): number {
  return income - monthlyTotal;
}
