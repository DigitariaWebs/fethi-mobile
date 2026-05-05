import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { LISTINGS, CURRENT_USER } from '@/lib/fixtures';
import { useSession } from '@/lib/session';

// Buyer describes the service they need. Address defaults to home but
// can be overridden — services come to you, so this is required.
export default function ServiceDetails() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { listingId, date, from } = useLocalSearchParams<{ listingId: string; date: string; from: string }>();
  const sessionAddr = useSession((s) => s.address);
  const listing = LISTINGS.find((l) => l.id === listingId);
  const [details, setDetails] = useState('');
  const [address, setAddress] = useState(sessionAddr || `${CURRENT_USER.neighborhood}, Lille`);

  const valid = details.trim().length >= 8 && address.trim().length >= 6;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PageHeader title="Détails de la réservation" subtitle={listing?.title ?? ''} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            padding: 14,
            marginBottom: 18,
          }}
        >
          <Text style={[t('caption'), { color: C.n500 }]}>Créneau choisi</Text>
          <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 17, color: C.ink, marginTop: 2 }}>
            {date} · {from}
          </Text>
        </View>

        <Label>DE QUOI AS-TU BESOIN ?</Label>
        <TextInput
          autoFocus
          value={details}
          onChangeText={setDetails}
          placeholder="Décris ce que tu veux."
          placeholderTextColor={C.n400}
          multiline
          textAlignVertical="top"
          style={{
            backgroundColor: C.surface,
            borderRadius: R.md,
            borderWidth: 1,
            borderColor: C.divider,
            paddingHorizontal: 16,
            paddingVertical: 14,
            minHeight: 140,
            fontFamily: 'InstrumentSans-Medium',
            fontSize: 16,
            color: C.ink,
          }}
        />

        <Label style={{ marginTop: 24 }}>ADRESSE</Label>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Où doivent-ils venir ?"
          placeholderTextColor={C.n400}
          style={{
            backgroundColor: C.surface,
            borderRadius: R.md,
            borderWidth: 1,
            borderColor: C.divider,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontFamily: 'InstrumentSans-Medium',
            fontSize: 16,
            color: C.ink,
          }}
        />
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 16 + insets.bottom,
          backgroundColor: C.paper,
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <MSButton
          size="lg"
          fullWidth
          state={valid ? undefined : 'disabled'}
          onPress={() =>
            router.push(`/payment/checkout/service/${listingId}?date=${date}&from=${from}` as any)
          }
        >
          Continuer vers le paiement
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: object }) {
  const C = useColors();
  return (
    <Text
      style={[
        {
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 11,
          color: C.n500,
          letterSpacing: 0.6,
          marginBottom: 8,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
