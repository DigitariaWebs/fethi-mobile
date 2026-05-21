import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useColors, radius as R, t, type Palette } from '@/theme';
import { Icon, MSButton } from '@/components';
import { useToast } from '@/lib/toast';
import { resolveLocation } from '@/lib/location';
import { useLocationStore } from '@/lib/locationStore';
import { meApi } from '@/lib/api';

type Perm = 'location' | 'notifications' | 'photos';

function buildSpecs(C: Palette): Record<Perm, { label: string; body: string; glyph: React.ReactNode }> {
  return {
    location: {
      label: 'Localisation',
      body: 'Vois les annonces près de chez toi, et permets aux acheteurs de retrouver ta rue (jamais l\'adresse exacte).',
      glyph: (
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
          <Path d="M21 10 c0 7 -9 13 -9 13 s-9 -6 -9 -13 a9 9 0 0 1 18 0 Z" stroke={C.primary} strokeWidth={1.8} />
          <Circle cx={12} cy={10} r={3} stroke={C.primary} strokeWidth={1.8} />
        </Svg>
      ),
    },
    notifications: {
      label: 'Notifications',
      body: "Reçois une notification quand quelqu'un t'écrit, accepte une offre ou demande à réserver.",
      glyph: (
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
          <Path d="M6 8 a 6 6 0 0 1 12 0 v3 l2 4 H4 l2 -4 Z M10 19 a2 2 0 0 0 4 0" stroke={C.primary} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
        </Svg>
      ),
    },
    photos: {
      label: 'Photos & appareil photo',
      body: 'Choisis ou prends des photos pour tes annonces, ton profil et tes conversations.',
      glyph: (
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
          <Path d="M3 8 H7 L9 5 H15 L17 8 H21 V19 H3 Z" stroke={C.primary} strokeWidth={1.8} strokeLinejoin="round" />
          <Circle cx={12} cy={13} r={3.5} stroke={C.primary} strokeWidth={1.8} />
        </Svg>
      ),
    },
  };
}

export default function Permissions() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const SPECS = buildSpecs(C);
  const [granted, setGranted] = useState<Record<Perm, boolean>>({
    location: false,
    notifications: false,
    photos: false,
  });
  const [pending, setPending] = useState<Record<Perm, boolean>>({
    location: false,
    notifications: false,
    photos: false,
  });

  const setLocation = useLocationStore((s) => s.setLocation);
  const setStorePermission = useLocationStore((s) => s.setPermission);

  // ---- Location ----------------------------------------------------------
  // Real expo-location flow (Nextdoor-style): prompt → fix → reverse-geocode
  //   → persist locally → sync to /me/profile so the next session knows the
  // user's quartier. We DON'T block the onboarding if the GPS fix times
  // out — the user can still continue and the map screen will re-try.
  const grantLocation = useCallback(async () => {
    setPending((s) => ({ ...s, location: true }));
    try {
      const { status, location } = await resolveLocation();
      setStorePermission(status);

      if (status !== 'granted') {
        Alert.alert(
          'Localisation refusée',
          "Tu peux l'activer plus tard dans les réglages du téléphone — sans elle, MyStreet ne pourra pas filtrer les annonces près de chez toi.",
          [
            { text: 'Plus tard', style: 'cancel' },
            { text: 'Ouvrir les réglages', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }

      if (!location) {
        // Permission OK mais le GPS n'a rien rendu (sous-sol, mode avion).
        // On marque quand même comme "granted" — le map screen re-tentera.
        setGranted((s) => ({ ...s, location: true }));
        toast.show({
          message: 'Localisation activée',
          description: 'On n\'a pas réussi à te localiser tout de suite, on réessaiera.',
          tone: 'warning',
        });
        return;
      }

      // Cache locale + sync backend (silencieux : si /me/profile échoue,
      // l'utilisateur n'est pas bloqué — la map réutilisera le cache local).
      setLocation(location);
      meApi
        .updateProfile({
          lat: location.lat,
          lng: location.lng,
          city: location.city ?? undefined,
          neighborhood: location.neighborhood ?? undefined,
          addressLabel: location.addressLabel ?? undefined,
        })
        .catch((err) => {
          console.warn('[onboarding] sync location to /me failed', err);
        });

      setGranted((s) => ({ ...s, location: true }));
      toast.success(
        location.neighborhood
          ? `Tu es à ${location.neighborhood}`
          : location.city
            ? `Tu es à ${location.city}`
            : 'Localisation activée',
      );
    } finally {
      setPending((s) => ({ ...s, location: false }));
    }
  }, [setLocation, setStorePermission, toast]);

  // ---- Notifications -----------------------------------------------------
  // expo-notifications isn't installed in this build, so we still fake this
  // grant for the moment (the toast pretends it worked). The real wiring
  // will land alongside the push-notification feature.
  const grantNotifications = useCallback(async () => {
    setPending((s) => ({ ...s, notifications: true }));
    try {
      // TODO: replace with `await Notifications.requestPermissionsAsync()`
      // when expo-notifications is added.
      setGranted((s) => ({ ...s, notifications: true }));
      toast.success('Notifications activées');
    } finally {
      setPending((s) => ({ ...s, notifications: false }));
    }
  }, [toast]);

  // ---- Photos ------------------------------------------------------------
  // Camera AND media library — both are needed for the sell flow. We ask
  // sequentially because iOS surfaces a separate prompt for each.
  const grantPhotos = useCallback(async () => {
    setPending((s) => ({ ...s, photos: true }));
    try {
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      if (lib.status !== 'granted' && cam.status !== 'granted') {
        Alert.alert(
          'Photos & appareil photo',
          "Active les autorisations dans les réglages pour pouvoir publier des annonces.",
          [
            { text: 'Plus tard', style: 'cancel' },
            { text: 'Ouvrir les réglages', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      setGranted((s) => ({ ...s, photos: true }));
      toast.success('Photos activées');
    } finally {
      setPending((s) => ({ ...s, photos: false }));
    }
  }, [toast]);

  const handlers: Record<Perm, () => Promise<void>> = {
    location: grantLocation,
    notifications: grantNotifications,
    photos: grantPhotos,
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: insets.top + 32 }}>
        <Text style={{ fontFamily: 'InstrumentSerif-Italic', fontSize: 36, color: C.ink, lineHeight: 40, letterSpacing: -0.6 }}>
          Quelques autorisations, et c'est bon.
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 12, marginBottom: 28, lineHeight: 22 }]}>
          Tu peux modifier chacune d'elles plus tard dans les Paramètres.
        </Text>

        <View style={{ gap: 12 }}>
          {(['location', 'notifications', 'photos'] as Perm[]).map((p) => (
            <View
              key={p}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                backgroundColor: C.surface,
                borderRadius: R.lg,
                borderWidth: 1,
                borderColor: C.divider,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: C.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {SPECS[p].glyph}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
                  {SPECS[p].label}
                </Text>
                <Text style={[t('caption'), { color: C.n500, marginTop: 2, lineHeight: 17 }]}>
                  {SPECS[p].body}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  if (granted[p] || pending[p]) return;
                  void handlers[p]();
                }}
                disabled={granted[p] || pending[p]}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: granted[p] ? C.successSoft : C.ink,
                  opacity: pending[p] ? 0.6 : 1,
                }}
              >
                <Text
                  style={{
                    color: granted[p] ? C.success : '#FFF',
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 13,
                  }}
                >
                  {granted[p] ? 'Activé' : pending[p] ? '…' : 'Autoriser'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 + insets.bottom, backgroundColor: C.paper, borderTopWidth: 1, borderTopColor: C.divider }}>
        <MSButton size="lg" fullWidth onPress={() => router.push('/onboarding/interests' as any)}>
          Continuer
        </MSButton>
      </View>
    </View>
  );
}
