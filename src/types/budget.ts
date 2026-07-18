/**
 * Domain types for Autong.
 *
 * These describe a budget as the user thinks about it: a named preset holding
 * spending components, each component holding recurring purchase items.
 *
 * All money values are integer Rupiah (IDR has no sub-unit in practice), which
 * keeps the arithmetic free of floating-point rounding errors.
 */

/** How often a purchase recurs within a month. */
export type Frequency = 'daily' | 'weekly' | 'monthly';

/** Key of a pocket's doodle icon. The registry lives in icons.ts. */
export type IconKey =
  | 'meal'
  | 'coffee'
  | 'transport'
  | 'bills'
  | 'house'
  | 'dumbbell'
  | 'shopping'
  | 'heart'
  | 'music'
  | 'gift'
  | 'piggy'
  | 'plane'
  | 'book'
  | 'pocket';

/** A single recurring purchase, e.g. "lunch" at Rp60,000 daily. */
export interface Item {
  id: string;
  name: string;
  /** Cost of one occurrence, in integer Rupiah. */
  amount: number;
  frequency: Frequency;
}

/** A spending category, e.g. "Daily Meals", holding related items. */
export interface Component {
  id: string;
  name: string;
  /** Key of the doodle icon shown for this pocket (see icons.ts). */
  icon?: IconKey;
  items: Item[];
}

/** A named, saveable budget. One install can hold several. */
export interface Preset {
  id: string;
  name: string;
  components: Component[];
}

/**
 * The month a plan targets. `month` is 1-based (1 = January .. 12 = December)
 * to match how humans say it; conversions to JS Date's 0-based month happen
 * inside the engine.
 */
export interface TargetMonth {
  year: number;
  /** 1-based month, 1..12. */
  month: number;
}
