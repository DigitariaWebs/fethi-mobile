import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSButton, PageHeader } from '@/components';
import { formatEuros } from '@/lib/orders';

// Mock transactions — in a real build this would mirror Stripe's recent
// payouts list under the user's connected account.
const TX = [
  { id: 'p1', when: '2 mai', label: 'Versement',         net: 4405,  status: 'paid' as const },
  { id: 'p2', when: '25 avr.', label: 'Versement',        net: 8520,  status: 'paid' as const },
  { id: 'p3', when: '19 avr.', label: 'Versement (location)', net: 2305, status: 'paid' as const },
];

export default function PayoutsHome() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const balance = 12950;
  const inTransit = 2305;
  const lifetime = 31840;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Revenus" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 + insets.bottom }}>
        {/* Top stat card */}
        <View
          style={[
            Sh.medium,
            {
              backgroundColor: C.ink,
              borderRadius: R.xl,
              padding: 22,
            },
          ]}
        >
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'InstrumentSans-SemiBold', fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Solde disponible
          </Text>
          <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 40, color: C.paper, letterSpacing: -0.8, marginTop: 6 }}>
            {formatEuros(balance)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 22, marginTop: 16 }}>
            <Stat label="En transit" value={formatEuros(inTransit)} dark />
            <Stat label="Total" value={formatEuros(lifetime)} dark />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <MSButton size="md" fullWidth onPress={() => router.push('/payouts/bank' as any)}>
              Banque
            </MSButton>
          </View>
          <View style={{ flex: 1 }}>
            <MSButton size="md" fullWidth variant="secondary" onPress={() => router.push('/payouts/schedule' as any)}>
              Calendrier
            </MSButton>
          </View>
        </View>

        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 11, color: C.n500, letterSpacing: 0.6, marginTop: 22, marginBottom: 8, textTransform: 'uppercase' }}>
          Récent
        </Text>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            overflow: 'hidden',
          }}
        >
          {TX.map((tx, i) => (
            <Pressable
              key={tx.id}
              onPress={() => router.push(`/payouts/transaction/${tx.id}` as any)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 14,
                paddingVertical: 14,
                borderBottomWidth: i < TX.length - 1 ? 1 : 0,
                borderBottomColor: C.divider,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 14, color: C.ink }}>
                  {tx.label}
                </Text>
                <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>{tx.when}</Text>
              </View>
              <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
                {`+${formatEuros(tx.net)}`}
              </Text>
              <Icon.Chevron size={14} color={C.n400} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => router.push('/payouts/connect' as any)}
          style={{
            marginTop: 20,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: R.md,
            backgroundColor: C.warningSoft,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.warning, marginTop: 6 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 13, color: '#7A4F0E' }}>
              Termine ton inscription Stripe Connect
            </Text>
            <Text style={[t('caption'), { color: '#7A4F0E', marginTop: 2 }]}>
              Requise avant le premier versement. Prend 3 minutes.
            </Text>
          </View>
          <Icon.Chevron size={14} color="#7A4F0E" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value, dark }: { label: string; value: string; dark?: boolean }) {
  const C = useColors();
  return (
    <View>
      <Text
        style={{
          fontFamily: 'InstrumentSans-Medium',
          fontSize: 10,
          color: dark ? 'rgba(255,255,255,0.6)' : C.n500,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 17,
          color: dark ? '#FFF' : C.ink,
          marginTop: 3,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
