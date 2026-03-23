/**
 * Zustand store — Theme Preference
 *
 * Persists user's theme choice (light/dark/system) in AsyncStorage.
 * Hydrates before any UI renders to prevent theme flash.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const STORAGE_KEY = '@duke_theme_mode';

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
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  isHydrated: false,
  resolvedTheme: resolveTheme('system'),

  setMode: async (mode: ThemeMode) => {
    set({ mode, resolvedTheme: resolveTheme(mode) });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to persist theme mode:', error);
    }
  },

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
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
