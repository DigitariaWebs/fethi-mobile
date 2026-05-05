import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors, radius as R, shadow as Sh, type Palette as ThemePalette } from '@/theme';
import { MSGlass } from '../surfaces/MSGlass';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';
type State = 'default' | 'pressed' | 'disabled' | 'loading';

type Props = {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  state?: State; // override (for design preview); usually inferred from interaction
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const SIZES: Record<Size, { h: number; px: number; fs: number; gap: number }> = {
  sm: { h: 36, px: 14, fs: 14, gap: 6 },
  md: { h: 48, px: 20, fs: 15, gap: 8 },
  lg: { h: 56, px: 24, fs: 17, gap: 10 },
};

type Palette = {
  bg: string;        // 'glass' marker handled separately
  fg: string;
  shine: boolean;
  isGlass: boolean;
};

function paletteFor(variant: Variant, state: State, C: ThemePalette): Palette {
  if (variant === 'primary') {
    const bg =
      state === 'pressed'
        ? C.primaryPressed
        : state === 'disabled'
          ? C.n100
          : C.primary;
    return {
      bg,
      fg: state === 'disabled' ? C.n400 : '#FFFFFF',
      shine: state !== 'pressed' && state !== 'disabled',
      isGlass: false,
    };
  }
  if (variant === 'destructive') {
    const bg =
      state === 'pressed' ? '#882B1F' : state === 'disabled' ? C.n100 : C.danger;
    return {
      bg,
      fg: state === 'disabled' ? C.n400 : '#FFFFFF',
      shine: state !== 'pressed' && state !== 'disabled',
      isGlass: false,
    };
  }
  if (variant === 'secondary') {
    return {
      bg: 'transparent',
      fg: state === 'disabled' ? C.n400 : C.ink,
      shine: false,
      isGlass: true,
    };
  }
  // ghost
  return {
    bg: state === 'pressed' ? C.inkOverlay09 : 'transparent',
    fg: state === 'disabled' ? C.n400 : C.ink,
    shine: false,
    isGlass: false,
  };
}

// MSButton — terracotta primary + glass secondary + ghost + destructive.
// Uses a manual pressed-state hook (instead of Pressable's style callback) so
// every render returns a single, fully-merged style object. This is reliable
// across the New Architecture / Fabric reconciliation; the array-with-falsy
// pattern (`[base, cond && extra]`) we used previously dropped the background
// on iOS in some cases.
export function MSButton({
  children,
  variant = 'primary',
  size = 'md',
  state,
  icon,
  iconRight,
  fullWidth,
  onPress,
  style,
}: Props) {
  const C = useColors();
  const dims = SIZES[size];
  const isDisabled = state === 'disabled' || state === 'loading';
  const [pressedNow, setPressedNow] = useState(false);

  const effective: State = state ?? (pressedNow ? 'pressed' : 'default');
  const pal = paletteFor(variant, effective, C);

  const baseStyle: ViewStyle = {
    height: dims.h,
    paddingHorizontal: dims.px,
    borderRadius: R.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: dims.gap,
    overflow: 'hidden',
    backgroundColor: pal.bg,
    opacity: state === 'disabled' ? 1 : pressedNow && !isDisabled ? 0.92 : 1,
  };

  if (fullWidth) {
    baseStyle.alignSelf = 'stretch';
    baseStyle.width = '100%';
  }

  // Shadows are siblings, not part of overflow:hidden bounds, so we apply
  // them on the same Pressable. Note: shadowColor + transparent bg on iOS
  // can drop the shadow — primary/destructive always have a solid bg.
  const shadowStyle: ViewStyle =
    variant === 'primary' && !isDisabled
      ? Sh.primaryGlow
      : variant === 'destructive' && !isDisabled
        ? Sh.medium
        : variant === 'secondary'
          ? Sh.subtle
          : ({} as ViewStyle);

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      onPressIn={() => setPressedNow(true)}
      onPressOut={() => setPressedNow(false)}
      style={[baseStyle, shadowStyle, style]}
    >
      {pal.isGlass && (
        <MSGlass
          tone="neutralLow"
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: R.full },
          ]}
        />
      )}
      {pal.shine && (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: dims.h / 2,
          }}
        />
      )}
      {state === 'loading' ? (
        <ActivityIndicator size="small" color={pal.fg} />
      ) : icon ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>{icon}</View>
      ) : null}
      {typeof children === 'string' ? (
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: dims.fs,
            color: pal.fg,
            letterSpacing: -0.075,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
      {iconRight && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>{iconRight}</View>
      )}
    </Pressable>
  );
}
