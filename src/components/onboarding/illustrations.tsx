import { Platform, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle } from 'react-native-svg';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { MSAvatar, MSMapPin } from '@/components';
import { MapBackground } from '@/components/map/MapBackground';
import { LISTINGS } from '@/lib/fixtures';

// Lazy-import expo-maps so the illustration still renders in environments
// where the native module is missing (Expo Go, web). Real iOS/Android dev
// builds get AppleMaps / GoogleMaps; everything else falls back to the
// schematic MapBackground.
let ExpoMaps: typeof import('expo-maps') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ExpoMaps = require('expo-maps');
} catch {
  ExpoMaps = null;
}

const LILLE = { lat: 50.6292, lng: 3.0573 };

// Slide 1 — real map of pins centered on user's neighbourhood
export function MapIllustration() {
  const C = useColors();
  const isDark = useIsDark();
  const colorScheme = isDark ? 'DARK' : 'LIGHT';
  const cameraPosition = {
    coordinates: { latitude: LILLE.lat, longitude: LILLE.lng },
    zoom: 16,
  };

  const AppleMaps = ExpoMaps && Platform.OS === 'ios' ? (ExpoMaps as any).AppleMaps : null;
  const GoogleMaps =
    ExpoMaps && Platform.OS === 'android' ? (ExpoMaps as any).GoogleMaps : null;

  return (
    <View style={{ flex: 1 }}>
      {/* Real map — locked decorative (no gestures, no chrome). taps fall
          through so the slide pager stays swipeable. */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {AppleMaps ? (
          <AppleMaps.View
            style={{ flex: 1 }}
            cameraPosition={cameraPosition}
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
      <View style={{ position: 'absolute', top: '20%', left: '15%' }}>
        <MSMapPin variant="thumb" label="€120" thumb={LISTINGS[0].thumb} />
      </View>
      <View style={{ position: 'absolute', top: '40%', right: '20%' }}>
        <MSMapPin label="€45" />
      </View>
      <View style={{ position: 'absolute', bottom: '30%', left: '30%' }}>
        <MSMapPin variant="selected" label="€180" thumb={LISTINGS[3].thumb} />
      </View>
      <View style={{ position: 'absolute', top: '15%', right: '12%' }}>
        <MSMapPin variant="cluster" label="6" />
      </View>
      <View style={{ position: 'absolute', bottom: '20%', right: '15%' }}>
        <MSMapPin label="€90" />
      </View>
      {/* User dot */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: '52%',
          left: '52%',
          marginLeft: -40,
          marginTop: -40,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: 'rgba(200,85,61,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Circle cx={9} cy={9} r={9} fill={C.primary} stroke="#FFF" strokeWidth={3} />
        </Svg>
      </View>
    </View>
  );
}

// Slide 2 — Mini phone showing a listing being created. Designed to fit
// inside the 380-px-tall slide container with a comfortable margin so
// neither the photo nor the Publish CTA gets clipped.
export function SellIllustration() {
  const C = useColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={[
          Sh.strong,
          {
            width: 220,
            backgroundColor: C.surface,
            borderRadius: 28,
            padding: 14,
            overflow: 'hidden',
          },
        ]}
      >
        <View
          style={{
            height: 150,
            borderRadius: R.md,
            overflow: 'hidden',
          }}
        >
          <Image
            source={{ uri: LISTINGS[0].photo }}
            style={{ width: '100%', height: 150 }}
            contentFit="cover"
          />
        </View>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 14,
            color: C.ink,
            lineHeight: 18,
            marginTop: 12,
          }}
        >
          Vélo Peugeot années 80
        </Text>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 18,
            color: C.ink,
            marginTop: 6,
          }}
        >
          €120
        </Text>
        <View
          style={{
            height: 36,
            borderRadius: R.full,
            backgroundColor: C.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
          }}
        >
          <Text style={{ color: '#FFF', fontFamily: 'InstrumentSans-SemiBold', fontSize: 13 }}>
            Publier
          </Text>
        </View>
      </View>
    </View>
  );
}

// Slide 3 — Avatars + chat bubbles representing community
export function CommunityIllustration() {
  const C = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: C.accentSoft, position: 'relative' }}>
      <View style={{ position: 'absolute', top: '20%', left: '15%' }}>
        <MSAvatar name="Marie" size={64} />
        <View
          style={[
            Sh.subtle,
            {
              marginTop: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: C.surface,
              borderRadius: 14,
              borderTopLeftRadius: 4,
              maxWidth: 160,
            },
          ]}
        >
          <Text style={[t('bodySm'), { color: C.ink }]}>On se voit ce soir ?</Text>
        </View>
      </View>
      <View style={{ position: 'absolute', top: '30%', right: '12%' }}>
        <MSAvatar name="Karim" size={48} verified />
      </View>
      <View style={{ position: 'absolute', bottom: '20%', left: '30%' }}>
        <MSAvatar name="Léa" size={56} status="online" />
      </View>
      <View style={{ position: 'absolute', bottom: '28%', right: '20%', alignItems: 'flex-end' }}>
        <View
          style={[
            Sh.subtle,
            {
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: C.primary,
              borderRadius: 14,
              borderTopRightRadius: 4,
            },
          ]}
        >
          <Text style={[t('bodySm'), { color: '#FFF' }]}>Parfait, à 18h !</Text>
        </View>
        <View style={{ marginTop: 8 }}>
          <MSAvatar name="Tom" size={48} />
        </View>
      </View>
    </View>
  );
}
