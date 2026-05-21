import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { EmptyState, Icon, PageHeader } from '@/components';
import { useNotifications, type Notification } from '@/lib/notifications';

export default function NotificationsScreen() {
  const C = useColors();
  const router = useRouter();
  const items = useNotifications((s) => s.items);
  const load = useNotifications((s) => s.load);
  const markRead = useNotifications((s) => s.markRead);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const [refreshing, setRefreshing] = useState(false);

  // Charge depuis le backend au mount
  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Group by today / yesterday / older.
  const groups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayItems: Notification[] = [];
    const yItems: Notification[] = [];
    const older: Notification[] = [];
    items.forEach((n) => {
      const d = new Date(n.at);
      if (d >= today) todayItems.push(n);
      else if (d >= yesterday) yItems.push(n);
      else older.push(n);
    });
    return { today: todayItems, yesterday: yItems, older };
  }, [items]);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader
        title="Notifications"
        trailing={
          <Pressable onPress={markAllRead} hitSlop={6} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
            <Text style={[t('bodySm'), { color: C.n600, fontFamily: 'InstrumentSans-Medium' }]}>Tout marquer comme lu</Text>
          </Pressable>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          title="Tu es à jour."
          description="Quand il se passe quelque chose, ça apparaît ici."
        />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          {(['today', 'yesterday', 'older'] as const).map((g) => {
            const list = groups[g];
            if (list.length === 0) return null;
            return (
              <View key={g} style={{ marginBottom: 18 }}>
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 11, color: C.n500, letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 6, marginBottom: 8 }}>
                  {g === 'today' ? "Aujourd'hui" : g === 'yesterday' ? 'Hier' : 'Plus tôt'}
                </Text>
                <View
                  style={{
                    backgroundColor: C.surface,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: C.divider,
                    overflow: 'hidden',
                  }}
                >
                  {list.map((n, i) => (
                    <Pressable
                      key={n.id}
                      onPress={() => {
                        markRead(n.id);
                        if (n.href) router.push(n.href as any);
                      }}
                      style={{
                        flexDirection: 'row',
                        gap: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 14,
                        borderBottomWidth: i < list.length - 1 ? 1 : 0,
                        borderBottomColor: C.divider,
                      }}
                    >
                      <KindIcon kind={n.kind} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          numberOfLines={1}
                          style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 14, color: C.ink }}
                        >
                          {n.title}
                        </Text>
                        {n.body ? (
                          <Text numberOfLines={2} style={[t('caption'), { color: C.n500, marginTop: 2, lineHeight: 17 }]}>
                            {n.body}
                          </Text>
                        ) : null}
                      </View>
                      {n.unread ? (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, marginTop: 6 }} />
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function KindIcon({ kind }: { kind: Notification['kind'] }) {
  const C = useColors();
  const tint =
    kind === 'message' ? C.primary
      : kind === 'offer' || kind === 'booking-request' ? C.warning
      : kind === 'listing-sold' || kind === 'order-update' || kind === 'review' ? C.success
      : C.n500;
  const bg = tint + '22';
  return (
    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      {kind === 'message' ? <Icon.Chat size={16} color={tint} />
        : kind === 'offer' ? <Icon.Star size={14} color={tint} />
        : kind === 'booking-request' ? <Icon.Locate size={16} color={tint} />
        : kind === 'listing-sold' || kind === 'order-update' ? (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M5 12 L 10 17 L 19 7" stroke={tint} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ) : kind === 'payout' ? <Icon.Plus size={14} color={tint} />
        : <Icon.Heart size={16} color={tint} />}
    </View>
  );
}
