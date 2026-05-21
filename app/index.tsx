import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors } from '@/theme';
import { useSession } from '@/lib/session';
import { useSellDraft } from '@/lib/sellDraft';
import { useSubscription } from '@/lib/subscription';
import { meApi, tokenStore, ApiError } from '@/lib/api';
import { MSLogo } from '@/components/branding';


// Splash — point d'entree de l'app.
//
// Decision tree au boot :
//   1. Hydrate les stores AsyncStorage (session, sellDraft, sub)
//   2. Si pas de token  -> /auth (login)
//   3. Si token + /me OK + displayName renseigne -> /(tabs)/map (deja onboarded)
//   4. Si token + /me OK + displayName vide      -> /onboarding/profile (continue onboarding)
//   5. Si token + /me 401                        -> /auth (session expiree)
//
// On laisse un delai mini de 1.4s pour que le logo soit visible (sinon
// l'animation parait coupee sur les vieux iPhones qui demarrent vite).
export default function Splash() {
  const C = useColors();
  const router = useRouter();
  const hydrated = useSession((s) => s.hydrated);
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

    let cancelled = false;
    const start = Date.now();
    const MIN_SPLASH_MS = 1400;

    (async () => {
      // 1. Token present ?
      const token = await tokenStore.getAccess();
      if (cancelled) return;

      let destination = '/auth';

      if (token) {
        // 2. Token present -> tente /me. Si OK, route selon le profil.
        try {
          const me = await meApi.get();
          if (cancelled) return;
          // displayName renseigne = onboarding au moins partiellement fait
          if (me.displayName && me.displayName.trim().length > 0) {
            destination = '/(tabs)/map';
          } else {
            destination = '/onboarding/profile';
          }
        } catch (err) {
          // 401 = session expiree / compte supprime. Clear et /auth.
          if (err instanceof ApiError && err.status === 401) {
            await tokenStore.clear();
          }
          destination = '/auth';
        }
      }

      // Garde un splash visible 1.4s minimum.
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
      setTimeout(() => {
        if (!cancelled) router.replace(destination as any);
      }, remaining);
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, router]);

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
