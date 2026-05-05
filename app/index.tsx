import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors, t } from '@/theme';
import { useSession } from '@/lib/session';
import { useSellDraft } from '@/lib/sellDraft';
import { useSubscription } from '@/lib/subscription';

// Phase 1 / Screen 1 — Splash.
// Terracotta full-bleed, large pin glyph, italic wordmark, Lille tagline.
// After ~1.4s auto-advances to the next destination based on session state.
export default function Splash() {
  const C = useColors();
  const router = useRouter();
  const hydrated = useSession((s) => s.hydrated);
  const onboarded = useSession((s) => s.onboarded);
  const hydrate = useSession((s) => s.hydrate);
  const hydrateDraft = useSellDraft((s) => s.hydrate);
  const hydrateSub = useSubscription((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
    void hydrateDraft();
    void hydrateSub();
  }, [hydrate, hydrateDraft, hydrateSub]);

  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      router.replace(onboarded ? '/(tabs)/map' : '/welcome');
    }, 1400);
    return () => clearTimeout(id);
  }, [hydrated, onboarded, router]);

  return (
    <View style={{ flex: 1, backgroundColor: C.primary }}>
      {/* radial brand glow */}
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 0.7 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: 'center', gap: 16 }}>
          <Svg width={72} height={72} viewBox="0 0 32 32">
            <Path
              d="M16 2 C 9.4 2 4 7.4 4 14 C 4 22.5 14 30 16 30 C 18 30 28 22.5 28 14 C 28 7.4 22.6 2 16 2 Z"
              fill="#FFF"
            />
            <Circle cx={16} cy={13} r={4.2} fill={C.primary} />
          </Svg>
          <Text
            style={{
              fontFamily: 'InstrumentSerif-Italic',
              fontSize: 56,
              color: '#FFF',
              letterSpacing: -1.12,
              lineHeight: 56,
            }}
          >
            MyStreet
          </Text>
        </Animated.View>
      </View>
      <Animated.View
        entering={FadeIn.duration(500).delay(300)}
        style={{ position: 'absolute', bottom: 56, left: 0, right: 0, alignItems: 'center' }}
      >
        <Text
          style={[
            t('caption'),
            {
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: 1.44,
              textTransform: 'uppercase',
            },
          ]}
        >
          Hyperlocal · Lille
        </Text>
      </Animated.View>
    </View>
  );
}
