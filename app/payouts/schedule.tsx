import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { usePayments, type PayoutSchedule } from '@/lib/payments';
import { useToast } from '@/lib/toast';
import { formatEuros } from '@/lib/orders';

export default function ScheduleScreen() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const schedule = usePayments((s) => s.schedule);
  const setSchedule = usePayments((s) => s.setSchedule);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Fréquence de versement" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <SectionTitle>Fréquence</SectionTitle>
        <View style={{ gap: 8 }}>
          {(['daily', 'weekly', 'monthly'] as const).map((c) => {
            const sel = schedule.cadence === c;
            return (
              <Pressable
                key={c}
                onPress={() => setSchedule({ ...schedule, cadence: c })}
                style={{
                  padding: 14,
                  borderRadius: R.md,
                  backgroundColor: C.surface,
                  borderWidth: sel ? 2 : 1,
                  borderColor: sel ? C.ink : C.divider,
                }}
              >
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
                  {c === 'daily' ? 'Journalière' : c === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
                </Text>
                <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
                  {c === 'daily' ? 'Envoyé chaque jour ouvré.' : c === 'weekly' ? 'Envoyé tous les lundis.' : 'Envoyé le 1er de chaque mois.'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionTitle style={{ marginTop: 22 }}>Solde minimum</SectionTitle>
        <View style={{ gap: 8 }}>
          {[1000, 5000, 10000].map((m) => {
            const sel = schedule.minimumCents === m;
            return (
              <Pressable
                key={m}
                onPress={() => setSchedule({ ...schedule, minimumCents: m })}
                style={{
                  padding: 14,
                  borderRadius: R.md,
                  backgroundColor: C.surface,
                  borderWidth: sel ? 2 : 1,
                  borderColor: sel ? C.ink : C.divider,
                }}
              >
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
                  Verser à partir de {formatEuros(m)}
                </Text>
              </Pressable>
            );
          })}
        </View>
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
          onPress={() => {
            toast.success('Calendrier enregistré.');
            router.back();
          }}
        >
          Enregistrer
        </MSButton>
      </View>
    </View>
  );
}

function SectionTitle({ children, style }: { children: React.ReactNode; style?: object }) {
  const C = useColors();
  return (
    <Text
      style={[
        {
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 11,
          color: C.n500,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 8,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
