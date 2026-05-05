import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSButton, PageHeader } from '@/components';
import { useOrders, formatEuros, ORDER_STATUS_LABEL } from '@/lib/orders';

// Order detail. Shared between buyer + seller views; CTAs adapt to role
// and current status.
export default function OrderDetail() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Commande" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[t('body'), { color: C.n500 }]}>Commande introuvable.</Text>
        </View>
      </View>
    );
  }
  const isBuyer = order.buyerId === 'me';

  const stages = [
    { id: 'paid', label: 'Payée', done: true },
    { id: 'meetup', label: 'Se retrouver', done: order.buyerConfirmed || order.sellerConfirmed },
    { id: 'confirmed', label: 'Confirmée', done: order.buyerConfirmed && order.sellerConfirmed },
    {
      id: 'released',
      label: order.type === 'rental' ? 'Caution rendue' : 'Versée au vendeur',
      done: order.type === 'rental' ? !!order.depositReleased : order.status === 'completed',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title={`Commande ${order.id}`} subtitle={ORDER_STATUS_LABEL[order.status]} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 + insets.bottom }}>
        <View
          style={[
            Sh.subtle,
            {
              flexDirection: 'row',
              gap: 12,
              padding: 12,
              backgroundColor: C.surface,
              borderRadius: R.lg,
              borderWidth: 1,
              borderColor: C.divider,
            },
          ]}
        >
          <Image source={{ uri: order.listingThumb }} style={{ width: 72, height: 72, borderRadius: R.md }} contentFit="cover" />
          <View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
            <Text numberOfLines={2} style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink, lineHeight: 19 }}>
              {order.listingTitle}
            </Text>
            <Text style={[t('caption'), { color: C.n500, marginTop: 4 }]}>
              {`${order.type === 'sale' ? 'Vente' : order.type === 'rental' ? 'Location' : 'Service'} · ${formatEuros(order.amountCents)}`}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={{ marginTop: 22, paddingLeft: 6 }}>
          {stages.map((s, i) => (
            <View key={s.id} style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ alignItems: 'center', width: 18 }}>
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: s.done ? C.primary : C.n200,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {s.done ? (
                    <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
                      <Path d="M5 12 L 10 17 L 19 7" stroke="#FFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  ) : null}
                </View>
                {i < stages.length - 1 ? (
                  <View
                    style={{
                      width: 2,
                      flex: 1,
                      backgroundColor: stages[i + 1].done ? C.primary : C.n200,
                      marginVertical: 4,
                    }}
                  />
                ) : null}
              </View>
              <View style={{ paddingBottom: i < stages.length - 1 ? 18 : 0, flex: 1 }}>
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 14, color: s.done ? C.ink : C.n500 }}>
                  {s.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA grid based on state + role */}
        <View style={{ gap: 8, marginTop: 22 }}>
          {order.status === 'awaiting-pickup' || order.status === 'handoff-pending' ? (
            <MSButton size="lg" fullWidth onPress={() => router.push(`/orders/${order.id}/handoff` as any)}>
              {isBuyer ? 'Je confirme avoir récupéré' : 'Je confirme avoir remis'}
            </MSButton>
          ) : null}
          {order.status === 'completed' && !order.buyerReview && isBuyer ? (
            <MSButton size="md" fullWidth variant="secondary" onPress={() => router.push(`/orders/${order.id}/review-prompt` as any)}>
              Laisser un avis
            </MSButton>
          ) : null}
          {order.type === 'rental' && order.buyerConfirmed && order.sellerConfirmed && !order.depositReleased && !isBuyer ? (
            <MSButton size="md" fullWidth onPress={() => router.push(`/orders/${order.id}/release-deposit` as any)}>
              Rendre la caution
            </MSButton>
          ) : null}
          <MSButton size="md" fullWidth variant="ghost" onPress={() => router.push(`/orders/${order.id}/receipt` as any)}>
            Voir le reçu
          </MSButton>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={() => router.push(`/orders/${order.id}/refund-request` as any)}
                style={{ paddingVertical: 12, alignItems: 'center', borderRadius: 999, backgroundColor: C.surface, borderWidth: 1, borderColor: C.divider }}
              >
                <Text style={{ fontFamily: 'InstrumentSans-Medium', fontSize: 13, color: C.ink }}>
                  Remboursement
                </Text>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={() => router.push(`/orders/${order.id}/dispute` as any)}
                style={{ paddingVertical: 12, alignItems: 'center', borderRadius: 999, backgroundColor: C.surface, borderWidth: 1, borderColor: C.divider }}
              >
                <Text style={{ fontFamily: 'InstrumentSans-Medium', fontSize: 13, color: C.danger }}>
                  Litige
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
