import { Platform, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSButton, MSGlass } from '@/components';
import { MapBackground } from '@/components/map/MapBackground';
import { useSession } from '@/lib/session';

// Lazy-import expo-maps so JS bundle still loads in environments where the
// native module is missing (Expo Go, web). Real iOS/Android dev builds get
// AppleMaps / GoogleMaps; everything else falls back to MapBackground.
let ExpoMaps: typeof import('expo-maps') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ExpoMaps = require('expo-maps');
} catch {
  ExpoMaps = null;
}

// Lille center — used when the user somehow lands here without a picked
// address (deep-link / dev reset).
const LILLE_FALLBACK = { lat: 50.6292, lng: 3.0573 };

export default function Success() {
  const C = useColors();
  const isDark = useIsDark();
  const colorScheme = isDark ? 'DARK' : 'LIGHT';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const address = useSession((s) => s.address);
  const addressLat = useSession((s) => s.addressLat);
  const addressLng = useSession((s) => s.addressLng);
  const finishOnboarding = useSession((s) => s.finishOnboarding);

  const lat = addressLat ?? LILLE_FALLBACK.lat;
  const lng = addressLng ?? LILLE_FALLBACK.lng;

  const handleStart = async () => {
    await finishOnboarding();
    router.replace('/(tabs)/map');
  };

  const cameraPosition = {
    coordinates: { latitude: lat, longitude: lng },
    zoom: 16,
  };
  const marker = {
    id: 'home',
    coordinates: { latitude: lat, longitude: lng },
    title: address || 'Ton adresse',
    tintColor: C.primary,
  };

  const AppleMaps = ExpoMaps && Platform.OS === 'ios' ? (ExpoMaps as any).AppleMaps : null;
  const GoogleMaps =
    ExpoMaps && Platform.OS === 'android' ? (ExpoMaps as any).GoogleMaps : null;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Real map — full bleed behind the glass card. pointerEvents="none"
          locks the map: no scroll, zoom, rotate, or pitch gestures, and
          taps fall through to the card below. Combined with disabling the
          pitch / compass / scale chrome, we get a static decorative map. */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {AppleMaps ? (
          <AppleMaps.View
            style={{ flex: 1 }}
            cameraPosition={cameraPosition}
            markers={[marker]}
            colorScheme={colorScheme}
            properties={{ isTrafficEnabled: false, mapType: 'STANDARD' }}
            uiSettings={{
              compassEnabled: false,
              myLocationButtonEnabled: false,
              scaleBarEnabled: false,
              togglePitchEnabled: false,
            }}
          />
        ) : GoogleMaps ? (
          <GoogleMaps.View
            style={{ flex: 1 }}
            cameraPosition={cameraPosition}
            markers={[marker]}
            colorScheme={colorScheme}
            properties={{ isTrafficEnabled: false }}
            uiSettings={{
              compassEnabled: false,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
              scrollGesturesEnabled: false,
              zoomGesturesEnabled: false,
              rotationGesturesEnabled: false,
              tiltGesturesEnabled: false,
            }}
          />
        ) : (
          <MapBackground />
        )}
      </View>

      {/* Soft 500m radius rings centered on the marker. expo-maps doesn't
          support custom circle overlays in alpha, so we layer them as a UI
          element above the map — visually centered on the marker that the
          camera is locked to. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: '34%',
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: 'rgba(200,85,61,0.10)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '34%',
            marginTop: 50,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: 'rgba(200,85,61,0.16)',
          }}
        />
      </View>

      {/* Glass success card */}
      <Animated.View
        entering={FadeInDown.duration(500)}
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: 40 + insets.bottom,
        }}
      >
        <MSGlass
          tone="sheet"
          style={[
            Sh.strong,
            {
              borderRadius: R.xl2,
              padding: 28,
            },
          ]}
        >
          <Animated.View
            entering={FadeIn.duration(400).delay(150)}
            style={[
              Sh.primaryGlow,
              {
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: C.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              },
            ]}
          >
            <Icon.Check size={28} color="#FFF" />
          </Animated.View>
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 32,
              lineHeight: 36,
              letterSpacing: -0.64,
              color: C.ink,
            }}
          >
            Tu es prêt(e).
          </Text>
          <Text style={[t('body'), { color: C.n600, marginTop: 10, marginBottom: 20 }]}>
            Tu es installé(e) au{' '}
            <Text style={{ color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }}>
              {address || '12 rue de la Monnaie, Vieux-Lille'}
            </Text>
            . Il y a{' '}
            <Text style={{ color: C.primary, fontFamily: 'InstrumentSans-SemiBold' }}>
              43 annonces
            </Text>{' '}
            à moins de 500 m.
          </Text>
          <MSButton
            size="lg"
            fullWidth
            icon={<Icon.Map size={18} color="#FFF" />}
            onPress={handleStart}
          >
            Voir ce qu'il y a autour
          </MSButton>
        </MSGlass>
      </Animated.View>
    </View>
  );
}
