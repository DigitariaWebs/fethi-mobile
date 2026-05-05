import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { Icon, MSButton, MSPill } from '@/components';
import { useSellDraft } from '@/lib/sellDraft';

// Sub-screen of the price step. Lets the seller pick the lowest offer
// they're willing to receive — anything below auto-declines so they
// don't have to deal with lowballs. Surfaced from the price step's
// "Minimum offer" row.
export default function MinOfferScreen() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const draft = useSellDraft();

  const price = draft.price ?? 0;
  const initial =
    draft.minOffer != null
      ? draft.minOffer
      : price > 0
        ? Math.round(price * 0.8)
        : 0;
  const [value, setValue] = useState<string>(String(initial));

  const numeric = parseInt(value || '0', 10);
  const valid = !Number.isNaN(numeric) && numeric > 0 && numeric <= price;

  const presets =
    price > 0
      ? [60, 70, 80, 90].map((pct) => {
          const raw = (price * pct) / 100;
          // Round to a clean number — nearest 5 once we're past €100,
          // otherwise nearest euro.
          const amount = price >= 100 ? Math.round(raw / 5) * 5 : Math.round(raw);
          return { pct, amount };
        })
      : [];

  const save = () => {
    if (!valid) return;
    draft.set({ minOffer: numeric });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: C.divider,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.divider,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.Chevron size={16} color={C.ink} dir="left" />
        </Pressable>
        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 18, color: C.ink }}>
          Offre minimum
        </Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Text style={[t('body'), { color: C.n600, lineHeight: 22 }]}>
          On refuse automatiquement en dessous de ce montant pour t'éviter de
          perdre du temps avec des offres trop basses.
          {price > 0 ? `\n\nTon prix affiché est de €${price}.` : ''}
        </Text>

        {/* Big amount input — matches the price step's typography so the
            two screens read as a single hierarchy. */}
        <View style={{ alignItems: 'center', paddingTop: 36, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 56,
                color: C.ink,
                letterSpacing: -1.12,
              }}
            >
              €
            </Text>
            <TextInput
              value={value}
              onChangeText={(s) => setValue(s.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              autoFocus
              maxLength={6}
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 64,
                color: C.ink,
                letterSpacing: -1.92,
                minWidth: 80,
                padding: 0,
                textAlign: 'left',
              }}
            />
          </View>
          {price > 0 && numeric > 0 ? (
            <Text style={[t('caption'), { color: C.n500, marginTop: 8 }]}>
              {Math.round((numeric / price) * 100)}% du prix affiché
            </Text>
          ) : null}
        </View>

        {/* Presets */}
        {presets.length > 0 ? (
          <View>
            <Text
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 11,
                color: C.n500,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Réglage rapide
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {presets.map((p) => (
                <MSPill
                  key={p.pct}
                  size="sm"
                  selected={numeric === p.amount}
                  onPress={() => setValue(String(p.amount))}
                >
                  {p.pct}% · €{p.amount}
                </MSPill>
              ))}
            </View>
          </View>
        ) : null}

        {!valid && numeric > 0 && price > 0 && numeric > price ? (
          <Text
            style={[t('caption'), { color: C.danger, marginTop: 16 }]}
          >
            L'offre minimum ne peut pas dépasser ton prix affiché (€{price}).
          </Text>
        ) : null}
      </View>

      {/* Sticky CTA */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 24 + insets.bottom,
          backgroundColor: C.paper,
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <MSButton
          size="lg"
          fullWidth
          onPress={save}
          state={valid ? undefined : 'disabled'}
        >
          Enregistrer
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}
