import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { Icon, MSAvatar, MSButton, MSPill } from '@/components';
import { useFloatingTabBarHeight } from '@/hooks/useFloatingTabBarHeight';
import { THREADS, type Thread } from '@/lib/threads';

// Phase 4 / Screens 36 + 39 — inbox.
// Renders the thread list. When the list is empty (toggle "Selling" tab to
// see the empty fallback) the empty-state composition replaces the rows.
type Tab = 'all' | 'buying' | 'selling';

export default function Inbox() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useFloatingTabBarHeight();
  const [tab, setTab] = useState<Tab>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    // Mock refresh — real wiring would re-fetch the inbox.
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  // Counts come straight from the source so they stay accurate as threads
  // are added / removed.
  const counts = useMemo(
    () => ({
      all: THREADS.length,
      buying: THREADS.filter((th) => !th.iAmSeller).length,
      selling: THREADS.filter((th) => th.iAmSeller).length,
    }),
    [],
  );

  // Buying = threads where I'm the buyer. Selling = threads where I own
  // the listing. Search is then layered on top — matches against the
  // participant name, listing title, and last-message text.
  const visible: Thread[] = useMemo(() => {
    const byTab =
      tab === 'selling'
        ? THREADS.filter((th) => th.iAmSeller)
        : tab === 'buying'
          ? THREADS.filter((th) => !th.iAmSeller)
          : THREADS;
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((th) =>
      [th.seller.name, th.listing.title, th.lastMessage]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [tab, query]);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12 }}>
        {searchOpen ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: C.surface,
              borderRadius: R.full,
              borderWidth: 1,
              borderColor: C.n200,
              paddingHorizontal: 14,
              height: 44,
            }}
          >
            <Icon.Search size={16} color={C.n500} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une conversation"
              placeholderTextColor={C.n500}
              returnKeyType="search"
              style={{
                flex: 1,
                fontFamily: 'InstrumentSans-Medium',
                fontSize: 15,
                color: C.ink,
                paddingVertical: 0,
              }}
            />
            <Pressable
              onPress={() => {
                setQuery('');
                setSearchOpen(false);
              }}
              hitSlop={6}
            >
              <Text
                style={[t('bodySm'), { color: C.n600, fontFamily: 'InstrumentSans-Medium' }]}
              >
                Annuler
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={[t('h1'), { color: C.ink, fontSize: 28 }]}>Messages</Text>
            <Pressable
              onPress={() => setSearchOpen(true)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: C.surface,
                borderWidth: 1,
                borderColor: C.n200,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.Search size={16} color={C.ink} />
            </Pressable>
          </View>
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 20,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: C.divider,
        }}
      >
        <MSPill size="sm" selected={tab === 'all'} onPress={() => setTab('all')}>
          {`Tout · ${counts.all}`}
        </MSPill>
        <MSPill size="sm" selected={tab === 'buying'} onPress={() => setTab('buying')}>
          {`Achats · ${counts.buying}`}
        </MSPill>
        <MSPill size="sm" selected={tab === 'selling'} onPress={() => setTab('selling')}>
          {`Ventes · ${counts.selling}`}
        </MSPill>
      </View>

      {visible.length === 0 ? (
        query.trim() ? (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <Text style={[t('body'), { color: C.n500 }]}>
              {`Aucune conversation ne correspond à « ${query} ».`}
            </Text>
          </View>
        ) : (
          <EmptyState onBrowse={() => router.replace('/(tabs)/map')} />
        )
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary}
            />
          }
        >
          {visible.map((thread) => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              onPress={() => router.push(`/(tabs)/messages/${thread.id}` as any)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function ThreadRow({ thread, onPress }: { thread: Thread; onPress: () => void }) {
  const C = useColors();
  const offerBadge = (() => {
    if (thread.offerStatus === 'pending')
      return { label: `Offre ${thread.offerAmount}`, bg: C.primarySoft, fg: C.primaryInk };
    if (thread.offerStatus === 'accepted')
      return { label: `Acceptée ${thread.offerAmount}`, bg: C.accentSoft, fg: '#2F4F45' };
    if (thread.offerStatus === 'completed')
      return { label: 'Terminée', bg: C.n100, fg: C.n600 };
    if (thread.offerStatus === 'declined')
      return { label: 'Refusée', bg: C.n100, fg: C.n500 };
    return null;
  })();

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: C.n100 }}
      style={{
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: C.divider,
        backgroundColor: 'transparent',
      }}
    >
      <View style={{ position: 'relative', flexShrink: 0 }}>
        <MSAvatar name={thread.seller.name} size={48} />
        {thread.online && (
          <View
            style={{
              position: 'absolute',
              bottom: -1,
              right: -1,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#3FA66B',
              borderWidth: 2,
              borderColor: C.paper,
            }}
          />
        )}
        <View
          style={{
            position: 'absolute',
            bottom: -4,
            right: -8,
            width: 26,
            height: 26,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: C.paper,
            overflow: 'hidden',
          }}
        >
          <Image
            source={{ uri: thread.listing.thumb }}
            style={{ width: 22, height: 22 }}
            contentFit="cover"
          />
        </View>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 2,
          }}
        >
          <Text
            numberOfLines={1}
            style={[
              t('body'),
              {
                fontFamily:
                  thread.unread > 0 ? 'InstrumentSans-SemiBold' : 'InstrumentSans-Medium',
                color: C.ink,
                flex: 1,
              },
            ]}
          >
            {thread.seller.name}
          </Text>
          <Text
            style={[
              t('caption'),
              {
                color: thread.unread > 0 ? C.primary : C.n500,
                fontFamily:
                  thread.unread > 0 ? 'InstrumentSans-SemiBold' : 'InstrumentSans',
                marginLeft: 8,
              },
            ]}
          >
            {thread.time}
          </Text>
        </View>
        <Text numberOfLines={1} style={[t('caption'), { color: C.n500, marginBottom: 4 }]}>
          {thread.listing.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            numberOfLines={1}
            style={[
              t('bodySm'),
              {
                color: thread.unread > 0 ? C.ink : C.n600,
                fontFamily:
                  thread.unread > 0 ? 'InstrumentSans-Medium' : 'InstrumentSans',
                flex: 1,
              },
            ]}
          >
            {thread.lastFromMe ? `Toi : ${thread.lastMessage}` : thread.lastMessage}
          </Text>
          {thread.unread > 0 && (
            <View
              style={{
                minWidth: 20,
                height: 20,
                paddingHorizontal: 6,
                borderRadius: 10,
                backgroundColor: C.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: '#FFF',
                  fontSize: 11,
                  fontFamily: 'InstrumentSans-Bold',
                }}
              >
                {thread.unread}
              </Text>
            </View>
          )}
        </View>
        {offerBadge && (
          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: R.full,
              backgroundColor: offerBadge.bg,
            }}
          >
            <Text
              style={{
                color: offerBadge.fg,
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 11,
              }}
            >
              {offerBadge.label}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  const C = useColors();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
      }}
    >
      <View style={{ width: 120, height: 100, marginBottom: 28 }}>
        <Svg width={120} height={100} viewBox="0 0 120 100">
          {/* Back bubble */}
          <Path
            d="M 70 18 H 110 a 10 10 0 0 1 10 10 V 56 a 10 10 0 0 1 -10 10 H 96 L 88 76 L 86 66 H 70 a 10 10 0 0 1 -10 -10 V 28 a 10 10 0 0 1 10 -10 Z"
            fill={C.primarySoft}
            stroke={C.primary}
            strokeWidth={1.5}
          />
          <Circle cx={80} cy={42} r={3} fill={C.primary} opacity={0.4} />
          <Circle cx={92} cy={42} r={3} fill={C.primary} opacity={0.4} />
          <Circle cx={104} cy={42} r={3} fill={C.primary} opacity={0.4} />
          {/* Front bubble */}
          <Path
            d="M 12 36 H 56 a 10 10 0 0 1 10 10 V 76 a 10 10 0 0 1 -10 10 H 30 L 22 96 L 20 86 H 12 a 10 10 0 0 1 -10 -10 V 46 a 10 10 0 0 1 10 -10 Z"
            fill={C.surface}
            stroke={C.ink}
            strokeWidth={1.5}
          />
          <Circle cx={22} cy={62} r={3} fill={C.n400} />
          <Circle cx={34} cy={62} r={3} fill={C.n400} />
          <Circle cx={46} cy={62} r={3} fill={C.n400} />
        </Svg>
      </View>
      <Text style={[t('h2'), { color: C.ink, textAlign: 'center' }]}>Pas encore de messages.</Text>
      <Text
        style={[
          t('body'),
          { color: C.n600, textAlign: 'center', marginTop: 10, marginBottom: 28, maxWidth: 280 },
        ]}
      >
        Quand tu écris à un vendeur ou que quelqu'un te contacte au sujet de tes annonces, les
        conversations apparaissent ici.
      </Text>
      <MSButton
        size="lg"
        icon={<Icon.Map size={18} color="#FFF" />}
        onPress={onBrowse}
      >
        Parcourir la carte
      </MSButton>
    </View>
  );
}
