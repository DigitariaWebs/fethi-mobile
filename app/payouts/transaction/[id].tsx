import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useColors, radius as R, t } from '@/theme';
import { PageHeader } from '@/components';
import { formatEuros } from '@/lib/orders';

const SAMPLE: Record<string, { gross: number; fee: number; date: string; itemTitle: string }> = {
  p1: { gross: 4500, fee: 95, date: '2 mai 2026', itemTitle: 'Machine Nespresso + 40 capsules' },
  p2: { gross: 9500, fee: 980, date: '25 avril 2026', itemTitle: 'Lampe Castiglioni vintage' },
  p3: { gross: 2400, fee: 95, date: '19 avril 2026', itemTitle: 'Perceuse Bosch (location 3 jours)' },
};

export default function TransactionDetail() {
  const C = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tx = SAMPLE[id ?? ''] ?? { gross: 0, fee: 0, date: '—', itemTitle: '—' };
  const net = tx.gross - tx.fee;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Détails du versement" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[t('caption'), { color: C.n500 }]}>{tx.date}</Text>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 36,
            color: C.ink,
            letterSpacing: -0.6,
            marginTop: 4,
          }}
        >
          {`+${formatEuros(net)}`}
        </Text>

        <View
          style={{
            marginTop: 22,
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            padding: 16,
            gap: 10,
          }}
        >
          <Row k="Objet" v={tx.itemTitle} />
          <Row k="Brut" v={formatEuros(tx.gross)} />
          <Row k="Frais de service" v={`-${formatEuros(tx.fee)}`} />
          <View style={{ height: 1, backgroundColor: C.divider }} />
          <Row k="Net" v={formatEuros(net)} bold />
        </View>

        <Text style={[t('caption'), { color: C.n500, marginTop: 14, lineHeight: 16 }]}>
          Les fonds arrivent généralement sous 1 à 2 jours ouvrés. S'ils n'apparaissent pas, vérifie
          auprès de ta banque puis contacte le support.
        </Text>
      </ScrollView>
    </View>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  const C = useColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Text style={[t('bodySm'), { color: C.n600 }]}>{k}</Text>
      <Text
        style={
          bold
            ? { fontFamily: 'InstrumentSans-SemiBold', fontSize: 17, color: C.ink }
            : { fontFamily: 'InstrumentSans-Medium', fontSize: 14, color: C.ink }
        }
      >
        {v}
      </Text>
    </View>
  );
}
