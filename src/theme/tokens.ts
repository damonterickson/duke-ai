/**
 * Kinetic Command Design Tokens
 * "The Tactical Vanguard" — Duke Vanguard Design System
 */

// ---------------------------------------------------------------------------
// Colors (Light — legacy, kept for light-mode fallback)
// ---------------------------------------------------------------------------

export const colors = {
  // Primary (Olive Drab)
  primary: '#343c0a',
  primary_container: '#4b5320',

  // Secondary (Field Khaki)
  secondary: '#6d5d2f',
  secondary_container: '#f5dea5',

  // Tertiary (Achievement Gold)
  tertiary: '#735c00',
  tertiary_container: '#cca730',

  // Surface Tiers
  surface: '#f5faff',
  surface_container_lowest: '#ffffff',
  surface_container_low: '#e9f5ff',
  surface_container: '#e0f0fd',
  surface_container_high: '#daeaf7',
  surface_container_highest: '#d5e5f1',

  // On-colors
  on_surface: '#0e1d26',
  on_primary: '#ffffff',

  // Semantic
  error: '#ba1a1a',
  outline: '#77786b',
  outline_variant: '#c8c7b8',
} as const;

// ---------------------------------------------------------------------------
// Dark Colors (Kinetic Command palette — default)
// ---------------------------------------------------------------------------

export const darkColors = {
  // Primary (Command Purple)
  primary: '#d9b9ff',
  primary_container: '#450084',
  on_primary: '#460185',
  on_primary_container: '#b27ff5',

  // Secondary (Duke Gold)
  secondary: '#dbc585',
  secondary_container: '#544511',
  on_secondary: '#3c2f00',
  on_secondary_container: '#c9b475',

  // Tertiary (Tactical Olive)
  tertiary: '#c3cc8c',
  tertiary_container: '#2c3303',
  on_tertiary: '#2d3404',

  // Surface Tiers (The Void)
  surface: '#151317',
  surface_container_lowest: '#0f0d11',
  surface_container_low: '#1d1b1f',
  surface_container: '#211f23',
  surface_container_high: '#2c292d',
  surface_container_highest: '#373438',

  // On-colors
  on_surface: '#e7e1e6',

  // Semantic
  error: '#ffb4ab',
  error_container: '#93000a',
  outline: '#968d9d',
  outline_variant: '#4b4452',
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const fontFamilies = {
  display: 'PublicSans-Black',
  display_medium: 'PublicSans-Bold',
  headline: 'PublicSans-Bold',
  headline_medium: 'PublicSans-Bold',
  body: 'Inter-Regular',
  body_medium: 'Inter-Medium',
  label: 'SpaceGrotesk-Medium',
  label_regular: 'SpaceGrotesk-Regular',
} as const;

export const typography = {
  display_lg: {
    fontFamily: fontFamilies.display,
    fontSize: 57,
    fontWeight: '900' as const,
    letterSpacing: -0.25,
    lineHeight: 64,
  },
  display_md: {
    fontFamily: fontFamilies.display,
    fontSize: 45,
    fontWeight: '900' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  display_sm: {
    fontFamily: fontFamilies.display,
    fontSize: 36,
    fontWeight: '900' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headline_lg: {
    fontFamily: fontFamilies.headline,
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headline_md: {
    fontFamily: fontFamilies.headline,
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headline_sm: {
    fontFamily: fontFamilies.headline,
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  title_lg: {
    fontFamily: fontFamilies.display_medium,
    fontSize: 22,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  title_md: {
    fontFamily: fontFamilies.display_medium,
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  title_sm: {
    fontFamily: fontFamilies.display_medium,
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  body_lg: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  body_md: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  body_sm: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  label_lg: {
    fontFamily: fontFamilies.label,
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  label_md: {
    fontFamily: fontFamilies.label,
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  label_sm: {
    fontFamily: fontFamilies.label,
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
} as const;

// ---------------------------------------------------------------------------
// Spacing  (base = 4px, tokens 1-16)
// ---------------------------------------------------------------------------

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  13: 52,
  14: 56,
  15: 60,
  16: 64,
} as const;

// ---------------------------------------------------------------------------
// Roundness (sharper for Kinetic Command military feel)
// ---------------------------------------------------------------------------

export const roundness = {
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
} as const;

// ---------------------------------------------------------------------------
// Glassmorphism preset (Kinetic Command — dark mode)
// ---------------------------------------------------------------------------

export const glass = {
  overlayColor: 'rgba(33, 31, 35, 0.60)',
  blurIntensity: 16,
} as const;

// ---------------------------------------------------------------------------
// Ghost-border preset (Rule 3 — outline_variant at 15%)
// ---------------------------------------------------------------------------

export const ghostBorder = {
  color: 'rgba(75, 68, 82, 0.15)', // outline_variant (#4b4452) at 15%
  width: 1.5,
} as const;

// ---------------------------------------------------------------------------
// Gradient presets (Kinetic Command)
// ---------------------------------------------------------------------------

export const gradients = {
  primaryCta: {
    colors: ['#450084', '#d9b9ff'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  goldReward: {
    colors: ['#544511', '#dbc585'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  /** @deprecated Use goldReward instead. Kept for backward compatibility. */
  tertiaryProgress: {
    colors: ['#544511', '#dbc585'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
} as const;

// ---------------------------------------------------------------------------
// Glow Drops (replaces traditional shadows)
// ---------------------------------------------------------------------------

export const glowDrops = {
  level0: undefined,
  level1: {
    shadowColor: '#450084',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  level2: {
    shadowColor: '#450084',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 8,
  },
  level3: {
    shadowColor: '#450084',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 12,
  },
  gold: {
    shadowColor: '#dbc585',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 4,
  },
} as const;
