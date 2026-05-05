import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Polygon } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSAvatar } from '@/components';
import { TrustBadge } from '@/components/profile/TrustBadge';
import { ProfileTabs, type ProfileTabId } from '@/components/profile/ProfileTabs';
import { LISTINGS, SELLERS, getSeller } from '@/lib/fixtures';
import { BUYERS } from '@/lib/threads';

const REVIEWS = [
  {
    name: 'Marc D.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
    rating: 5,
    time: 'il y a 2 semaines',
    item: 'Table en bois',
    text:
      "Très bien, transaction smooth. Amélie est ponctuelle et l'objet correspondait à la description.",
  },
  {
    name: 'Léa V.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&q=80',
    rating: 5,
    time: 'il y a 1 mois',
    item: 'Vinyles années 90',
    text:
      "Super sympa, elle m'a même donné un café pendant que je récupérais les vinyles. Vrai esprit de quartier !",
  },
];

const RATING_BREAKDOWN = [
  { stars: 5, pct: 92 },
  { stars: 4, pct: 6 },
  { stars: 3, pct: 2 },
  { stars: 2, pct: 0 },
  { stars: 1, pct: 0 },
];

// Phase 7 / Screen 50 — Public profile (someone else's POV).
export default function ProfileOther() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  // Profile can be either a regular seller or a buyer-only counterparty
  // (someone who shows up in our seller-role chats).
  const seller = useMemo(
    () => getSeller(id || '') ?? BUYERS[id || ''] ?? SELLERS.karim,
    [id],
  );
  const sellerListings = useMemo(
    () => LISTINGS.filter((l) => l.sellerId === seller.id).slice(0, 3),
    [seller.id],
  );
  const [tab, setTab] = useState<ProfileTabId>('reviews');

  const counts = {
    selling: sellerListings.length,
    sold: seller.transactions,
    reviews: REVIEWS.length,
  };

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
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.Chevron size={18} color="#FFF" dir="left" />
          </Pressable>
          <Pressable
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
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
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  borderWidth: 4,
                  borderColor: C.paper,
                  overflow: 'hidden',
                },
              ]}
            >
              <MSAvatar name={seller.name} size={76} />
              {seller.verified && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
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
              )}
            </View>
            <View style={{ flex: 1, paddingBottom: 6 }}>
              <Text style={[t('h2'), { fontSize: 22, color: C.ink }]}>{seller.name}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 3,
                }}
              >
                <Icon.Pin size={11} color={C.n500} />
                <Text style={[t('caption'), { color: C.n500 }]}>
à 350 m · Vieux-Lille
                </Text>
              </View>
            </View>
          </View>

          {/* Rating + meta */}
          <View
            style={{
              marginTop: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: C.divider,
              flexWrap: 'wrap',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Star size={14} />
              <Text style={[t('bodySm'), { fontFamily: 'InstrumentSans-SemiBold', color: C.ink }]}>
                {seller.rating.toFixed(1)}
              </Text>
              <Text style={[t('caption'), { color: C.n500 }]}>
                · {REVIEWS.length} avis
              </Text>
            </View>
            <Text style={[t('caption'), { color: C.n500 }]}>· {seller.transactions} ventes</Text>
            <Text style={[t('caption'), { color: C.n500 }]}>· membre depuis {seller.joined}</Text>
          </View>

          {/* Trust badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {seller.verified && <TrustBadge icon="check" label="Identité vérifiée" />}
            <TrustBadge icon="phone" label="Téléphone" />
            <TrustBadge icon="address" label="Adresse confirmée" />
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Pressable
              onPress={() => router.push(`/(tabs)/messages/${seller.id}` as any)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: R.full,
                backgroundColor: C.ink,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Icon.Mail size={13} color="#FFF" />
              <Text
                style={{ color: C.paper, fontFamily: 'InstrumentSans-SemiBold', fontSize: 13 }}
              >
                Message
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: R.full,
                backgroundColor: C.surface,
                borderWidth: 1.5,
                borderColor: C.n200,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Text
                style={{ color: C.ink, fontFamily: 'InstrumentSans-SemiBold', fontSize: 13 }}
              >
Suivre
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
            {/* Rating breakdown */}
            <View
              style={{
                backgroundColor: C.surface,
                borderRadius: R.lg,
                borderWidth: 1,
                borderColor: C.divider,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: 'InstrumentSerif-Italic',
                    fontSize: 36,
                    color: C.ink,
                    lineHeight: 36,
                  }}
                >
                  {seller.rating.toFixed(1)}
                </Text>
                <View style={{ flexDirection: 'row', gap: 1, marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={11} />
                  ))}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                {RATING_BREAKDOWN.map((r) => (
                  <View
                    key={r.stars}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <Text
                      style={[
                        t('caption'),
                        { fontSize: 10, color: C.n500, width: 8 },
                      ]}
                    >
                      {r.stars}
                    </Text>
                    <View
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: C.n100,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${r.pct}%`,
                          height: '100%',
                          backgroundColor: '#C68A2E',
                          borderRadius: 2,
                        }}
                      />
                    </View>
                    <Text
                      style={[
                        t('caption'),
                        { fontSize: 10, color: C.n500, width: 28, textAlign: 'right' },
                      ]}
                    >
                      {r.pct}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {REVIEWS.map((r, i) => (
              <View
                key={i}
                style={{
                  paddingVertical: 14,
                  borderBottomWidth: i < REVIEWS.length - 1 ? 1 : 0,
                  borderBottomColor: C.divider,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden' }}>
                    <Image
                      source={{ uri: r.avatar }}
                      style={{ width: 32, height: 32 }}
                      contentFit="cover"
                    />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={[
                        t('bodySm'),
                        { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' },
                      ]}
                    >
                      {r.name}
                    </Text>
                    <Text style={[t('caption'), { color: C.n500 }]}>
                      {r.item} · {r.time}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 1 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={11} dim={n > r.rating} />
                    ))}
                  </View>
                </View>
                <Text
                  style={[
                    t('bodySm'),
                    { color: C.n700, marginTop: 8, lineHeight: 20 },
                  ]}
                >
                  {r.text}
                </Text>
              </View>
            ))}
          </View>
        )}
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
            {sellerListings.map((listing) => (
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
                  <Image source={{ uri: listing.photo }} style={{ flex: 1 }} contentFit="cover" />
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
                </View>
              </Pressable>
            ))}
          </View>
        )}
        {tab === 'sold' && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={[t('body'), { color: C.n500 }]}>
{seller.transactions} objets vendus — historique public masqué par défaut.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Star({ size = 13, dim = false }: { size?: number; dim?: boolean }) {
  const C = useColors();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"
        fill={dim ? C.n200 : '#C68A2E'}
      />
    </Svg>
  );
}
