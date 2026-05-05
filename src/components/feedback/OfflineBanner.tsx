import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useColors, t } from '@/theme';
import { Icon } from '@/components';

// Mock no-internet banner. Real wiring would subscribe to NetInfo;
// here we just expose a `useOfflineSimulator()` hook that flips state
// for QA. The banner mounts at the root and slides down when offline.
//
// Future TODO: replace `useOfflineSimulator` with `@react-native-community/netinfo`.

const isOnline = { current: true };
let listeners: Array<(ok: boolean) => void> = [];

export function setOnline(ok: boolean) {
  isOnline.current = ok;
  listeners.forEach((l) => l(ok));
}

export function OfflineBanner() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [online, setS] = useState(true);
  useEffect(() => {
    const fn = (ok: boolean) => setS(ok);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);

  const ty = useSharedValue(-80);
  useEffect(() => {
    ty.value = withTiming(online ? -80 : 0, { duration: 220 });
  }, [online, ty]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));

  return (
    <Animated.View
      pointerEvents={online ? 'none' : 'box-none'}
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          paddingHorizontal: 16,
          backgroundColor: C.warning,
          zIndex: 999,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon.Close size={14} color="#FFF" />
        <Text style={{ color: '#FFF', fontFamily: 'InstrumentSans-SemiBold', fontSize: 13, flex: 1 }}>
          You're offline. Some things won't load.
        </Text>
        <Pressable hitSlop={6} onPress={() => setOnline(true)}>
          <Text style={[t('caption'), { color: '#FFF', fontFamily: 'InstrumentSans-SemiBold' }]}>
            Dismiss
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
