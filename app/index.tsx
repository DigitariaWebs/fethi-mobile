import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors } from '@/theme';
import { useSession } from '@/lib/session';
import { useSellDraft } from '@/lib/sellDraft';
import { useSubscription } from '@/lib/subscription';
import { MSLogo } from '@/components/branding';


// Phase 1 / Screen 1 — Splash.
// Terracotta full-bleed, brand mark slides up from below to center.
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          entering={FadeInDown.duration(800).springify().damping(14)}
        >
          <MSLogo size={128} color="#FFF" />
        </Animated.View>
      </View>
    </View>
  );
}
