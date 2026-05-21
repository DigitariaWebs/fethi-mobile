import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { useColors, radius as R, shadow as Sh, t, type Palette } from '@/theme';
import { EmptyState, Icon, MSPill, PageHeader } from '@/components';
import { useOrders, ORDER_STATUS_LABEL, formatEuros, type Order, type OrderStatus } from '@/lib/orders';
import { tokenStore } from '@/lib/api';

type Tab = 'buying' | 'selling';

function buildStatusTone(C: Palette): Record<OrderStatus, { fg: string; bg: string }> {
  return {
    'awaiting-pickup': { fg: C.primaryInk, bg: C.primarySoft },
    'handoff-pending': { fg: C.warning, bg: C.warningSoft },
    completed: { fg: C.success, bg: C.successSoft },
    refunded: { fg: C.n600, bg: C.n100 },
    disputed: { fg: C.danger, bg: C.dangerSoft },
    cancelled: { fg: C.n500, bg: C.n100 },
  };
}

export default function OrdersInbox() {
  const C = useColors();
  const router = useRouter();
  const orders = useOrders((s) => s.orders);
  const loadOrders = useOrders((s) => s.load);
  const loading = useOrders((s) => s.loading);
  const [tab, setTab] = useState<Tab>('buying');
  const [refreshing, setRefreshing] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  // Recupere l'userId du token store
  useEffect(() => {
    tokenStore.getUserId().then(setMyUserId);
  }, []);

  // Charge les commandes au mount
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const visible = useMemo(
    () => {
      if (!myUserId) return [];
      return orders.filter((o) =>
        tab === 'buying' ? o.buyerId === myUserId : o.sellerId === myUserId,
      );
    },
    [orders, tab, myUserId],
  );
  const counts = {
    buying: myUserId ? orders.filter((o) => o.buyerId === myUserId).length : 0,
    selling: myUserId ? orders.filter((o) => o.sellerId === myUserId).length : 0,
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Commandes" />
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 12 }}>
        <MSPill size="sm" selected={tab === 'buying'} onPress={() => setTab('buying')}>
          {`En tant qu'acheteur · ${counts.buying}`}
        </MSPill>
        <MSPill size="sm" selected={tab === 'selling'} onPress={() => setTab('selling')}>
          {`En tant que vendeur · ${counts.selling}`}
        </MSPill>
      </View>

      {loading && orders.length === 0 ? (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : visible.length === 0 ? (
        <EmptyState
          title={tab === 'buying' ? 'Aucun achat pour le moment.' : 'Aucune vente pour le moment.'}
          description={
            tab === 'buying'
              ? 'Quand tu paies, tes commandes apparaîtront ici.'
              : 'Quand quelqu\'un achète chez toi, les détails apparaîtront ici.'
          }
        />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
          contentContainerStyle={{ padding: 16, gap: 10 }}
        >
          {visible.map((o) => (
            <OrderRow
              key={o.id}
              order={o}
              onPress={() => router.push(`/orders/${o.id}` as any)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function OrderRow({ order, onPress }: { order: Order; onPress: () => void }) {
  const C = useColors();
  const tone = buildStatusTone(C)[order.status];
  return (
    <Pressable
      onPress={onPress}
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
      <Image
        source={{ uri: order.listingThumb }}
        style={{ width: 64, height: 64, borderRadius: R.md }}
        contentFit="cover"
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 14, color: C.ink }}
        >
          {order.listingTitle}
        </Text>
        <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
          {`${order.type === 'sale' ? 'Vente' : order.type === 'rental' ? 'Location' : 'Service'} · ${formatEuros(order.amountCents)}`}
        </Text>
        <View
          style={{
            alignSelf: 'flex-start',
            marginTop: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: tone.bg,
          }}
        >
          <Text style={{ color: tone.fg, fontFamily: 'InstrumentSans-SemiBold', fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {ORDER_STATUS_LABEL[order.status]}
          </Text>
        </View>
      </View>
      <Icon.Chevron size={14} color={C.n400} />
    </Pressable>
  );
}
