import '../global.css';

import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { View } from 'react-native';

import { fontMap } from '@/theme/fonts';
import { useColors, useIsDark, useThemeStore } from '@/theme';
import { watchSystemAppearance } from '@/theme/themeStore';
import { callsApi, onStaleSession, tokenStore } from '@/lib/api';
import { hydrateLocationStore, useLocationStore } from '@/lib/locationStore';
import { getLocationPermissionStatus } from '@/lib/location';
import { ToastHost } from '@/components/feedback/ToastHost';
import { ConfirmHost } from '@/components/feedback/ConfirmHost';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { TutorialHost } from '@/components/onboarding/TutorialHost';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontMap);
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();

  // Theme hydrates in the background — the store seeds `mode` from the OS
  // color scheme so the first paint already matches; the saved value (if
  // any) lands on the next render, no Stack-remount needed.
  useEffect(() => {
    void hydrateTheme();
    // Si la preference utilisateur est "Suivre l'appareil", on doit reagir
    // en temps reel quand l'OS bascule clair<->sombre (notifs iOS, automatic
    // mode Android, etc.). Cleanup non necessaire : l'app garde la souscription
    // pour toute sa vie (singleton interne au themeStore).
    watchSystemAppearance();
  }, [hydrateTheme]);

  // Hydrate the persistent location cache at boot so screens (map, search,
  // header label) can show the last known city/quartier before the first
  // GPS fix. We also re-check the OS permission status on mount — if the
  // user toggled it from Settings while the app was backgrounded, this
  // keeps our cached `permission` flag honest.
  useEffect(() => {
    void hydrateLocationStore();
    void (async () => {
      const status = await getLocationPermissionStatus();
      useLocationStore.getState().setPermission(status);
    })();
  }, []);

  // Quand la session devient obsolete (compte fantome / refresh expire),
  // on redirige vers /auth/email pour casser tout cycle. Le clear est deja
  // fait dans api.ts, on ne fait que la navigation ici.
  useEffect(() => {
    return onStaleSession(() => {
      router.replace('/auth/email');
    });
  }, [router]);

  // Poll global toutes les 3s pour detecter un appel entrant RINGING.
  // Quand on en trouve un, on redirige vers l'ecran d'appel pour que
  // l'user puisse accepter ou refuser.
  useEffect(() => {
    let cancelled = false;
    let alreadyHandling = new Set<string>();
    const tick = async () => {
      const token = await tokenStore.getAccess();
      if (!token || cancelled) return;
      try {
        const calls = await callsApi.incoming();
        for (const c of calls) {
          if (alreadyHandling.has(c.id)) continue;
          alreadyHandling.add(c.id);
          router.push(`/call/${c.id}` as any);
          break; // un seul a la fois
        }
      } catch {
        // ignore les erreurs de poll
      }
    };
    const interval = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [router]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Keep the native window background in sync so the gap between screen
  // transitions matches the active theme — no white flashes in dark mode.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(C.paper).catch(() => {});
  }, [C.paper]);

  // Stable across renders: re-creating `screenOptions` per theme tick used to
  // make expo-router's navigator re-evaluate its hook tree, which broke
  // ContextNavigator's hook order. The screen content sets its own bg already,
  // and the gap between transitions is painted via `SystemUI` above.
  const screenOptions = useMemo(
    () => ({ headerShown: false, animation: 'fade' as const }),
    [],
  );

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: C.paper }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.paper }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <ErrorBoundary>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack screenOptions={screenOptions}>
              <Stack.Screen
                name="sell"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="subscription"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
            </Stack>
            {/* Mounted at the root so they overlay every route — including
                modals — and aren't unmounted on stack transitions. */}
            <ConfirmHost />
            <ToastHost />
            <TutorialHost />
            </ErrorBoundary>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
