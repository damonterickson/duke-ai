/**
 * Duke Vanguard Design Tokens
 * Dual-theme system: Light (Modern Vanguard) + Dark (Kinetic Command)
 *
 * Light theme: Army green primary, purple secondary — outdoor/formation use
 * Dark theme: Command purple primary, duke gold secondary — barracks/study use
 */

// ---------------------------------------------------------------------------
// Light Colors (Modern Vanguard — from Stitch mockups, full MD3 palette)
// ---------------------------------------------------------------------------

export const lightTokens = {
  // Primary (Army Olive)
  primary: '#343c0a',
  primary_container: '#4b5320',
  on_primary: '#ffffff',
  on_primary_container: '#bdc787',
  primary_fixed: '#dfe8a6',
  primary_fixed_dim: '#c3cc8c',
  on_primary_fixed: '#191e00',
  on_primary_fixed_variant: '#434b18',
  inverse_primary: '#c3cc8c',

  // Secondary (Royal Purple)
  secondary: '#7643b6',
  secondary_container: '#bc88ff',
  on_secondary: '#ffffff',
  on_secondary_container: '#4d118c',
  secondary_fixed: '#eedcff',
  secondary_fixed_dim: '#d9b9ff',
  on_secondary_fixed: '#2a0054',
  on_secondary_fixed_variant: '#5d289c',

  // Tertiary (Warm Gold)
  tertiary: '#6b5d2d',
  tertiary_container: '#bcaa72',
  on_tertiary: '#ffffff',
  on_tertiary_container: '#4b3e11',
  tertiary_fixed: '#f5e2a4',
  tertiary_fixed_dim: '#d8c68b',
  on_tertiary_fixed: '#231b00',
  on_tertiary_fixed_variant: '#524618',

  // Surface Tiers
  surface: '#fbf9f8',
  surface_dim: '#dbdad9',
  surface_bright: '#fbf9f8',
  surface_container_lowest: '#ffffff',
  surface_container_low: '#f5f3f3',
  surface_container: '#efeded',
  surface_container_high: '#eae8e7',
  surface_container_highest: '#e4e2e2',
  surface_variant: '#e4e2e2',
  surface_tint: '#5a632e',

  // On-colors
  on_surface: '#1b1c1c',
  on_surface_variant: '#47483c',
  on_background: '#1b1c1c',
  background: '#fbf9f8',

  // Inverse
  inverse_surface: '#303030',
  inverse_on_surface: '#f2f0f0',

  // Semantic
  error: '#ba1a1a',
  error_container: '#ffdad6',
  on_error: '#ffffff',
  on_error_container: '#93000a',
  outline: '#77786b',
  outline_variant: '#c8c7b8',
  outline_accessible: '#5a5b50', // Darkened for AA compliance on small text
} as const;

// ---------------------------------------------------------------------------
// Dark Colors (Kinetic Command palette — from DESIGN.md)
// ---------------------------------------------------------------------------

export const darkTokens = {
  // Primary (Command Purple)
  primary: '#d9b9ff',
  primary_container: '#450084',
  on_primary: '#460185',
  on_primary_container: '#b27ff5',
  primary_fixed: '#eedcff',
  primary_fixed_dim: '#d9b9ff',
  on_primary_fixed: '#2a0054',
  on_primary_fixed_variant: '#5d289c',
  inverse_primary: '#7643b6',

  // Secondary (Duke Gold)
  secondary: '#dbc585',
  secondary_container: '#544511',
  on_secondary: '#3c2f00',
  on_secondary_container: '#c9b475',
  secondary_fixed: '#f8e19e',
  secondary_fixed_dim: '#dbc585',
  on_secondary_fixed: '#231b00',
  on_secondary_fixed_variant: '#544511',

  // Tertiary (Tactical Olive)
  tertiary: '#c3cc8c',
  tertiary_container: '#2c3303',
  on_tertiary: '#2d3404',
  on_tertiary_container: '#939d61',
  tertiary_fixed: '#dfe8a6',
  tertiary_fixed_dim: '#c3cc8c',
  on_tertiary_fixed: '#191e00',
  on_tertiary_fixed_variant: '#434b18',

  // Surface Tiers (The Void)
  surface: '#151317',
  surface_dim: '#151317',
  surface_bright: '#3b383d',
  surface_container_lowest: '#0f0d11',
  surface_container_low: '#1d1b1f',
  surface_container: '#211f23',
  surface_container_high: '#2c292d',
  surface_container_highest: '#373438',
  surface_variant: '#373438',
  surface_tint: '#d9b9ff',

  // On-colors
  on_surface: '#e7e1e6',
  on_surface_variant: '#cdc3d4',
  on_background: '#e7e1e6',
  background: '#151317',

  // Inverse
  inverse_surface: '#e7e1e6',
  inverse_on_surface: '#322f34',

  // Semantic
  error: '#ffb4ab',
  error_container: '#93000a',
  on_error: '#690005',
  on_error_container: '#ffdad6',
  outline: '#968d9d',
  outline_variant: '#4b4452',
  outline_accessible: '#b0a8b8', // Lightened for AA compliance on small text
} as const;

// ---------------------------------------------------------------------------
// Color token type (shared shape between light and dark)
// ---------------------------------------------------------------------------

export type ColorTokens = typeof lightTokens;

// ---------------------------------------------------------------------------
// Backward-compatible aliases (remove after all components migrate to useTheme)
// ---------------------------------------------------------------------------

/** @deprecated Use lightTokens via useTheme() instead */
export const colors = lightTokens;

/** @deprecated Use darkTokens via useTheme() instead */
export const darkColors = darkTokens;

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
// Roundness (sharper for military feel)
// ---------------------------------------------------------------------------

export const roundness = {
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
} as const;

// ---------------------------------------------------------------------------
// Glassmorphism presets (per theme)
// ---------------------------------------------------------------------------

export const lightGlass = {
  overlayColor: 'rgba(245, 243, 243, 0.70)',
  blurIntensity: 20,
} as const;

export const darkGlass = {
  overlayColor: 'rgba(55, 52, 56, 0.50)',
  blurIntensity: 24,
} as const;

/** @deprecated Use lightGlass/darkGlass via useTheme() */
export const glass = darkGlass;

// ---------------------------------------------------------------------------
// Ghost-border presets (per theme)
// ---------------------------------------------------------------------------

export const lightGhostBorder = {
  color: 'rgba(200, 199, 184, 0.15)', // outline_variant at 15%
  width: 1.5,
} as const;

export const darkGhostBorder = {
  color: 'rgba(75, 68, 82, 0.15)', // outline_variant at 15%
  width: 1.5,
} as const;

/** @deprecated Use lightGhostBorder/darkGhostBorder via useTheme() */
export const ghostBorder = darkGhostBorder;

// ---------------------------------------------------------------------------
// Gradient presets (per theme)
// ---------------------------------------------------------------------------

export const lightGradients = {
  primaryCta: {
    colors: ['#343c0a', '#4b5320'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  secondaryAccent: {
    colors: ['#7643b6', '#4d118c'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  goldReward: {
    colors: ['#6b5d2d', '#bcaa72'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
} as const;

export const darkGradients = {
  primaryCta: {
    colors: ['#450084', '#d9b9ff'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  secondaryAccent: {
    colors: ['#544511', '#dbc585'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  goldReward: {
    colors: ['#544511', '#dbc585'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
} as const;

/** @deprecated Use lightGradients/darkGradients via useTheme() */
export const gradients = darkGradients;

// ---------------------------------------------------------------------------
// Glow Drops (per theme)
// ---------------------------------------------------------------------------

export const lightGlowDrops = {
  level0: undefined,
  level1: {
    shadowColor: '#343c0a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  level2: {
    shadowColor: '#343c0a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  level3: {
    shadowColor: '#7643b6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  gold: {
    shadowColor: '#6b5d2d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 4,
  },
} as const;

export const darkGlowDrops = {
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

/** @deprecated Use lightGlowDrops/darkGlowDrops via useTheme() */
export const glowDrops = darkGlowDrops;
