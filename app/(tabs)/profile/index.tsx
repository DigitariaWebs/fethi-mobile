import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon, Circle, Path } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSAvatar } from '@/components';
import { TrustBadge } from '@/components/profile/TrustBadge';
import { ProfileTabs, type ProfileTabId } from '@/components/profile/ProfileTabs';
import { useFloatingTabBarHeight } from '@/hooks/useFloatingTabBarHeight';
import { useSession } from '@/lib/session';
import { LISTINGS } from '@/lib/fixtures';

// Phase 7 / Screen 49 — Your profile.
const MY_LISTINGS = [
  { listing: LISTINGS[0], status: 'live' as const, stats: '127 vues · 2 offres' },
  { listing: LISTINGS[3], status: 'live' as const, stats: '48 vues · 1 favori' },
  { listing: LISTINGS[5], status: 'paused' as const, stats: 'En pause depuis 4j' },
];

export default function ProfileMine() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useFloatingTabBarHeight();
  const session = useSession();
  const [tab, setTab] = useState<ProfileTabId>('selling');
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  const counts = { selling: MY_LISTINGS.filter((l) => l.status !== 'paused').length, sold: 8, reviews: 11 };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 6,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 17,
            color: C.ink,
          }}
        >
          Profil
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <Pressable
            style={{
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx={18} cy={5} r={3} stroke={C.ink} strokeWidth={1.8} />
              <Circle cx={6} cy={12} r={3} stroke={C.ink} strokeWidth={1.8} />
              <Circle cx={18} cy={19} r={3} stroke={C.ink} strokeWidth={1.8} />
              <Path
                d="M8.59 13.51 L15.42 17.49 M15.41 6.51 L8.59 10.49"
                stroke={C.ink}
                strokeWidth={1.8}
              />
            </Svg>
          </Pressable>
          <Pressable
            onPress={() => router.push('/settings')}
            style={{
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={3} stroke={C.ink} strokeWidth={1.8} />
              <Path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                stroke={C.ink}
                strokeWidth={1.8}
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ position: 'relative' }}>
              {session.avatarUri ? (
                <View
                  style={[
                    Sh.medium,
                    {
                      width: 76,
                      height: 76,
                      borderRadius: 38,
                      borderWidth: 3,
                      borderColor: C.surface,
                      overflow: 'hidden',
                    },
                  ]}
                >
                  <Image
                    source={{ uri: session.avatarUri }}
                    style={{ width: 70, height: 70 }}
                    contentFit="cover"
                  />
                </View>
              ) : (
                <MSAvatar name={session.displayName || 'Julie M.'} size={76} />
              )}
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: C.accent,
                  borderWidth: 2.5,
                  borderColor: C.paper,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Check size={11} color="#FFF" />
              </View>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[t('h2'), { fontSize: 22, color: C.ink }]}>
                {session.displayName || 'Julie M.'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <Icon.Pin size={11} color={C.n500} />
                <Text style={[t('caption'), { color: C.n500 }]}>
                  Vieux-Lille · inscrit(e) en mars 2024
                </Text>
              </View>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}
              >
                <Star />
                <Text style={[t('bodySm'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}>
                  4.9
                </Text>
                <Text style={[t('caption'), { color: C.n500 }]}>· 11 avis</Text>
              </View>
            </View>
          </View>

          <Text style={[t('bodySm'), { color: C.n700, marginTop: 14, lineHeight: 20 }]}>
            Architecte la semaine, dénicheuse de meubles vintage le week-end. Je vends surtout
            des affaires de mon appartement, je déménage dans plus petit.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            <TrustBadge icon="check" label="Identité vérifiée" />
            <TrustBadge icon="phone" label="Téléphone" />
            <TrustBadge icon="email" label="E-mail" />
            <TrustBadge icon="address" label="Adresse confirmée" />
          </View>

          {/* Quick stats */}
          <View
            style={{
              backgroundColor: C.surface,
              borderRadius: R.lg,
              borderWidth: 1,
              borderColor: C.divider,
              paddingVertical: 14,
              marginTop: 16,
              marginBottom: 16,
              flexDirection: 'row',
            }}
          >
            <Stat top="8" bottom="Vendus" />
            <V />
            <Stat top="24h" bottom="Réponse moy." />
            <V />
            <Stat top="100%" bottom="Taux de récupération" />
          </View>

          <ProfileTabs active={tab} counts={counts} onChange={setTab} />
        </View>

        {/* Listing grid (selling tab) */}
        {tab === 'selling' && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 16,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {MY_LISTINGS.map(({ listing, status, stats }) => (
              <Pressable
                key={listing.id}
                onPress={() => router.push(`/seller/${listing.id}` as any)}
                style={{
                  width: '47.5%',
                  backgroundColor: C.surface,
                  borderRadius: R.lg,
                  borderWidth: 1,
                  borderColor: C.divider,
                  overflow: 'hidden',
                }}
              >
                <View style={{ aspectRatio: 1, position: 'relative' }}>
                  <Image
                    source={{ uri: listing.photo }}
                    style={{ width: '100%', height: '100%', opacity: status === 'paused' ? 0.6 : 1 }}
                    contentFit="cover"
                  />
                  {status === 'paused' && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: R.full,
                        backgroundColor: 'rgba(31,36,33,0.85)',
                      }}
                    >
                      <Text
                        style={{
                          color: '#FFF',
                          fontSize: 10,
                          fontFamily: 'InstrumentSans-Bold',
                          letterSpacing: 0.4,
                        }}
                      >
EN PAUSE
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ padding: 10 }}>
                  <Text
                    numberOfLines={1}
                    style={[
                      t('bodySm'),
                      { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' },
                    ]}
                  >
                    {listing.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'InstrumentSans-SemiBold',
                      fontSize: 14,
                      color: C.ink,
                      marginTop: 3,
                    }}
                  >
                    {listing.priceLabel}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[t('caption'), { color: C.n500, marginTop: 4, fontSize: 10 }]}
                  >
                    {stats}
                  </Text>
                </View>
              </Pressable>
            ))}
            <Pressable
              onPress={() => router.push('/sell')}
              style={{
                width: '47.5%',
                aspectRatio: 0.85,
                borderRadius: R.lg,
                borderWidth: 1.5,
                borderColor: C.n300,
                borderStyle: 'dashed',
                backgroundColor: C.n50,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: C.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Plus size={18} color={C.primary} />
              </View>
              <Text
                style={[
                  t('caption'),
                  { color: C.n600, fontFamily: 'InstrumentSans-SemiBold' },
                ]}
              >
                Nouvelle annonce
              </Text>
            </Pressable>
          </View>
        )}
        {tab === 'sold' && (
          <View style={{ paddingHorizontal: 20, paddingTop: 24, alignItems: 'center' }}>
            <Text style={[t('body'), { color: C.n500 }]}>8 articles vendus — historique des avis bientôt disponible.</Text>
          </View>
        )}
        {tab === 'reviews' && (
          <View style={{ paddingHorizontal: 20, paddingTop: 24, alignItems: 'center' }}>
            <Text style={[t('body'), { color: C.n500 }]}>11 avis — voir le profil public pour la liste complète.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Star() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24">
      <Polygon
        points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"
        fill="#C68A2E"
      />
    </Svg>
  );
}

function Stat({ top, bottom }: { top: string; bottom: string }) {
  const C = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 18, color: C.ink }}>
        {top}
      </Text>
      <Text
        style={[
          t('caption'),
          { color: C.n500, marginTop: 4, fontFamily: 'InstrumentSans-Medium' },
        ]}
      >
        {bottom}
      </Text>
    </View>
  );
}

function V() {
  const C = useColors();
  return <View style={{ width: 1, backgroundColor: C.divider }} />;
}
