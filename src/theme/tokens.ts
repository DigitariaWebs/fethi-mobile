// MyStreet design tokens — ported verbatim from design/tokens.js.
// All values are React Native primitives (strings/numbers) — no CSS-only effects.
//
// `color` is the legacy static export and resolves to the LIGHT palette. New
// code should call `useColors()` from '@/theme' so it tracks the active theme
// (see ./palettes.ts and ./themeStore.ts). This file keeps `color` around as a
// safety net for any stateless module-scope reference, and re-exports the live
// palettes / hooks for convenience.

import { lightPalette } from './palettes';

export const color = lightPalette;

export const font = {
  // RN-friendly family names. Local fonts registered in app/_layout.tsx.
  display: 'InstrumentSerif',
  sans:    'InstrumentSans',
  sansSemi:'InstrumentSans-SemiBold',
  sansBold:'InstrumentSans-Bold',
} as const;

// Typography. letterSpacing translated from CSS em → RN absolute pixels.
// (RN takes letterSpacing in absolute units.)
export type TypeKey =
  | 'displayXl' | 'display' | 'h1' | 'h2' | 'h3'
  | 'bodyLg' | 'body' | 'bodySm' | 'caption' | 'label';

export const type: Record<TypeKey, {
  size: number; weight: '400' | '500' | '600' | '700';
  lh: number; ls: number; family: 'display' | 'sans';
}> = {
  displayXl: { size: 56, weight: '400', lh: 1.02, ls: -1.12,  family: 'display' },
  display:   { size: 40, weight: '400', lh: 1.05, ls: -0.6,   family: 'display' },
  h1:        { size: 32, weight: '600', lh: 1.15, ls: -0.64,  family: 'sans' },
  h2:        { size: 24, weight: '600', lh: 1.2,  ls: -0.36,  family: 'sans' },
  h3:        { size: 18, weight: '600', lh: 1.3,  ls: -0.18,  family: 'sans' },
  bodyLg:    { size: 17, weight: '400', lh: 1.5,  ls: 0,      family: 'sans' },
  body:      { size: 15, weight: '400', lh: 1.5,  ls: 0,      family: 'sans' },
  bodySm:    { size: 13, weight: '400', lh: 1.45, ls: 0,      family: 'sans' },
  caption:   { size: 12, weight: '500', lh: 1.35, ls: 0.12,   family: 'sans' },
  label:     { size: 13, weight: '600', lh: 1.3,  ls: 0.26,   family: 'sans' },
};

export const space = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 24: 96,
} as const;

export const radius = {
  sm: 6, md: 10, lg: 14, xl: 20, xl2: 28, full: 999,
} as const;

// Shadows — RN-shaped (offset/radius/opacity). Matches design intent.
// Each entry yields the props you spread directly onto View.style for iOS shadow,
// plus elevation for Android.
export const shadow = {
  subtle: {
    shadowColor: '#1F2421',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: '#1F2421',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  strong: {
    shadowColor: '#1F2421',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 12,
  },
  // Pin-specific drops
  pin: {
    shadowColor: '#1F2421',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  pinSelected: {
    shadowColor: '#1F2421',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 8,
  },
  // Sheet edge
  sheet: {
    shadowColor: '#1F2421',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 16,
  },
  // Primary button glow
  primaryGlow: {
    shadowColor: '#C8553D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
} as const;

// Glass surface tokens — feed `<MSGlass>` (BlurView wrapper).
export const glass = {
  // tint, blurIntensity (expo-blur 0-100), borderColor
  neutralLow:  { tint: color.glassNeutral, intensity: 40, border: 'rgba(255,255,255,0.55)' },
  neutralHigh: { tint: color.glassNeutral, intensity: 60, border: 'rgba(255,255,255,0.55)' },
  warmLow:     { tint: color.glassWarm,    intensity: 40, border: 'rgba(255,255,255,0.55)' },
  inkLow:      { tint: color.glassInk,     intensity: 40, border: 'rgba(255,255,255,0.18)' },
  pin:         { tint: color.glassPin,     intensity: 40, border: 'rgba(255,255,255,0.6)'  },
  pinSelected: { tint: color.glassPinSel,  intensity: 40, border: 'rgba(255,255,255,0.18)' },
  cluster:     { tint: color.glassCluster, intensity: 40, border: 'rgba(255,255,255,0.20)' },
  sheet:       { tint: color.glassSheet,   intensity: 60, border: 'rgba(255,255,255,0.5)'  },
} as const;

export const theme = { color, font, type, space, radius, shadow, glass } as const;
export type Theme = typeof theme;
