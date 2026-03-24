/**
 * Zustand store — Theme Preference
 *
 * Persists user's theme choice (light/dark/system) in localStorage.
 * On web, next-themes handles the actual theming — this store tracks the preference.
 */

import { create } from 'zustand';

const STORAGE_KEY = 'duke_theme_mode';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  isHydrated: boolean;

  /** Resolved theme based on mode + system preference */
  resolvedTheme: 'light' | 'dark';

  setMode: (mode: ThemeMode) => Promise<void>;
  hydrate: () => Promise<void>;
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return mode;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  isHydrated: false,
  resolvedTheme: resolveTheme('system'),

  setMode: async (mode: ThemeMode) => {
    set({ mode, resolvedTheme: resolveTheme(mode) });
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to persist theme mode:', error);
    }
  },

  hydrate: async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        set({
          mode: stored,
          resolvedTheme: resolveTheme(stored),
          isHydrated: true,
        });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      console.error('Failed to hydrate theme:', error);
      set({ isHydrated: true });
    }
  },
}));
