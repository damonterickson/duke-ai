/**
 * ThemeProvider — wraps the entire app to provide theme-aware tokens.
 *
 * Usage:
 *   const { colors, glass, gradients, glowDrops, ghostBorder, isDark } = useTheme();
 *
 * Hydrates theme store on mount (before children render).
 * Listens to system appearance changes when mode is 'system'.
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Appearance } from 'react-native';
import { useThemeStore } from '../stores/theme';
import {
  lightTokens,
  darkTokens,
  lightGlass,
  darkGlass,
  lightGhostBorder,
  darkGhostBorder,
  lightGradients,
  darkGradients,
  lightGlowDrops,
  darkGlowDrops,
} from './tokens';

// Widened types so light/dark literal values are assignable
type Colors = { [K in keyof typeof lightTokens]: string };
type Glass = { overlayColor: string; blurIntensity: number };
type GhostBorder = { color: string; width: number };
type GradientDef = { colors: readonly string[]; start: { x: number; y: number }; end: { x: number; y: number } };
type Gradients = { primaryCta: GradientDef; secondaryAccent: GradientDef; goldReward: GradientDef };
type GlowDrop = { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number } | undefined;
type GlowDrops = { level0: GlowDrop; level1: GlowDrop; level2: GlowDrop; level3: GlowDrop; gold: GlowDrop };

export interface ThemeContextValue {
  colors: Colors;
  glass: Glass;
  ghostBorder: GhostBorder;
  gradients: Gradients;
  glowDrops: GlowDrops;
  isDark: boolean;
}

const defaultValue: ThemeContextValue = {
  colors: darkTokens,
  glass: darkGlass,
  ghostBorder: darkGhostBorder,
  gradients: darkGradients,
  glowDrops: darkGlowDrops,
  isDark: true,
};

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const hydrate = useThemeStore((s) => s.hydrate);

  // Hydrate on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Listen for system appearance changes when in 'system' mode
  useEffect(() => {
    if (mode !== 'system') return;

    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      useThemeStore.setState({
        resolvedTheme: colorScheme === 'dark' ? 'dark' : 'light',
      });
    });

    return () => listener.remove();
  }, [mode]);

  const isDark = resolvedTheme === 'dark';

  const value = useMemo<ThemeContextValue>(() => ({
    colors: isDark ? darkTokens : lightTokens,
    glass: isDark ? darkGlass : lightGlass,
    ghostBorder: isDark ? darkGhostBorder : lightGhostBorder,
    gradients: isDark ? darkGradients : lightGradients,
    glowDrops: isDark ? darkGlowDrops : lightGlowDrops,
    isDark,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
