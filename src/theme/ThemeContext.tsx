/**
 * ThemeContext — provides color tokens based on the active mode.
 *
 * Default mode: 'dark' (Kinetic Command)
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import { colors, darkColors } from './tokens';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primary_container: string;
  on_primary: string;
  on_primary_container?: string;
  secondary: string;
  secondary_container: string;
  on_secondary?: string;
  on_secondary_container?: string;
  tertiary: string;
  tertiary_container: string;
  on_tertiary?: string;
  surface: string;
  surface_container_lowest: string;
  surface_container_low: string;
  surface_container: string;
  surface_container_high: string;
  surface_container_highest: string;
  on_surface: string;
  error: string;
  error_container?: string;
  outline: string;
  outline_variant: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const themeColors = useMemo<ThemeColors>(() => {
    if (mode === 'dark') {
      return {
        primary: darkColors.primary,
        primary_container: darkColors.primary_container,
        on_primary: darkColors.on_primary,
        on_primary_container: darkColors.on_primary_container,
        secondary: darkColors.secondary,
        secondary_container: darkColors.secondary_container,
        on_secondary: darkColors.on_secondary,
        on_secondary_container: darkColors.on_secondary_container,
        tertiary: darkColors.tertiary,
        tertiary_container: darkColors.tertiary_container,
        on_tertiary: darkColors.on_tertiary,
        surface: darkColors.surface,
        surface_container_lowest: darkColors.surface_container_lowest,
        surface_container_low: darkColors.surface_container_low,
        surface_container: darkColors.surface_container,
        surface_container_high: darkColors.surface_container_high,
        surface_container_highest: darkColors.surface_container_highest,
        on_surface: darkColors.on_surface,
        error: darkColors.error,
        error_container: darkColors.error_container,
        outline: darkColors.outline,
        outline_variant: darkColors.outline_variant,
      };
    }
    return {
      primary: colors.primary,
      primary_container: colors.primary_container,
      on_primary: colors.on_primary,
      secondary: colors.secondary,
      secondary_container: colors.secondary_container,
      tertiary: colors.tertiary,
      tertiary_container: colors.tertiary_container,
      surface: colors.surface,
      surface_container_lowest: colors.surface_container_lowest,
      surface_container_low: colors.surface_container_low,
      surface_container: colors.surface_container,
      surface_container_high: colors.surface_container_high,
      surface_container_highest: colors.surface_container_highest,
      on_surface: colors.on_surface,
      error: colors.error,
      outline: colors.outline,
      outline_variant: colors.outline_variant,
    };
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, colors: themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

export default ThemeContext;
