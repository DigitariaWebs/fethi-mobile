import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSButton } from '@/components';
import { useSession } from '@/lib/session';
import { searchAddressesInLille, type GeocodeResult } from '@/lib/geocode';
import { AddressMapPreview } from '@/components/onboarding/AddressMapPreview';

const DEBOUNCE_MS = 250;

export default function Address() {
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setAddress = useSession((s) => s.setAddress);
  const sessionAddress = useSession((s) => s.address);
  const sessionLat = useSession((s) => s.addressLat);
  const sessionLng = useSession((s) => s.addressLng);

  const [value, setValue] = useState(sessionAddress);
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<GeocodeResult | null>(
    sessionLat != null && sessionLng != null
      ? {
          id: 'session',
          label: sessionAddress,
          city: 'Lille',
          lat: sessionLat,
          lng: sessionLng,
        }
      : null,
  );

  const abortRef = useRef<AbortController | null>(null);

  // Debounced fetch — fires when the user has typed and *isn't* currently
  // displaying a freshly-picked address (typing again clears the picked state).
  useEffect(() => {
    const q = value.trim();
    // If the input matches the picked label exactly, don't re-query.
    if (picked && value === picked.label) {
      setResults([]);
      return;
    }
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    const id = setTimeout(() => {
      searchAddressesInLille(q, controller.signal)
        .then((r) => {
          if (controller.signal.aborted) return;
          setResults(r);
          setLoading(false);
        })
        .catch((e) => {
          if (controller.signal.aborted || e?.name === 'AbortError') return;
          setError("Impossible de contacter le service d'adresses. Vérifie ta connexion.");
          setResults([]);
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [value, picked]);

  const pick = (r: GeocodeResult) => {
    setValue(r.label);
    setPicked(r);
    setResults([]);
    setFocused(false);
  };

  const onChange = (next: string) => {
    setValue(next);
    if (picked && next !== picked.label) {
      // Editing past the picked address — invalidate the selection.
      setPicked(null);
    }
  };

  const continueDisabled = !picked;
  const showSuggestions = focused && value.trim().length >= 2 && !picked;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: C.paper }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          zIndex: 20,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.n100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.Chevron size={18} dir="left" color={C.ink} />
        </Pressable>
        <Text style={[t('caption'), { color: C.n500 }]}>Étape 1 sur 2</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 28,
            lineHeight: 32,
            letterSpacing: -0.56,
            color: C.ink,
          }}
        >
          Quelle est ton{'\n'}adresse ?
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 10 }]}>
          MyStreet utilise ton adresse pour afficher les annonces près de chez toi.{' '}
          <Text style={{ color: C.n700, fontFamily: 'InstrumentSans-SemiBold' }}>
            Disponible uniquement à Lille pour le moment.
          </Text>
        </Text>

        {/* Input */}
        <View style={{ marginTop: 32 }}>
          <View
            style={[
              Sh.subtle,
              {
                height: 56,
                paddingHorizontal: 20,
                backgroundColor: C.surface,
                borderRadius: R.full,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderWidth: 1.5,
                borderColor: focused ? C.ink : C.n200,
              },
            ]}
          >
            <Icon.Pin size={18} color={C.n500} />
            <TextInput
              value={value}
              onChangeText={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Commence à taper ton adresse…"
              placeholderTextColor={C.n400}
              style={[t('bodyLg'), { flex: 1, color: C.ink, padding: 0 }]}
              autoCorrect={false}
              autoCapitalize="words"
            />
            {loading && <ActivityIndicator size="small" color={C.n500} />}
            {!loading && picked && (
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: C.success,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Check size={12} color="#FFF" />
              </View>
            )}
          </View>
        </View>

        {/* Suggestion list */}
        {showSuggestions && (
          <View
            style={[
              Sh.medium,
              {
                marginTop: 8,
                backgroundColor: C.surface,
                borderRadius: R.lg,
                borderWidth: 1,
                borderColor: C.divider,
                overflow: 'hidden',
              },
            ]}
          >
            {loading && results.length === 0 && (
              <View
                style={{
                  paddingVertical: 18,
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <ActivityIndicator size="small" color={C.n500} />
                <Text style={[t('caption'), { color: C.n500 }]}>
                  Recherche d'adresses à Lille…
                </Text>
              </View>
            )}
            {!loading && results.length === 0 && !error && (
              <View
                style={{
                  paddingVertical: 18,
                  alignItems: 'center',
                  paddingHorizontal: 16,
                }}
              >
                <Text
                  style={[t('bodySm'), { color: C.n500, textAlign: 'center' }]}
                >
                  Aucun résultat à Lille pour « {value} ». Essaie une rue ou un code postal.
                </Text>
              </View>
            )}
            {error && (
              <View
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={[t('bodySm'), { color: C.danger, textAlign: 'center' }]}
                >
                  {error}
                </Text>
              </View>
            )}
            {results.map((r, i) => {
              // Highlight the matching prefix on the street part.
              const matchLen = Math.min(value.trim().length, r.label.length);
              const head = r.label.slice(0, matchLen);
              const tail = r.label.slice(matchLen);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => pick(r)}
                  android_ripple={{ color: C.n100 }}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    borderBottomWidth: i < results.length - 1 ? 1 : 0,
                    borderBottomColor: C.divider,
                  }}
                >
                  <Icon.Pin size={16} color={C.n400} />
                  <Text style={[t('body'), { flex: 1 }]} numberOfLines={2}>
                    <Text style={{ fontFamily: 'InstrumentSans-SemiBold', color: C.ink }}>
                      {head}
                    </Text>
                    <Text style={{ color: C.n500 }}>{tail}</Text>
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Map preview — follows the picked address */}
        {!showSuggestions && (
          <View style={{ marginTop: 24 }}>
            <AddressMapPreview
              lat={picked?.lat}
              lng={picked?.lng}
              label={picked?.label}
            />
          </View>
        )}

        {/* Privacy reassurance */}
        <View
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: R.md,
            backgroundColor: C.accentSoft,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: C.accent,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            <Icon.Check size={12} color="#FFF" />
          </View>
          <Text style={[t('bodySm'), { color: isDark ? C.n800 : '#1F4F38', lineHeight: 18, flex: 1 }]}>
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold' }}>
              Ton adresse exacte n'est jamais visible par les autres utilisateurs.
            </Text>{' '}
            Les annonces n'affichent qu'une distance approximative — « à 180 m », pas ta porte.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 24 + insets.bottom,
          backgroundColor: isDark ? 'rgba(24,21,18,0.95)' : 'rgba(251,248,244,0.95)',
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <MSButton
          size="lg"
          fullWidth
          state={continueDisabled ? 'disabled' : 'default'}
          onPress={() => {
            if (!picked) return;
            setAddress(picked.label, picked.lat, picked.lng);
            router.push('/onboarding/profile');
          }}
        >
          Continuer
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}
