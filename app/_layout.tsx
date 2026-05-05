import '../global.css';

import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { View } from 'react-native';

import { fontMap } from '@/theme/fonts';
import { useColors, useIsDark, useThemeStore } from '@/theme';
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

  // Theme hydrates in the background — the store seeds `mode` from the OS
  // color scheme so the first paint already matches; the saved value (if
  // any) lands on the next render, no Stack-remount needed.
  useEffect(() => {
    void hydrateTheme();
  }, [hydrateTheme]);

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
