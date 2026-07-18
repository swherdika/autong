import meal from './assets/icons/meal.svg';
import coffee from './assets/icons/coffee.svg';
import transport from './assets/icons/transport.svg';
import bills from './assets/icons/bills.svg';
import house from './assets/icons/house.svg';
import dumbbell from './assets/icons/dumbbell.svg';
import shopping from './assets/icons/shopping.svg';
import heart from './assets/icons/heart.svg';
import music from './assets/icons/music.svg';
import gift from './assets/icons/gift.svg';
import piggy from './assets/icons/piggy.svg';
import plane from './assets/icons/plane.svg';
import book from './assets/icons/book.svg';
import pocket from './assets/icons/pocket.svg';
import type { IconKey } from './types/budget';

export const DEFAULT_ICON: IconKey = 'pocket';

/** Ordered for the picker grid; `pocket` is the neutral fallback, shown last. */
export const ICONS: { key: IconKey; src: string }[] = [
  { key: 'meal', src: meal },
  { key: 'coffee', src: coffee },
  { key: 'transport', src: transport },
  { key: 'bills', src: bills },
  { key: 'house', src: house },
  { key: 'dumbbell', src: dumbbell },
  { key: 'shopping', src: shopping },
  { key: 'heart', src: heart },
  { key: 'music', src: music },
  { key: 'gift', src: gift },
  { key: 'piggy', src: piggy },
  { key: 'plane', src: plane },
  { key: 'book', src: book },
  { key: 'pocket', src: pocket },
];

const byKey = new Map(ICONS.map((i) => [i.key, i.src]));

export function iconSrc(key: IconKey | undefined): string {
  return (key && byKey.get(key)) || byKey.get(DEFAULT_ICON)!;
}
