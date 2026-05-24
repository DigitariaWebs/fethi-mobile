import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Polygon, Polyline, Path, Rect, Line } from 'react-native-svg';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { Icon } from '@/components';
import { listingsApi, formatListingPrice, listingMainPhoto, offersApi, type Listing, type OfferResponse } from '@/lib/api';

// Phase 6 / Screen 46 — your live listing.
// Owner POV: stats strip, performance hint, action grid, sticky offers CTA.
export default function SellerListing() {
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [listing, setListing] = useState<Listing | null>(null);
  const [offers, setOffers] = useState<OfferResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    listingsApi.get(id)
      .then((l) => { if (alive) setListing(l); })
      .catch((err) => console.warn('seller listing load', err))
      .finally(() => alive && setLoading(false));
    // Charge les offres recues filtrees pour CETTE annonce
    offersApi.received()
      .then((all) => { if (alive) setOffers(all.filter((o) => o.listingId === id && o.status === 'PENDING')); })
      .catch(() => {});
    return () => { alive = false; };
  }, [id]);

  // Forme compatible avec le rendu legacy (titre, prix formatte, photo)
  const l = useMemo(() => {
    if (!listing) {
      return {
        id: id ?? '',
        title: '',
        photo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
        priceLabel: '',
      };
    }
    return {
      id: listing.id,
      title: listing.title,
      photo: listingMainPhoto(listing),
      priceLabel: formatListingPrice(listing),
    };
  }, [listing, id]);

  // Stats (viewCount/favoritesCount du backend; messages/offers pas exposés)
  const stats = {
    views: listing?.viewCount ?? 0,
    saves: listing?.favoritesCount ?? 0,
    offers: offers.length,
  };

  // Date "il y a X jours"
  const postedDaysAgo = useMemo(() => {
    if (!listing?.createdAt) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(listing.createdAt).getTime()) / (24 * 3600 * 1000)));
  }, [listing?.createdAt]);

  if (loading && !listing) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Hero */}
      <View style={{ height: 360 }}>
        <Image source={{ uri: l.photo }} style={{ flex: 1 }} contentFit="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0)']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110 }}
        />
        <View
          style={{
            position: 'absolute',
            top: insets.top + 8,
            left: 16,
            right: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <RoundChrome onPress={() => router.back()}>
            <Icon.Chevron size={18} dir="left" color={C.ink} />
          </RoundChrome>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <RoundChrome>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle cx={18} cy={5} r={3} stroke={C.ink} strokeWidth={2} />
                <Circle cx={6} cy={12} r={3} stroke={C.ink} strokeWidth={2} />
                <Circle cx={18} cy={19} r={3} stroke={C.ink} strokeWidth={2} />
                <Path
                  d="M8.59 13.51 L15.42 17.49 M15.41 6.51 L8.59 10.49"
                  stroke={C.ink}
                  strokeWidth={2}
                />
              </Svg>
            </RoundChrome>
            <RoundChrome>
              <Icon.Dots size={16} color={C.ink} />
            </RoundChrome>
          </View>
        </View>

        {/* Live badge */}
        <View
          style={{
            position: 'absolute',
            top: insets.top + 60,
            left: 16,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: R.full,
            backgroundColor: 'rgba(31,36,33,0.85)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#5DD68F',
              shadowColor: '#5DD68F',
              shadowOpacity: 0.5,
              shadowRadius: 3,
            }}
          />
          <Text
            style={{
              color: '#FFF',
              fontSize: 11,
              fontFamily: 'InstrumentSans-SemiBold',
              letterSpacing: 0.22,
            }}
          >
            TON ANNONCE · EN LIGNE
          </Text>
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: 16,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <View style={{ width: 18, height: 4, borderRadius: 2, backgroundColor: '#FFF' }} />
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.55)' }} />
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.55)' }} />
        </View>
      </View>

      {/* Body */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: C.paper,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            marginTop: -24,
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[t('h2'), { fontSize: 22, color: C.ink }]}>{l.title}</Text>
              <Text style={[t('caption'), { color: C.n500, marginTop: 4 }]}>
                {listing?.neighborhood ?? 'Lille'} · publiée il y a {postedDaysAgo} jour{postedDaysAgo > 1 ? 's' : ''}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 24,
                color: C.ink,
              }}
            >
              {l.priceLabel}
            </Text>
          </View>

          {/* Stats */}
          <View
            style={{
              marginTop: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              backgroundColor: C.surface,
              borderRadius: R.lg,
              borderWidth: 1,
              borderColor: C.divider,
              flexDirection: 'row',
            }}
          >
            <Stat top={String(stats.views)} bottom="Vues" />
            <Divider />
            <Stat top={String(stats.saves)} bottom="Sauvegardes" />
            <Divider />
            <Stat top={String(stats.offers)} bottom="Offres" accent />
          </View>

          {/* Performance hint */}
          <View
            style={{
              marginTop: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: R.md,
              backgroundColor: C.successSoft,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#1F4F3A" strokeWidth={2.2} />
              <Polyline points="17 6 23 6 23 12" stroke="#1F4F3A" strokeWidth={2.2} />
            </Svg>
            <Text style={[t('bodySm'), { color: '#1F4F3A', flex: 1, lineHeight: 19 }]}>
              <Text style={{ fontFamily: 'InstrumentSans-SemiBold' }}>Très bien parti.</Text> 2× plus de
              vues que les vélos similaires à proximité.
            </Text>
          </View>

          {/* Action grid */}
          <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <ActionTile
              icon={
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    stroke={C.ink}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <Path
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    stroke={C.ink}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                </Svg>
              }
              label="Modifier l'annonce"
            />
            <ActionTile
              accent
              icon={
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Polygon
                    points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                    stroke={C.primary}
                    strokeWidth={2}
                  />
                </Svg>
              }
              label="Booster · €1.99"
            />
            <ActionTile
              icon={
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Rect x={6} y={4} width={4} height={16} stroke={C.ink} strokeWidth={2} />
                  <Rect x={14} y={4} width={4} height={16} stroke={C.ink} strokeWidth={2} />
                </Svg>
              }
              label="Mettre en pause"
            />
            <ActionTile
              icon={<Icon.Check size={14} color={C.ink} />}
              label="Marquer comme vendu"
              onPress={() => router.push(`/seller/${l.id}/sold`)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky offers CTA */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 18 + insets.bottom,
          backgroundColor: isDark ? "rgba(24,21,18,0.95)" : "rgba(251,248,244,0.95)",
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <Pressable
          onPress={() => router.push(`/seller/${l.id}/offers`)}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: R.full,
            backgroundColor: C.ink,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: C.primary,
              }}
            >
              <Text
                style={{
                  color: '#FFF',
                  fontSize: 11,
                  fontFamily: 'InstrumentSans-Bold',
                }}
              >
                {stats.offers}
              </Text>
            </View>
            <Text
              style={[t('body'), { color: '#FFF', fontFamily: 'InstrumentSans-SemiBold' }]}
            >
              Voir les offres
            </Text>
          </View>
          <Icon.Chevron size={16} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

function RoundChrome({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        Sh.subtle,
        {
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: 'rgba(255,255,255,0.95)',
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

function Stat({
  top,
  bottom,
  accent,
}: {
  top: string;
  bottom: string;
  accent?: boolean;
}) {
  const C = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text
        style={{
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 20,
          color: accent ? C.primary : C.ink,
        }}
      >
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

function Divider() {
  const C = useColors();
  return <View style={{ width: 1, backgroundColor: C.divider }} />;
}

function ActionTile({
  icon,
  label,
  accent,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
  onPress?: () => void;
}) {
  const C = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexBasis: '48%',
        flexGrow: 1,
        flexShrink: 1,
        minWidth: 0,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: R.md,
        backgroundColor: accent ? C.primarySoft : C.surface,
        borderWidth: 1,
        borderColor: accent ? C.primary : C.n200,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {icon}
      <Text
        numberOfLines={1}
        style={{
          color: accent ? C.primary : C.ink,
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 13,
          flexShrink: 1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
