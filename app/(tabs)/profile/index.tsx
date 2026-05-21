import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSAvatar } from '@/components';
import { TrustBadge } from '@/components/profile/TrustBadge';
import { ProfileTabs, type ProfileTabId } from '@/components/profile/ProfileTabs';
import { useFloatingTabBarHeight } from '@/hooks/useFloatingTabBarHeight';
import { useSession } from '@/lib/session';
import { useMe, ME_QUERY_KEY } from '@/hooks/useMe';
import { useMyListings } from '@/hooks/useMyListings';
import {
  formatListingPrice,
  listingMainPhoto,
  type Listing as ApiListing,
} from '@/lib/api';

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
function formatJoinedDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

function statusLabel(l: ApiListing): { tag: 'live' | 'paused' | 'sold' | 'draft'; line: string } {
  // Le backend renvoie ACTIVE / PAUSED / SOLD / DRAFT / ARCHIVED. On compresse
  // ARCHIVED -> 'sold' pour l'affichage (le user a fini avec l'annonce).
  if (l.status === 'PAUSED') return { tag: 'paused', line: 'En pause' };
  if (l.status === 'SOLD' || l.status === 'ARCHIVED') return { tag: 'sold', line: 'Vendu' };
  if (l.status === 'DRAFT') return { tag: 'draft', line: 'Brouillon' };
  // ACTIVE — on affiche les stats si on les a.
  const views = l.viewCount ?? 0;
  const favs = l.favoritesCount ?? 0;
  if (views === 0 && favs === 0) return { tag: 'live', line: 'En ligne' };
  if (favs === 0) return { tag: 'live', line: `${views} vue${views > 1 ? 's' : ''}` };
  return { tag: 'live', line: `${views} vue${views > 1 ? 's' : ''} · ${favs} favori${favs > 1 ? 's' : ''}` };
}

export default function ProfileMine() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useFloatingTabBarHeight();
  const session = useSession();
  const me = useMe();
  const myListings = useMyListings();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<ProfileTabId>('selling');
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh : invalide /me + mes annonces, le React Query
  // re-fetche en arriere-plan et la liste se met a jour.
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const allListings = myListings.data?.content ?? [];
  const liveListings = useMemo(
    () => allListings.filter((l) => l.status === 'ACTIVE' || l.status === 'DRAFT'),
    [allListings],
  );
  const soldListings = useMemo(
    () => allListings.filter((l) => l.status === 'SOLD' || l.status === 'ARCHIVED'),
    [allListings],
  );

  // Stats : on prefere les compteurs du backend (vrais agregats), avec
  // fallback sur le compte local depuis les listings charges si le DTO ne
  // les expose pas encore (ancienne version backend).
  const counts = {
    selling: me.data?.listingsCount ?? liveListings.length,
    sold: me.data?.salesCount ?? soldListings.length,
    reviews: me.data?.reviewsCount ?? 0,
  };

  // Identite : on prefere le backend (/me) au store local (qui ne reflete
  // que les choix faits en onboarding). Fallback sur le store si /me est
  // toujours en train de charger (ex: avant la fin de l'hydratation).
  const displayName = me.data?.displayName || session.displayName || 'Toi';
  const neighborhood = me.data?.neighborhood ?? me.data?.city ?? 'Près de toi';
  const joinedLabel = me.data?.createdAt ? formatJoinedDate(me.data.createdAt) : '';

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
                {displayName}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <Icon.Pin size={11} color={C.n500} />
                <Text style={[t('caption'), { color: C.n500 }]}>
                  {neighborhood}
                  {joinedLabel ? ` · inscrit(e) en ${joinedLabel}` : ''}
                </Text>
              </View>
              {me.data?.rating != null && me.data.rating > 0 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <Svg width={13} height={13} viewBox="0 0 24 24">
                    <Path
                      d="M12 2 L15 9 L22 9.5 L17 14.5 L18.5 22 L12 18 L5.5 22 L7 14.5 L2 9.5 L9 9 Z"
                      fill="#C68A2E"
                    />
                  </Svg>
                  <Text style={[t('bodySm'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}>
                    {me.data.rating.toFixed(1)}
                  </Text>
                  {(me.data.reviewsCount ?? 0) > 0 ? (
                    <Text style={[t('caption'), { color: C.n500 }]}>
                      · {me.data.reviewsCount} avis
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>

          {me.data?.bio ? (
            <Text style={[t('bodySm'), { color: C.n700, marginTop: 14, lineHeight: 20 }]}>
              {me.data.bio}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            <TrustBadge icon="check" label="Identité vérifiée" />
            <TrustBadge icon="phone" label="Téléphone" />
            <TrustBadge icon="email" label="E-mail" />
            <TrustBadge icon="address" label="Adresse confirmée" />
          </View>

          {/* Quick stats — calculees directement depuis les listings du user.
              Vendus + actifs viennent du backend ; les autres (taux/temps de
              reponse) sont des fixtures pour le moment, on les cablera quand
              le backend expose une route /me/stats. */}
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
            <Stat top={String(counts.sold)} bottom="Vendus" />
            <V />
            <Stat top={String(counts.selling)} bottom="En ligne" />
            <V />
            <Stat top={joinedLabel || '—'} bottom="Membre depuis" />
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
            {/* Loading squelette : 4 cartes grises pendant le fetch initial. */}
            {myListings.isLoading && liveListings.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <View
                    key={`sk-${i}`}
                    style={{
                      width: '47.5%',
                      aspectRatio: 0.85,
                      backgroundColor: C.n50,
                      borderRadius: R.lg,
                      borderWidth: 1,
                      borderColor: C.divider,
                    }}
                  />
                ))
              : null}

            {!myListings.isLoading && liveListings.length === 0 ? (
              <View
                style={{
                  width: '100%',
                  paddingVertical: 32,
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Text style={[t('body'), { color: C.n500, textAlign: 'center' }]}>
                  Aucune annonce active.
                </Text>
                <Text style={[t('caption'), { color: C.n400, textAlign: 'center' }]}>
                  Crée ta première en tapant sur le bouton ci-dessous.
                </Text>
              </View>
            ) : null}

            {liveListings.map((listing) => {
              const s = statusLabel(listing);
              return (
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
                      source={{ uri: listingMainPhoto(listing) }}
                      style={{
                        width: '100%',
                        height: '100%',
                        opacity: s.tag === 'paused' ? 0.6 : 1,
                      }}
                      contentFit="cover"
                    />
                    {s.tag === 'paused' && (
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
                    {s.tag === 'draft' && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: R.full,
                          backgroundColor: 'rgba(198,138,46,0.92)',
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
                          BROUILLON
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
                      {formatListingPrice(listing)}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[t('caption'), { color: C.n500, marginTop: 4, fontSize: 10 }]}
                    >
                      {s.line}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
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
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 16,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {soldListings.length === 0 ? (
              <View style={{ width: '100%', paddingVertical: 32, alignItems: 'center' }}>
                <Text style={[t('body'), { color: C.n500 }]}>
                  Aucun article vendu pour l'instant.
                </Text>
              </View>
            ) : (
              soldListings.map((listing) => (
                <Pressable
                  key={listing.id}
                  onPress={() => router.push(`/listing/${listing.id}` as any)}
                  style={{
                    width: '47.5%',
                    backgroundColor: C.surface,
                    borderRadius: R.lg,
                    borderWidth: 1,
                    borderColor: C.divider,
                    overflow: 'hidden',
                  }}
                >
                  <View style={{ aspectRatio: 1 }}>
                    <Image
                      source={{ uri: listingMainPhoto(listing) }}
                      style={{ width: '100%', height: '100%', opacity: 0.7 }}
                      contentFit="cover"
                    />
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text
                      numberOfLines={1}
                      style={[t('bodySm'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}
                    >
                      {listing.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'InstrumentSans-SemiBold',
                        fontSize: 14,
                        color: C.n500,
                        marginTop: 3,
                        textDecorationLine: 'line-through',
                      }}
                    >
                      {formatListingPrice(listing)}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}
        {tab === 'reviews' && (
          <View style={{ paddingHorizontal: 20, paddingTop: 24, alignItems: 'center' }}>
            <Text style={[t('body'), { color: C.n500, textAlign: 'center' }]}>
              Le module avis arrive bientôt — il listera ici les retours laissés par les acheteurs.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
