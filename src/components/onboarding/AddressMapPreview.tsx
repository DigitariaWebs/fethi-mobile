import { Platform, Text, View } from 'react-native';

import { useColors, useIsDark, radius as R, t } from '@/theme';
import { Icon } from '@/components';

// Lazy-import expo-maps so the JS bundle doesn't crash in Expo Go where the
// native module is absent. On a real iOS 18+ build this resolves to
// `AppleMaps.View`; on Android it's `GoogleMaps.View`.
let ExpoMaps: typeof import('expo-maps') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ExpoMaps = require('expo-maps');
} catch {
  ExpoMaps = null;
}

type Props = {
  lat?: number;
  lng?: number;
  label?: string;
  height?: number;
};

// Lille city centre — used as the default camera before the user picks an
// address. Once they pick one, the camera follows their pick.
const LILLE_LAT = 50.6292;
const LILLE_LNG = 3.0573;
const LILLE_ZOOM = 12;
const PICK_ZOOM = 17;

// Real-map preview for the onboarding address picker. Defaults to a Lille
// overview (no marker) and switches to a tight camera + marker once the user
// picks a suggestion.
export function AddressMapPreview({ lat, lng, label, height = 220 }: Props) {
  const C = useColors();
  const isDark = useIsDark();
  const colorScheme = isDark ? 'DARK' : 'LIGHT';

  const hasPick = lat != null && lng != null;
  const cameraPosition = {
    coordinates: hasPick
      ? { latitude: lat as number, longitude: lng as number }
      : { latitude: LILLE_LAT, longitude: LILLE_LNG },
    zoom: hasPick ? PICK_ZOOM : LILLE_ZOOM,
  };
  const markers = hasPick
    ? [
        {
          id: 'address',
          coordinates: { latitude: lat as number, longitude: lng as number },
          title: label ?? 'Your address',
          tintColor: C.primary,
        },
      ]
    : [];

  if (ExpoMaps && Platform.OS === 'ios' && (ExpoMaps as any).AppleMaps) {
    const AppleMaps = (ExpoMaps as any).AppleMaps;
    return (
      <View
        style={{
          height,
          borderRadius: R.lg,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: C.divider,
        }}
      >
        <AppleMaps.View
          style={{ flex: 1 }}
          cameraPosition={cameraPosition}
          markers={markers}
          colorScheme={colorScheme}
          properties={{ isTrafficEnabled: false, mapType: 'STANDARD' }}
        />
      </View>
    );
  }

  if (ExpoMaps && Platform.OS === 'android' && (ExpoMaps as any).GoogleMaps) {
    const GoogleMaps = (ExpoMaps as any).GoogleMaps;
    return (
      <View
        style={{
          height,
          borderRadius: R.lg,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: C.divider,
        }}
      >
        <GoogleMaps.View
          style={{ flex: 1 }}
          cameraPosition={cameraPosition}
          markers={markers}
          colorScheme={colorScheme}
          properties={{ isTrafficEnabled: false }}
        />
      </View>
    );
  }

  // Fallback (Expo Go / web) — when no native map is available we still
  // give the user a sense of place: "Lille" until they pick, the actual
  // street name once they do.
  return (
    <View
      style={{
        height,
        borderRadius: R.lg,
        borderWidth: 1,
        borderColor: C.divider,
        backgroundColor: C.surface,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}
    >
      <Icon.Pin size={28} color={C.primary} />
      <Text
        style={[
          t('bodySm'),
          {
            color: C.ink,
            fontFamily: 'InstrumentSans-SemiBold',
            marginTop: 8,
            textAlign: 'center',
          },
        ]}
      >
        {hasPick
          ? (label ?? `${(lat as number).toFixed(4)}, ${(lng as number).toFixed(4)}`)
          : 'Lille'}
      </Text>
      <Text style={[t('caption'), { color: C.n500, marginTop: 4 }]}>
        (Native map preview requires a dev build)
      </Text>
    </View>
  );
}
