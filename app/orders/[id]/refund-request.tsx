import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useOrders, formatEuros } from '@/lib/orders';
import { useToast } from '@/lib/toast';

export default function RefundRequest() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const patch = useOrders((s) => s.patch);

  const [mode, setMode] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState(order ? String(order.amountCents / 100) : '');
  const [reason, setReason] = useState('');

  if (!order) return null;
  const valid = parseFloat(amount) > 0 && reason.trim().length >= 8;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title="Demander un remboursement" />
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={[t('body'), { color: C.n600, marginBottom: 18, lineHeight: 22 }]}>
          {`Total de la commande ${formatEuros(order.amountCents)}.`}
        </Text>

        <View style={{ flexDirection: 'row', backgroundColor: C.n50, borderRadius: 999, padding: 4, marginBottom: 18 }}>
          {(['full', 'partial'] as const).map((m) => {
            const sel = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => {
                  setMode(m);
                  if (m === 'full') setAmount(String(order.amountCents / 100));
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 999,
                  alignItems: 'center',
                  backgroundColor: sel ? C.surface : 'transparent',
                }}
              >
                <Text style={{ color: sel ? C.ink : C.n500, fontFamily: 'InstrumentSans-SemiBold', fontSize: 13 }}>
                  {m === 'full' ? 'Remboursement intégral' : 'Remboursement partiel'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'partial' ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              backgroundColor: C.surface,
              borderRadius: R.md,
              borderWidth: 1,
              borderColor: C.divider,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 18,
            }}
          >
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 22, color: C.ink }}>€</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={{
                flex: 1,
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 22,
                color: C.ink,
                padding: 0,
                marginLeft: 4,
              }}
            />
          </View>
        ) : null}

        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 11, color: C.n500, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
          Raison
        </Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Pourquoi un remboursement ?"
          placeholderTextColor={C.n400}
          multiline
          textAlignVertical="top"
          style={{
            backgroundColor: C.surface,
            borderRadius: R.md,
            borderWidth: 1,
            borderColor: C.divider,
            padding: 14,
            minHeight: 120,
            fontFamily: 'InstrumentSans-Medium',
            fontSize: 15,
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
          onPress={() => {
            patch(order.id, { status: 'refunded' });
            toast.success('Remboursement demandé.');
            router.back();
          }}
        >
          Envoyer la demande
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}
