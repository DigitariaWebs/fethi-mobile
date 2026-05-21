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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { Icon, MSButton, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';
import { reportsApi, type ReportTargetType } from '@/lib/api';

// Reusable shape for both report flows. Pass the title + reason list +
// header subtitle + identifie la cible — le composant envoie le POST
// /reports et gere le rate-limit + l'erreur reseau.
type Props = {
  title: string;
  subtitle?: string;
  reasons: string[];
  targetType: ReportTargetType;
  targetId: string;
};

export function ReportFlow({ title, subtitle, reasons, targetType, targetId }: Props) {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const valid = !!reason && details.trim().length >= 8 && !submitting;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title={title} subtitle={subtitle} />
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={[t('body'), { color: C.n600, marginBottom: 16, lineHeight: 22 }]}>
          Les signalements sont étudiés sous 24 h. Nous ne partageons jamais ton identité avec la personne signalée.
        </Text>

        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 11, color: C.n500, letterSpacing: 0.6, marginBottom: 8, textTransform: 'uppercase' }}>
          Raison
        </Text>
        <View style={{ gap: 8 }}>
          {reasons.map((r) => {
            const sel = reason === r;
            return (
              <Pressable
                key={r}
                onPress={() => setReason(r)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 14,
                  borderRadius: R.md,
                  backgroundColor: C.surface,
                  borderWidth: sel ? 2 : 1,
                  borderColor: sel ? C.ink : C.divider,
                }}
              >
                <Text style={{ flex: 1, fontFamily: 'InstrumentSans-Medium', fontSize: 14, color: C.ink }}>{r}</Text>
                {sel ? <Icon.Check size={16} color={C.ink} /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 11, color: C.n500, letterSpacing: 0.6, marginTop: 22, marginBottom: 8, textTransform: 'uppercase' }}>
          Dis-nous-en plus
        </Text>
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="Que s'est-il passé ? Sois précis(e) — liens, horodatages, noms."
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
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 + insets.bottom, backgroundColor: C.paper, borderTopWidth: 1, borderTopColor: C.divider }}>
        <MSButton
          size="lg"
          fullWidth
          state={valid ? undefined : 'disabled'}
          onPress={async () => {
            if (!reason) return;
            setSubmitting(true);
            try {
              await reportsApi.create({
                targetType,
                targetId,
                reason,
                details: details.trim(),
              });
              toast.success("Signalement envoyé — merci. Nous reviendrons vers toi.");
              router.back();
            } catch (err: any) {
              if (err?.code === 'RATE_LIMITED') {
                toast.show({
                  message: 'Trop de signalements',
                  description: 'Attends une heure avant d\'en envoyer un nouveau.',
                  tone: 'warning',
                });
              } else {
                toast.error('Erreur réseau. Réessaie dans un instant.');
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? 'Envoi…' : 'Envoyer le signalement'}
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}
