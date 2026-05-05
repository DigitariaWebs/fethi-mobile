import { ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';

import { useColors, radius as R, t } from '@/theme';
import { PageHeader } from '@/components';
import { useOrders, formatEuros } from '@/lib/orders';

export default function Receipt() {
  const C = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  if (!order) return null;
  const subtotal = order.amountCents - order.feeCents;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Reçu" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            padding: 22,
          }}
        >
          <Text style={{ fontFamily: 'InstrumentSerif-Italic', fontSize: 28, color: C.ink, letterSpacing: -0.4 }}>
            MyStreet
          </Text>
          <Text style={[t('caption'), { color: C.n500, marginTop: 4 }]}>{`Commande ${order.id}`}</Text>
          <Text style={[t('caption'), { color: C.n500 }]}>
            {new Date(order.createdAt).toLocaleString('fr-FR')}
          </Text>

          <View style={{ height: 1, backgroundColor: C.divider, marginVertical: 18 }} />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Image source={{ uri: order.listingThumb }} style={{ width: 56, height: 56, borderRadius: R.md }} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={2} style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 14, color: C.ink, lineHeight: 19 }}>
                {order.listingTitle}
              </Text>
              <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
                {order.type === 'sale' ? 'Vente' : order.type === 'rental' ? 'Location' : 'Service'}
              </Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: C.divider, marginVertical: 18 }} />

          <Row k="Sous-total" v={formatEuros(subtotal)} />
          <Row k="Frais de service" v={formatEuros(order.feeCents)} />
          {order.depositCents ? <Row k="Caution (retenue)" v={formatEuros(order.depositCents)} /> : null}
          <View style={{ height: 1, backgroundColor: C.divider, marginVertical: 10 }} />
          <Row k="Total" v={formatEuros(order.amountCents)} bold />

          <Text style={[t('caption'), { color: C.n500, marginTop: 22, textAlign: 'center', lineHeight: 16 }]}>
            Débité sur ta carte. Envoyé par e-mail.{'\n'}MyStreet · Lille, France · SIREN 000 000 000
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  const C = useColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={[t('bodySm'), { color: bold ? C.ink : C.n600, fontFamily: bold ? 'InstrumentSans-SemiBold' : undefined }]}>
        {k}
      </Text>
      <Text style={{ fontFamily: bold ? 'InstrumentSans-SemiBold' : 'InstrumentSans-Medium', fontSize: bold ? 16 : 14, color: C.ink }}>
        {v}
      </Text>
    </View>
  );
}
