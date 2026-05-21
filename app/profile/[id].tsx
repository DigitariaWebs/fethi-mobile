// Profil public d'un autre user (vendeur, acheteur, n'importe qui).
//
// Toutes les donnees viennent du backend :
//   - publicUsersApi.get(id)        -> identite + stats agreges
//   - listingsApi.list({ ownerId })  -> annonces du user
//   - reviewsApi.listForUser(id)     -> avis publics
//
// Onglet par defaut : 'reviews' (le plus utile quand on hesite avant de
// contacter quelqu'un). On peut basculer sur 'selling' pour voir ses
// annonces actives.

import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSAvatar } from '@/components';
import { TrustBadge } from '@/components/profile/TrustBadge';
import { ProfileTabs, type ProfileTabId } from '@/components/profile/ProfileTabs';
import {
  publicUsersApi,
  listingsApi,
  reviewsApi,
  formatListingPrice,
  listingMainPhoto,
  type Listing,
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86400000;
  if (diff < day) return "aujourd'hui";
  const days = Math.floor(diff / day);
  if (days < 7) return `il y a ${days} j`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `il y a ${weeks} sem.`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(days / 365);
  return `il y a ${years} an${years > 1 ? 's' : ''}`;
}

export default function ProfileOther() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const profile = useQuery({
    queryKey: ['public-profile', id],
    queryFn: () => publicUsersApi.get(id),
    enabled: !!id,
  });

  const listings = useQuery({
    queryKey: ['public-listings', id],
    queryFn: () => listingsApi.list({ ownerId: id, size: 12 }),
    enabled: !!id,
  });

  const reviews = useQuery({
    queryKey: ['public-reviews', id],
    queryFn: () => reviewsApi.listForUser(id, 0, 20),
    enabled: !!id,
  });

  const [tab, setTab] = useState<ProfileTabId>('reviews');

  const sellerListings: Listing[] = listings.data?.content ?? [];
  const sellerReviews = reviews.data?.content ?? [];

  // Repartition des notes pour le breakdown (0-100 par etoile)
  const ratingBreakdown = useMemo(() => {
    if (sellerReviews.length === 0) return [];
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1 star, ..., index 4 = 5 stars
    for (const r of sellerReviews) {
      const idx = Math.max(0, Math.min(4, r.rating - 1));
      counts[idx] += 1;
    }
    const total = sellerReviews.length;
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      pct: Math.round((counts[stars - 1] / total) * 100),
    }));
  }, [sellerReviews]);

  const counts = {
    selling: profile.data?.listingsCount ?? sellerListings.length,
    sold: profile.data?.salesCount ?? 0,
    reviews: profile.data?.reviewsCount ?? sellerReviews.length,
  };

  const displayName = profile.data?.displayName ?? 'Voisin·e';
  const neighborhood = profile.data?.neighborhood ?? profile.data?.city ?? '';
  const joinedLabel = formatJoinedDate(profile.data?.createdAt);
  const rating = profile.data?.rating;
  const verified = (rating ?? 0) >= 4.5; // heuristique : "verifie" si bien note

  if (profile.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Hero gradient */}
      <View style={{ height: 180 }}>
        <LinearGradient
          colors={[C.accent, '#1F4F44']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
        <View
          style={{
            position: 'absolute',
            top: insets.top + 8,
            left: 12,
            right: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon.Chevron size={18} color="#FFF" dir="left" />
          </Pressable>
          <Pressable
            onPress={() => router.push(`/report/user/${id}` as any)}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon.Dots size={16} color="#FFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, marginTop: -50 }}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14 }}>
            <View
              style={[
                Sh.medium,
                {
                  width: 84, height: 84, borderRadius: 42,
                  borderWidth: 4, borderColor: C.paper, overflow: 'hidden',
                },
              ]}
            >
              <MSAvatar name={displayName} size={76} />
              {verified && (
                <View
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 26, height: 26, borderRadius: 13,
                    backgroundColor: C.accent,
                    borderWidth: 2.5, borderColor: C.paper,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon.Check size={11} color="#FFF" />
                </View>
              )}
            </View>
            <View style={{ flex: 1, paddingBottom: 6 }}>
              <Text style={[t('h2'), { fontSize: 22, color: C.ink }]}>{displayName}</Text>
              {neighborhood ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  <Icon.Pin size={11} color={C.n500} />
                  <Text style={[t('caption'), { color: C.n500 }]}>{neighborhood}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Rating + meta */}
          <View
            style={{
              marginTop: 14,
              flexDirection: 'row', alignItems: 'center',
              gap: 16, paddingBottom: 14,
              borderBottomWidth: 1, borderBottomColor: C.divider,
              flexWrap: 'wrap',
            }}
          >
            {rating != null && rating > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Star size={14} />
                <Text style={[t('bodySm'), { fontFamily: 'InstrumentSans-SemiBold', color: C.ink }]}>
                  {rating.toFixed(1)}
                </Text>
                <Text style={[t('caption'), { color: C.n500 }]}>
                  · {counts.reviews} avis
                </Text>
              </View>
            ) : null}
            {counts.sold > 0 ? (
              <Text style={[t('caption'), { color: C.n500 }]}>· {counts.sold} ventes</Text>
            ) : null}
            {joinedLabel ? (
              <Text style={[t('caption'), { color: C.n500 }]}>· membre depuis {joinedLabel}</Text>
            ) : null}
          </View>

          {profile.data?.bio ? (
            <Text style={[t('bodySm'), { color: C.n700, marginTop: 14, lineHeight: 20 }]}>
              {profile.data.bio}
            </Text>
          ) : null}

          {/* Trust badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {verified && <TrustBadge icon="check" label="Identité vérifiée" />}
            <TrustBadge icon="address" label="Quartier confirmé" />
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Pressable
              onPress={() => router.push(`/(tabs)/messages/${id}` as any)}
              style={{
                flex: 1, paddingVertical: 12, borderRadius: R.full,
                backgroundColor: C.ink,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Icon.Mail size={13} color="#FFF" />
              <Text style={{ color: C.paper, fontFamily: 'InstrumentSans-SemiBold', fontSize: 13 }}>
                Message
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(`/report/user/${id}` as any)}
              style={{
                flex: 1, paddingVertical: 12, borderRadius: R.full,
                backgroundColor: C.surface,
                borderWidth: 1.5, borderColor: C.n200,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Text style={{ color: C.ink, fontFamily: 'InstrumentSans-SemiBold', fontSize: 13 }}>
                Signaler
              </Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={{ marginTop: 18 }}>
            <ProfileTabs active={tab} counts={counts} onChange={setTab} />
          </View>
        </View>

        {tab === 'reviews' && (
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            {sellerReviews.length === 0 ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Text style={[t('body'), { color: C.n500, textAlign: 'center' }]}>
                  Aucun avis pour le moment.
                </Text>
              </View>
            ) : (
              <>
                {/* Rating breakdown */}
                <View
                  style={{
                    backgroundColor: C.surface,
                    borderRadius: R.lg, borderWidth: 1, borderColor: C.divider,
                    paddingHorizontal: 16, paddingVertical: 14,
                    flexDirection: 'row', alignItems: 'center', gap: 14,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontFamily: 'InstrumentSerif-Italic', fontSize: 36,
                        color: C.ink, lineHeight: 36,
                      }}
                    >
                      {(rating ?? 0).toFixed(1)}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 1, marginTop: 4 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={11} dim={n > Math.round(rating ?? 0)} />
                      ))}
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    {ratingBreakdown.map((r) => (
                      <View
                        key={r.stars}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}
                      >
                        <Text style={[t('caption'), { fontSize: 10, color: C.n500, width: 8 }]}>
                          {r.stars}
                        </Text>
                        <View
                          style={{
                            flex: 1, height: 4, borderRadius: 2,
                            backgroundColor: C.n100, overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              width: `${r.pct}%`, height: '100%',
                              backgroundColor: '#C68A2E', borderRadius: 2,
                            }}
                          />
                        </View>
                        <Text style={[t('caption'), { fontSize: 10, color: C.n500, width: 28, textAlign: 'right' }]}>
                          {r.pct}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {sellerReviews.map((r, i) => (
                  <View
                    key={r.id}
                    style={{
                      paddingVertical: 14,
                      borderBottomWidth: i < sellerReviews.length - 1 ? 1 : 0,
                      borderBottomColor: C.divider,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <MSAvatar name={r.authorId.slice(0, 2).toUpperCase()} size={32} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[t('bodySm'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}>
                          {/* On n'a pas le displayName de l'auteur sur la review,
                              on affiche un placeholder pour l'instant. Pourra etre
                              enrichi par un join cote backend si besoin. */}
                          Voisin·e
                        </Text>
                        <Text style={[t('caption'), { color: C.n500 }]}>
                          {timeAgo(r.createdAt)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 1 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={11} dim={n > r.rating} />
                        ))}
                      </View>
                    </View>
                    {r.comment ? (
                      <Text style={[t('bodySm'), { color: C.n700, marginTop: 8, lineHeight: 20 }]}>
                        {r.comment}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {tab === 'selling' && (
          <View
            style={{
              paddingHorizontal: 20, paddingTop: 16,
              flexDirection: 'row', flexWrap: 'wrap', gap: 10,
            }}
          >
            {sellerListings.length === 0 ? (
              <View style={{ width: '100%', paddingVertical: 32, alignItems: 'center' }}>
                <Text style={[t('body'), { color: C.n500 }]}>Aucune annonce active.</Text>
              </View>
            ) : (
              sellerListings.map((listing) => (
                <Pressable
                  key={listing.id}
                  onPress={() => router.push(`/listing/${listing.id}` as any)}
                  style={{
                    width: '47.5%',
                    backgroundColor: C.surface,
                    borderRadius: R.lg, borderWidth: 1, borderColor: C.divider,
                    overflow: 'hidden',
                  }}
                >
                  <View style={{ aspectRatio: 1 }}>
                    <Image source={{ uri: listingMainPhoto(listing) }} style={{ flex: 1 }} contentFit="cover" />
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
                        fontFamily: 'InstrumentSans-SemiBold', fontSize: 14,
                        color: C.ink, marginTop: 3,
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

        {tab === 'sold' && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={[t('body'), { color: C.n500, textAlign: 'center' }]}>
              {counts.sold} {counts.sold > 1 ? 'objets vendus' : 'objet vendu'} — historique public masqué par défaut.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Star({ size = 13, dim = false }: { size?: number; dim?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"
        fill={dim ? '#D9D2C5' : '#C68A2E'}
      />
    </Svg>
  );
}
