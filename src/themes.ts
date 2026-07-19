/**
 * Colour palettes for the whole-app theme picker. Each theme's actual colour
 * tokens live in index.css under `:root[data-theme="<key>"]`; this module is
 * the list the picker renders and the source of truth for valid keys.
 *
 * `swatch` is the representative paper colour shown as the picker dot.
 */

export type ThemeKey = 'cream' | 'rose' | 'mint' | 'sky';

export interface Theme {
  key: ThemeKey;
  label: string;
  swatch: string;
}

export const THEMES: Theme[] = [
  { key: 'cream', label: 'Cream', swatch: '#f0e3c6' },
  { key: 'rose', label: 'Rosé', swatch: '#f4d6de' },
  { key: 'mint', label: 'Mint', swatch: '#d9ecdb' },
  { key: 'sky', label: 'Sky', swatch: '#d8e6f2' },
];

export const DEFAULT_THEME: ThemeKey = 'cream';

export function isThemeKey(v: unknown): v is ThemeKey {
  return typeof v === 'string' && THEMES.some((t) => t.key === v);
}
