import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { LayoutChangeEvent, Platform, View } from 'react-native';
import { useColors, useIsDark } from '@/theme';

// Single point of swap for the map provider.
// On iOS we use Apple Maps via `expo-maps`; on Android, Google Maps.
//
// expo-maps' native annotation/marker styling is intentionally minimal in
// the SDK 55 alpha — it can't render our glassy price pills. So we keep
// the map "naked" here (just the basemap + native circles for the search
// radius) and let the parent draw custom React pins in screen space,
// projecting their lat/lng onto the viewport using the live camera info
// surfaced via `onCameraChange`.

export type MapCircle = {
  id: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  color?: string;          // rgba fill
  lineColor?: string;      // rgba stroke
  lineWidth?: number;
};

export type MapCamera = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  zoom: number;
};

export type MapHostRef = {
  recenter: (lat: number, lng: number, zoom?: number) => void;
};

type Props = {
  centerLat: number;
  centerLng: number;
  circles?: MapCircle[];
  onCameraChange?: (cam: MapCamera) => void;
  onSize?: (size: { width: number; height: number }) => void;
  // Visual fallback for environments where expo-maps isn't available
  // (Expo Go, web, snapshot tests).
  fallback?: React.ReactNode;
};

let ExpoMaps: typeof import('expo-maps') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ExpoMaps = require('expo-maps');
} catch {
  ExpoMaps = null;
}

export const MapHost = forwardRef<MapHostRef, Props>(function MapHost(
  { centerLat, centerLng, circles, onCameraChange, onSize, fallback },
  ref,
) {
  const C = useColors();
  const isDark = useIsDark();
  const colorScheme = isDark ? 'DARK' : 'LIGHT';
  const appleRef = useRef<any>(null);
  const googleRef = useRef<any>(null);

  useImperativeHandle(
    ref,
    () => ({
      recenter: (lat, lng, zoom = 16) => {
        const config = {
          coordinates: { latitude: lat, longitude: lng },
          zoom,
        };
        appleRef.current?.setCameraPosition?.(config);
        googleRef.current?.setCameraPosition?.(config);
      },
    }),
    [],
  );

  const initialCamera = useMemo(
    () => ({
      coordinates: { latitude: centerLat, longitude: centerLng },
      zoom: 16,
    }),
    [centerLat, centerLng],
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    onSize?.({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  const handleCamera = (e: any) => {
    onCameraChange?.({
      latitude: e.coordinates.latitude,
      longitude: e.coordinates.longitude,
      latitudeDelta: e.latitudeDelta,
      longitudeDelta: e.longitudeDelta,
      zoom: e.zoom,
    });
  };

  if (ExpoMaps && Platform.OS === 'ios' && (ExpoMaps as any).AppleMaps) {
    const AppleMaps = (ExpoMaps as any).AppleMaps;

    const appleCircles = (circles ?? []).map((c) => ({
      id: c.id,
      center: { latitude: c.lat, longitude: c.lng },
      radius: c.radiusMeters,
      color: c.color ?? 'rgba(200,85,61,0.10)',
      lineColor: c.lineColor ?? 'rgba(200,85,61,0.45)',
      lineWidth: c.lineWidth ?? 1,
    }));

    return (
      <View style={{ flex: 1, backgroundColor: C.paper }} onLayout={handleLayout}>
        <AppleMaps.View
          ref={appleRef}
          style={{ flex: 1 }}
          cameraPosition={initialCamera}
          circles={appleCircles}
          colorScheme={colorScheme}
          properties={{ isTrafficEnabled: false, mapType: 'STANDARD' }}
          onCameraMove={handleCamera}
        />
      </View>
    );
  }

  if (ExpoMaps && Platform.OS === 'android' && (ExpoMaps as any).GoogleMaps) {
    const GoogleMaps = (ExpoMaps as any).GoogleMaps;
    const googleCircles = (circles ?? []).map((c) => ({
      id: c.id,
      center: { latitude: c.lat, longitude: c.lng },
      radius: c.radiusMeters,
      color: c.color ?? 'rgba(200,85,61,0.10)',
      lineColor: c.lineColor ?? 'rgba(200,85,61,0.45)',
      lineWidth: c.lineWidth ?? 1,
    }));
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }} onLayout={handleLayout}>
        <GoogleMaps.View
          ref={googleRef}
          style={{ flex: 1 }}
          cameraPosition={initialCamera}
          circles={googleCircles}
          colorScheme={colorScheme}
          properties={{ isTrafficEnabled: false }}
          onCameraMove={handleCamera}
        />
      </View>
    );
  }

  // Fallback (web, Expo Go, snapshot)
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }} onLayout={handleLayout}>
      {fallback ?? null}
    </View>
  );
});
