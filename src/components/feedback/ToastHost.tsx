import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useColors, radius as R, shadow as Sh, t, type Palette } from '@/theme';
import { Icon } from '@/components';
import { useToastStore, type ToastTone } from '@/lib/toast';

// Active toast renderer. Mounted once at the root so toasts surface above
// everything else (modals included). Only renders the currently-active
// toast; new toasts replace the old immediately.
export function ToastHost() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-16);

  useEffect(() => {
    if (!current) {
      opacity.value = withTiming(0, { duration: 160 });
      translateY.value = withTiming(-16, { duration: 160 });
      return;
    }
    cancelAnimation(opacity);
    cancelAnimation(translateY);
    opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
    const id = setTimeout(() => {
      // Slide-out then drop from store.
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(-16, { duration: 200 }, (finished) => {
        if (finished) runOnJS(dismiss)(current.id);
      });
    }, current.durationMs);
    return () => clearTimeout(id);
  }, [current, opacity, translateY, dismiss]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!current) return null;
  const palette = paletteFor(current.tone, C);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          right: 16,
          zIndex: 1000,
        },
        style,
      ]}
    >
      <View
        style={[
          Sh.medium,
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: R.lg,
            backgroundColor: palette.bg,
            borderWidth: 1,
            borderColor: palette.border,
          },
        ]}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: palette.iconBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {current.tone === 'success' ? (
            <Icon.Check size={14} color={palette.icon} />
          ) : current.tone === 'error' ? (
            <Icon.Close size={14} color={palette.icon} />
          ) : (
            <Icon.Plus size={14} color={palette.icon} />
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={2}
            style={{
              color: palette.fg,
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 14,
            }}
          >
            {current.message}
          </Text>
          {current.description ? (
            <Text
              numberOfLines={2}
              style={[t('caption'), { color: palette.fgMuted, marginTop: 2 }]}
            >
              {current.description}
            </Text>
          ) : null}
        </View>
        {current.action ? (
          <Pressable
            onPress={() => {
              current.action?.onPress();
              dismiss(current.id);
            }}
            hitSlop={6}
            style={{ paddingHorizontal: 6, paddingVertical: 4 }}
          >
            <Text
              style={{
                color: palette.action,
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 13,
              }}
            >
              {current.action.label}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => dismiss(current.id)}
            hitSlop={6}
            style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon.Close size={14} color={palette.fgMuted} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

function paletteFor(tone: ToastTone, C: Palette) {
  switch (tone) {
    case 'success':
      return {
        bg: C.surface,
        border: 'rgba(63,125,92,0.25)',
        iconBg: C.successSoft,
        icon: C.success,
        fg: C.ink,
        fgMuted: C.n600,
        action: C.success,
      };
    case 'error':
      return {
        bg: C.surface,
        border: 'rgba(178,58,42,0.25)',
        iconBg: C.dangerSoft,
        icon: C.danger,
        fg: C.ink,
        fgMuted: C.n600,
        action: C.danger,
      };
    case 'warning':
      return {
        bg: C.surface,
        border: 'rgba(198,138,46,0.25)',
        iconBg: C.warningSoft,
        icon: C.warning,
        fg: C.ink,
        fgMuted: C.n600,
        action: C.warning,
      };
    default:
      return {
        bg: C.surface,
        border: C.divider,
        iconBg: C.n50,
        icon: C.ink,
        fg: C.ink,
        fgMuted: C.n600,
        action: C.primary,
      };
  }
}
