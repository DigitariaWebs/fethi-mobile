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
import { Icon, MSButton, PageHeader } from '@/components';
import { useOrders } from '@/lib/orders';
import { useToast } from '@/lib/toast';

const REASONS = [
  'Objet non conforme à l\'annonce',
  'Jamais reçu',
  'Endommagé à la réception',
  'Le vendeur ne s\'est pas présenté',
  'Autre',
];

export default function Dispute() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const patch = useOrders((s) => s.patch);
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const valid = !!reason && details.trim().length >= 12;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title="Ouvrir un litige" />
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={[t('body'), { color: C.n600, marginBottom: 16, lineHeight: 22 }]}>
          Nous mettons la commande en pause le temps d'enquêter. La plupart des litiges sont résolus en 48 h.
        </Text>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 11,
            color: C.n500,
            letterSpacing: 0.6,
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          Raison
        </Text>
        <View style={{ gap: 8 }}>
          {REASONS.map((r) => {
            const sel = reason === r;
            return (
              <Pressable
                key={r}
                onPress={() => setReason(r)}
                style={{
                  padding: 14,
                  borderRadius: R.md,
                  backgroundColor: C.surface,
                  borderWidth: sel ? 2 : 1,
                  borderColor: sel ? C.ink : C.divider,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Text style={{ flex: 1, fontFamily: 'InstrumentSans-Medium', fontSize: 14, color: C.ink }}>
                  {r}
                </Text>
                {sel ? <Icon.Check size={16} color={C.ink} /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 11,
            color: C.n500,
            letterSpacing: 0.6,
            marginTop: 22,
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          Ce qui s'est passé
        </Text>
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="Dis-nous ce qui s'est passé, ce que tu as déjà essayé, et ce que tu attends."
          placeholderTextColor={C.n400}
          multiline
          textAlignVertical="top"
          style={{
            backgroundColor: C.surface,
            borderRadius: R.md,
            borderWidth: 1,
            borderColor: C.divider,
            padding: 14,
            minHeight: 140,
            fontFamily: 'InstrumentSans-Medium',
            fontSize: 15,
            color: C.ink,
          }}
        />

        <Pressable
          onPress={() => toast.info('Pièces photo — bientôt disponible (démo).')}
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: R.md,
            backgroundColor: C.n50,
            borderWidth: 1,
            borderColor: C.n200,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon.Camera size={18} color={C.n500} />
          <Text style={[t('bodySm'), { color: C.n600, flex: 1 }]}>Ajouter des photos</Text>
          <Icon.Chevron size={14} color={C.n400} />
        </Pressable>
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
            patch(id ?? '', { status: 'disputed' });
            toast.success('Litige ouvert. Nous reviendrons vers toi.');
            router.back();
          }}
        >
          Envoyer le litige
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}
