import type { Preset } from './types/budget';
import { DEFAULT_THEME, isThemeKey, type ThemeKey } from './themes';

/**
 * Local persistence — no backend, no database. Everything lives on the user's
 * own machine via the browser's localStorage, with a JSON file as a portable
 * backup they fully own.
 */

const KEY = 'autong.state.v1';
const THEME_KEY = 'autong.theme';
const FILE_VERSION = 1;

export interface PersistedState {
  preset: Preset;
  income: number;
}

/** Read saved state from localStorage, or null if there's nothing valid yet. */
export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || !parsed.preset || !Array.isArray(parsed.preset.components)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Write state to localStorage. Called on every change (cheap, synchronous). */
export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (e.g. private mode) — fail quietly; the JSON
    // export remains the durable fallback.
  }
}

/**
 * Theme is a per-device display preference, stored separately from the budget
 * so it doesn't travel with exported/imported budget files. Stored as a raw
 * key string so the no-FOUC inline script in index.html can read it directly.
 */
export function loadTheme(): ThemeKey {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return isThemeKey(v) ? v : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(theme: ThemeKey): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // fail quietly (private mode / storage blocked)
  }
}

/** Trigger a download of the current state as a .json file the user can keep. */
export function exportToFile(state: PersistedState): void {
  const payload = {
    app: 'autong',
    version: FILE_VERSION,
    exportedAt: new Date().toISOString(),
    ...state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `autong-budget-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse an imported file's text back into state, or throw if it's not ours. */
export function parseImportedFile(text: string): PersistedState {
  const data = JSON.parse(text);
  const preset = data?.preset;
  if (!preset || !Array.isArray(preset.components)) {
    throw new Error('That file does not look like an Autong budget.');
  }
  return { preset, income: Number(data.income) || 0 };
}
