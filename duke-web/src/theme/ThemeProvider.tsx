'use client';

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { createContext, useContext } from 'react';
import {
  lightTokens,
  darkTokens,
  lightGlass,
  darkGlass,
  lightGhostBorder,
  darkGhostBorder,
  lightGradients,
  darkGradients,
  type ColorTokens,
} from './tokens';

// ---------------------------------------------------------------------------
// Theme context (mirrors the RN useTheme() hook shape)
// ---------------------------------------------------------------------------

interface ThemeContextValue {
  colors: typeof lightTokens | typeof darkTokens;
  isDark: boolean;
  glass: typeof lightGlass | typeof darkGlass;
  ghostBorder: typeof lightGhostBorder | typeof darkGhostBorder;
  gradients: typeof lightGradients | typeof darkGradients;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightTokens,
  isDark: false,
  glass: lightGlass,
  ghostBorder: lightGhostBorder,
  gradients: lightGradients,
});

export function useTheme() {
  return useContext(ThemeContext);
}

// ---------------------------------------------------------------------------
// Inner provider that reads the resolved theme from next-themes
// ---------------------------------------------------------------------------

function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  // next-themes handles the actual theme switching via data-theme attribute
  // We provide the token objects for components that need runtime access (SVG, charts)
  const { resolvedTheme } = useNextTheme();
  const isDark = resolvedTheme === 'dark';

  const value: ThemeContextValue = {
    colors: isDark ? darkTokens : lightTokens,
    isDark,
    glass: isDark ? darkGlass : lightGlass,
    ghostBorder: isDark ? darkGhostBorder : lightGhostBorder,
    gradients: isDark ? darkGradients : lightGradients,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Root provider (wraps next-themes + our context)
// ---------------------------------------------------------------------------

export function DukeThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
      <ThemeContextProvider>{children}</ThemeContextProvider>
    </NextThemesProvider>
  );
}
