import type { ReactNode } from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';

import { useColors, useIsDark, type Palette } from '@/theme';

// Cross-platform glass surface.
// Wraps `expo-blur` with the design's frost tints, hairline border,
// and the inset highlight that makes the surface feel like glass on iOS.
//
// `tone`  — neutralLow | neutralHigh | warmLow | inkLow | pin | pinSelected | cluster | sheet
// `style` — applied to the outer wrapper. Border radius lives here so the
//           BlurView and tint overlay clip cleanly.

export type GlassTone =
  | 'neutralLow'
  | 'neutralHigh'
  | 'warmLow'
  | 'inkLow'
  | 'pin'
  | 'pinSelected'
  | 'cluster'
  | 'sheet';

type Props = {
  tone?: GlassTone;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  // For surfaces that already have their own border (e.g. a pill bg), opt out.
  borderless?: boolean;
};

type GlassCfg = {
  tint: string;
  intensity: number;
  border: string;
  /** Whether this tone should use the dark BlurView and a low-opacity top highlight. */
  isDarkTone: boolean;
};

// Build a glass config from the live palette. `isDark` flips the *neutral*
// tones (sheet / neutralLow / neutralHigh / warmLow) to darker frosts so the
// glass actually looks dark in dark mode. Identity-bound tones (`inkLow`,
// `pinSelected`, `cluster`) keep their meaning in both modes — they're meant
// to read as a darker UI surface regardless of theme.
function configFor(tone: GlassTone, C: Palette, isDark: boolean): GlassCfg {
  // Palette tokens for glass already flip with theme; we just pick the right
  // tone-name match here.
  switch (tone) {
    case 'neutralLow':
      return {
        tint: C.glassNeutral,
        intensity: 40,
        border: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.55)',
        isDarkTone: isDark,
      };
    case 'neutralHigh':
      return {
        tint: C.glassNeutral,
        intensity: 60,
        border: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.55)',
        isDarkTone: isDark,
      };
    case 'warmLow':
      return {
        tint: C.glassWarm,
        intensity: 40,
        border: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.55)',
        isDarkTone: isDark,
      };
    case 'sheet':
      return {
        tint: C.glassSheet,
        intensity: 60,
        border: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.5)',
        isDarkTone: isDark,
      };
    case 'pin':
      return {
        tint: C.glassPin,
        intensity: 40,
        border: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.6)',
        isDarkTone: isDark,
      };
    case 'inkLow':
      return {
        tint: C.glassInk,
        intensity: 40,
        border: 'rgba(255,255,255,0.18)',
        isDarkTone: true,
      };
    case 'pinSelected':
      return {
        tint: C.glassPinSel,
        intensity: 40,
        border: 'rgba(255,255,255,0.18)',
        isDarkTone: !isDark, // palette flips, but the tone always reads as inverted
      };
    case 'cluster':
      return {
        tint: C.glassCluster,
        intensity: 40,
        border: 'rgba(255,255,255,0.20)',
        isDarkTone: !isDark,
      };
  }
}

export function MSGlass({
  tone = 'neutralLow',
  style,
  children,
  borderless = false,
}: Props) {
  const C = useColors();
  const isDark = useIsDark();
  const cfg = configFor(tone, C, isDark);

  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <BlurView
        intensity={cfg.intensity}
        tint={cfg.isDarkTone ? 'dark' : 'light'}
        style={{ position: 'absolute', inset: 0 }}
      />
      {/* Tint overlay — gives the warm frost tone over the blur */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: cfg.tint,
        }}
      />
      {/* Top inset highlight */}
      {!borderless && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: cfg.isDarkTone
              ? 'rgba(255,255,255,0.18)'
              : 'rgba(255,255,255,0.7)',
          }}
        />
      )}
      {/* Hairline border */}
      {!borderless && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderWidth: 0.5,
            borderColor: cfg.border,
            borderRadius: ((style as ViewStyle | undefined)?.borderRadius ?? 0) as number,
          }}
        />
      )}
      {children}
    </View>
  );
}
