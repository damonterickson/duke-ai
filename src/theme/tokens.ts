/**
 * Modern Vanguard Design Tokens
 * "Tactical Precision" — Iron Vanguard Design System
 */

// ---------------------------------------------------------------------------
// Colors
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
// Typography
// ---------------------------------------------------------------------------

export const fontFamilies = {
  display: 'PublicSans-Regular',
  display_medium: 'PublicSans-Medium',
  headline: 'PublicSans-Regular',
  headline_medium: 'PublicSans-Medium',
  body: 'PublicSans-Regular',
  body_medium: 'PublicSans-Medium',
  label: 'Inter-Medium',
  label_regular: 'Inter-Regular',
} as const;

export const typography = {
  display_lg: {
    fontFamily: fontFamilies.display,
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: -0.25,
    lineHeight: 64,
  },
  display_md: {
    fontFamily: fontFamilies.display,
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  display_sm: {
    fontFamily: fontFamilies.display,
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headline_lg: {
    fontFamily: fontFamilies.headline,
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headline_md: {
    fontFamily: fontFamilies.headline,
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headline_sm: {
    fontFamily: fontFamilies.headline,
    fontSize: 24,
    fontWeight: '400' as const,
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
// Spacing  (base = 4px, tokens 1–16)
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
// Roundness
// ---------------------------------------------------------------------------

export const roundness = {
  sm: 2,
  md: 6,
  lg: 8,
  xl: 12,
} as const;

// ---------------------------------------------------------------------------
// Glassmorphism preset
// ---------------------------------------------------------------------------

export const glass = {
  overlayColor: 'rgba(245, 250, 255, 0.80)',
  blurIntensity: 12,
} as const;

// ---------------------------------------------------------------------------
// Ghost-border preset (Rule 3)
// ---------------------------------------------------------------------------

export const ghostBorder = {
  color: 'rgba(200, 199, 184, 0.20)', // outline_variant at 20%
  width: 1.5,
} as const;

// ---------------------------------------------------------------------------
// Gradient presets
// ---------------------------------------------------------------------------

export const gradients = {
  primaryCta: {
    colors: ['#343c0a', '#4b5320'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  tertiaryProgress: {
    colors: ['#735c00', '#cca730'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
} as const;
