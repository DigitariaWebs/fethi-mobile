import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSAvatar, MSButton, MSGlass } from '@/components';
import { FavoriteButton } from '@/components/listing/FavoriteButton';
import { MakeOfferSheet } from '@/components/listing/MakeOfferSheet';
import {
  listingsApi,
  threadsApi,
  formatListingPrice,
  listingMainPhoto,
  ApiError,
  type Listing as ApiListing,
} from '@/lib/api';
import { useOrders } from '@/lib/orders';

const HERO_HEIGHT = 420;

// Phase 3 / Screens 33 + 34 — listing detail combined.
// Above-the-fold: hero photo, glass back/share/save buttons, distance + condition
// pills, title, price, stats strip, seller card, sticky bottom action bar.
// On scroll past hero: a compact sticky header fades in with title + price + share.
export default function ListingDetail() {
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const screenW = Dimensions.get('window').width;

  // -------------------------------------------------------------------
  // Chargement depuis le backend
  // -------------------------------------------------------------------
  const [apiListing, setApiListing] = useState<ApiListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listingsApi
      .get(id)
      .then((l) => {
        if (alive) setApiListing(l);
      })
      .catch((e) => console.warn('listing detail load failed', e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  // Mapping API -> forme attendue par le rendu (compat fixture)
  const listing = useMemo(() => {
    if (!apiListing) {
      // Placeholder pendant le chargement (evite des crash null-pointer)
      return {
        id: id ?? '',
        title: '',
        description: '',
        photo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
        priceLabel: '',
        distanceLabel: '',
        distanceMeters: 0,
        condition: '',
        category: '',
        postedAt: new Date().toISOString(),
        sellerId: '',
      };
    }
    // distanceMeters vient du backend quand on a appele /listings avec
    // lat/lng (filtre rayon). Sur le detail direct sans contexte, on
    // tombe sur null -> on affiche juste le quartier sans la distance.
    const dm = apiListing.distanceMeters;
    const distanceLabel =
      dm != null
        ? (dm < 1000 ? `à ${dm} m` : `à ${(dm / 1000).toFixed(1)} km`)
        : (apiListing.neighborhood ?? 'Lille');
    return {
      id: apiListing.id,
      title: apiListing.title,
      description: apiListing.description ?? '',
      photo: apiListing.photos[0] ??
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
      priceLabel: formatListingPrice(apiListing),
      distanceLabel,
      distanceMeters: dm ?? 0,
      condition: apiListing.condition ?? '',
      category: apiListing.categoryLabel ?? '',
      postedAt: apiListing.createdAt,
      sellerId: apiListing.ownerId,
    };
  }, [apiListing, id]);

  const seller = useMemo(() => ({
    id: apiListing?.owner?.id ?? '',
    name: apiListing?.owner?.displayName ?? 'Voisin·e',
    rating: apiListing?.owner?.rating ?? 4.5,
    transactions: apiListing?.owner?.reviewsCount ?? 0,
    verified: (apiListing?.owner?.rating ?? 0) >= 4.5,
    joined: '',
  }), [apiListing]);

  // Galerie : on n'affiche que les vraies photos de l'annonce. Si l'annonce
  // n'en a qu'une (la plupart des cas en seed), la galerie aura un seul item.
  // C'est correct visuellement (le composant ScrollView horizontal gere ce cas).
  const photos = useMemo(() => apiListing?.photos ?? [], [apiListing]);

  // Annonces similaires : on appelle /listings filtre par type (et categorie
  // si dispo), on garde 6 resultats max, on exclut l'annonce courante.
  const [similar, setSimilar] = useState<ApiListing[]>([]);
  useEffect(() => {
    if (!apiListing) return;
    let alive = true;
    listingsApi
      .list({
        listingType: apiListing.listingType,
        categoryId: apiListing.categoryId ?? undefined,
        size: 8,
        // Si l'annonce a une position, on cherche autour (5 km) pour rester local
        lat: apiListing.lat ?? undefined,
        lng: apiListing.lng ?? undefined,
        radiusMeters: apiListing.lat != null && apiListing.lng != null ? 5000 : undefined,
      })
      .then((res) => {
        if (alive) {
          setSimilar(res.content.filter((l) => l.id !== apiListing.id).slice(0, 6));
        }
      })
      .catch((e) => console.warn('similar load failed', e));
    return () => {
      alive = false;
    };
  }, [apiListing]);

  // Action "Acheter"
  const buyListing = useOrders((s) => s.buyListing);
  const [buying, setBuying] = useState(false);

  // Sheet "Faire une offre" — uniquement pour les ventes avec prix defini
  const [offerOpen, setOfferOpen] = useState(false);
  const canMakeOffer =
    apiListing?.listingType === 'VENTE' &&
    apiListing.priceCents != null &&
    apiListing.priceCents > 0;

  const handleBuy = async () => {
    if (!apiListing || buying) return;
    setBuying(true);
    try {
      const order = await buyListing(apiListing.id);
      router.push(`/orders/${order.id}` as any);
    } catch (err) {
      if (err instanceof ApiError) {
        // CANT_BUY_OWN, LISTING_NOT_AVAILABLE, etc.
        console.warn('buy failed', err.code, err.message);
      } else {
        console.warn('buy failed', err);
      }
    } finally {
      setBuying(false);
    }
  };

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // Compact sticky header — fades in as user scrolls past most of the hero.
  const stickyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HERO_HEIGHT - 200, HERO_HEIGHT - 120],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [HERO_HEIGHT - 200, HERO_HEIGHT - 120],
          [-12, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const heroImageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY.value, [-300, 0], [-150, 0], Extrapolation.CLAMP),
      },
      {
        scale: interpolate(scrollY.value, [-300, 0], [1.6, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const description = listing.description.length > 280
    ? listing.description.slice(0, 280) + '…'
    : listing.description;

  // Loading state — affiche un spinner plein ecran tant que /listings/{id} n'a pas repondu
  if (loading && !apiListing) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        {/* Hero */}
        <Pressable onPress={() => router.push(`/listing/${listing.id}/gallery` as any)}>
          <Animated.View style={[{ height: HERO_HEIGHT }, heroImageStyle]}>
            <Image
              source={{ uri: listing.photo }}
              style={{ width: screenW, height: HERO_HEIGHT }}
              contentFit="cover"
            />
          </Animated.View>
        </Pressable>
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)']}
          locations={[0, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110 }}
          pointerEvents="none"
        />

        {/* Photo dots + count */}
        <View
          style={{
            position: 'absolute',
            top: HERO_HEIGHT - 38,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
          pointerEvents="none"
        >
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {photos.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === 0 ? 7 : 5,
                  height: i === 0 ? 7 : 5,
                  borderRadius: 4,
                  backgroundColor: i === 0 ? '#FFF' : 'rgba(255,255,255,0.55)',
                }}
              />
            ))}
          </View>
        </View>
        <View
          style={{
            position: 'absolute',
            top: HERO_HEIGHT - 44,
            right: 16,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: R.full,
            backgroundColor: 'rgba(0,0,0,0.55)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}
          pointerEvents="none"
        >
          <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={3} width={18} height={18} rx={2} stroke="#FFF" strokeWidth={2.5} />
            <Circle cx={8.5} cy={8.5} r={1.5} stroke="#FFF" strokeWidth={2.5} />
            <Path d="M21 15 l-5 -5 L5 21" stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" />
          </Svg>
          <Text
            style={{
              color: '#FFF',
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 12,
            }}
          >
            1 / {photos.length}
          </Text>
        </View>

        {/* Content panel — slides up over hero */}
        <View
          style={{
            backgroundColor: C.paper,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            marginTop: -40,
            paddingTop: 24,
            paddingHorizontal: 20,
            shadowColor: '#1F2421',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
          }}
        >
          {/* Distance + condition pills */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: R.full,
                backgroundColor: C.primarySoft,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <View
                style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.primary }}
              />
              <Text
                style={[
                  t('caption'),
                  {
                    color: C.primaryInk,
                    fontFamily: 'InstrumentSans-SemiBold',
                    letterSpacing: 0,
                  },
                ]}
              >
                {listing.distanceLabel} · {Math.max(1, Math.round(listing.distanceMeters / 80))} min à pied
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: R.full,
                backgroundColor: C.accentSoft,
              }}
            >
              <Text
                style={[
                  t('caption'),
                  {
                    color: '#2F4F45',
                    fontFamily: 'InstrumentSans-SemiBold',
                    letterSpacing: 0,
                  },
                ]}
              >
                {listing.condition}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 26,
              lineHeight: 31,
              letterSpacing: -0.52,
              color: C.ink,
              marginBottom: 8,
            }}
          >
            {listing.title}
          </Text>

          {/* Price + category */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 32,
                color: C.ink,
                letterSpacing: -0.64,
              }}
            >
              {listing.priceLabel}
            </Text>
            <Text style={[t('bodySm'), { color: C.n500 }]}>· {listing.category}</Text>
          </View>

          {/* Stats strip */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              borderTopWidth: 1,
              borderTopColor: C.divider,
              borderBottomWidth: 1,
              borderBottomColor: C.divider,
              marginBottom: 18,
            }}
          >
            <Stat top="47" bottom="vues" />
            <Divider />
            <Stat top={daysAgo(listing.postedAt) + 'j'} bottom="publiée" />
            <Divider />
            <Stat top="3 proches" bottom="suivent" />
          </View>

          {/* Seller summary card */}
          <Pressable
            onPress={() => router.push(`/profile/${seller.id}` as any)}
            style={{
              backgroundColor: C.surface,
              borderRadius: R.lg,
              padding: 14,
              borderWidth: 1,
              borderColor: C.divider,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <MSAvatar name={seller.name} size={48} verified={seller.verified} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[t('body'), { fontFamily: 'InstrumentSans-SemiBold', color: C.ink }]}>
                {seller.name}
              </Text>
              <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', color: C.ink }}>
                  {seller.rating.toFixed(1)}★
                </Text>{' '}
                · {seller.transactions} ventes · Répond généralement en 1 h
              </Text>
            </View>
            <Icon.Chevron size={16} color={C.n500} />
          </Pressable>

          {/* Description */}
          <SectionLabel>DESCRIPTION</SectionLabel>
          <Text
            style={[t('body'), { color: C.n700, lineHeight: 23, marginBottom: 6 }]}
          >
            {description}
          </Text>
          <Pressable style={{ marginBottom: 24 }}>
            <Text
              style={[
                t('body'),
                {
                  color: C.ink,
                  fontFamily: 'InstrumentSans-SemiBold',
                  textDecorationLine: 'underline',
                },
              ]}
            >
              Voir plus
            </Text>
          </Pressable>

          {/* Meta grid */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              backgroundColor: C.surface,
              padding: 16,
              borderRadius: R.lg,
              borderWidth: 1,
              borderColor: C.divider,
              marginBottom: 24,
              rowGap: 12,
            }}
          >
            <Meta label="État" value={listing.condition} />
            <Meta label="Catégorie" value={listing.category} />
            <Meta label="Remise" value="En main propre" />
            <Meta label="Publiée il y a" value={daysAgo(listing.postedAt) + ' jours'} />
          </View>

          {/* Bloc specifique au type d'annonce — LOCATION / SERVICE */}
          {apiListing != null && apiListing.listingType !== 'VENTE' ? (
            <View
              style={{
                backgroundColor: C.surface,
                padding: 16,
                borderRadius: R.lg,
                borderWidth: 1,
                borderColor: C.divider,
                marginBottom: 24,
                rowGap: 10,
              }}
            >
              <Text
                style={[
                  t('caption'),
                  {
                    color: C.n500,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    marginBottom: 6,
                  },
                ]}
              >
                {apiListing.listingType === 'LOCATION' ? 'Conditions de location' : 'Conditions du service'}
              </Text>

              {apiListing.listingType === 'LOCATION' ? (
                <View style={{ rowGap: 8 }}>
                  {apiListing.pricePerDayCents != null && (
                    <Row2 label="Tarif / jour" value={`${(apiListing.pricePerDayCents / 100).toFixed(2)} €`} />
                  )}
                  {apiListing.pricePerWeekCents != null && (
                    <Row2 label="Tarif / semaine" value={`${(apiListing.pricePerWeekCents / 100).toFixed(2)} €`} />
                  )}
                  {apiListing.depositCents != null && (
                    <Row2 label="Caution" value={`${(apiListing.depositCents / 100).toFixed(2)} €`} />
                  )}
                </View>
              ) : (
                <View style={{ rowGap: 8 }}>
                  {apiListing.hourlyRateCents != null && (
                    <Row2 label="Taux horaire" value={`${(apiListing.hourlyRateCents / 100).toFixed(2)} € / h`} />
                  )}
                  {apiListing.flatRateCents != null && (
                    <Row2 label="Forfait" value={`${(apiListing.flatRateCents / 100).toFixed(2)} €`} />
                  )}
                  {apiListing.serviceRadiusKm != null && (
                    <Row2 label="Rayon d'intervention" value={`${apiListing.serviceRadiusKm} km`} />
                  )}
                </View>
              )}
            </View>
          ) : null}

          {/* Similar nearby */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 12,
            }}
          >
            <SectionLabel>PLUS PRÈS DE TOI</SectionLabel>
            <Pressable>
              <Text
                style={[
                  t('caption'),
                  { color: C.n600, fontFamily: 'InstrumentSans-SemiBold', letterSpacing: 0 },
                ]}
              >
                Tout voir
              </Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {similar.length === 0 ? (
              <Text style={[t('caption'), { color: C.n500, paddingVertical: 18 }]}>
                Pas d'autres annonces similaires pour le moment.
              </Text>
            ) : (
              similar.map((s) => {
                const photo = listingMainPhoto(s);
                const distanceLbl =
                  s.distanceMeters != null
                    ? s.distanceMeters < 1000
                      ? `${s.distanceMeters} m`
                      : `${(s.distanceMeters / 1000).toFixed(1).replace('.', ',')} km`
                    : (s.neighborhood ?? 'Lille');
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => router.push(`/listing/${s.id}` as any)}
                    style={{
                      width: 140,
                      backgroundColor: C.surface,
                      borderRadius: R.lg,
                      borderWidth: 1,
                      borderColor: C.divider,
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      source={{ uri: photo }}
                      style={{ width: 140, height: 100 }}
                      contentFit="cover"
                    />
                    <View style={{ padding: 10 }}>
                      <Text style={[t('caption'), { color: C.n500, marginBottom: 2 }]}>
                        {distanceLbl}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          t('bodySm'),
                          { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' },
                        ]}
                      >
                        {s.title}
                      </Text>
                      <Text
                        style={[
                          t('body'),
                          { fontFamily: 'InstrumentSans-SemiBold', color: C.ink, marginTop: 2 },
                        ]}
                      >
                        {formatListingPrice(s)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </Animated.ScrollView>

      {/* Floating top buttons (over hero) */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          right: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          zIndex: 30,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <MSGlass
            tone="neutralLow"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.Chevron size={18} color={C.ink} dir="left" />
          </MSGlass>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <MSGlass
            tone="neutralLow"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pressable
              onPress={async () => {
                if (!apiListing) return;
                // Deep link mystreet:// pour les users qui ont deja l'app installee,
                // et URL web https://mystreet.fr/l/<id> en fallback pour partage hors-app.
                const message = [
                  apiListing.title,
                  apiListing.priceCents != null
                    ? `${(apiListing.priceCents / 100).toFixed(0)} €`
                    : null,
                  `https://mystreet.fr/l/${apiListing.id}`,
                ].filter(Boolean).join('\n');
                try {
                  await Share.share({
                    message,
                    url: `mystreet://listing/${apiListing.id}`, // ios prefere url
                    title: apiListing.title,
                  });
                } catch (err) {
                  console.warn('share failed', err);
                }
              }}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx={18} cy={5} r={3} stroke={C.ink} strokeWidth={2} />
                <Circle cx={6} cy={12} r={3} stroke={C.ink} strokeWidth={2} />
                <Circle cx={18} cy={19} r={3} stroke={C.ink} strokeWidth={2} />
                <Path
                  d="M8.59 13.51 L15.42 17.49 M15.41 6.51 L8.59 10.49"
                  stroke={C.ink}
                  strokeWidth={2}
                />
              </Svg>
            </Pressable>
          </MSGlass>
          <MSGlass
            tone="neutralLow"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FavoriteButton listingId={listing.id} variant="overlay" size={20} />
          </MSGlass>
        </View>
      </View>

      {/* Sticky compact header (appears on scroll) */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top + 56,
            zIndex: 25,
          },
          stickyStyle,
        ]}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? "rgba(24,21,18,0.95)" : "rgba(251,248,244,0.95)",
            borderBottomWidth: 1,
            borderBottomColor: C.divider,
            paddingTop: insets.top,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.n200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.Chevron size={16} color={C.ink} dir="left" />
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={[
                t('caption'),
                { color: C.n500, fontFamily: 'InstrumentSans-Medium' },
              ]}
            >
              {listing.priceLabel} · {listing.distanceLabel}
            </Text>
            <Text
              numberOfLines={1}
              style={[t('body'), { fontFamily: 'InstrumentSans-SemiBold', color: C.ink }]}
            >
              {listing.title}
            </Text>
          </View>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.n200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FavoriteButton listingId={listing.id} variant="inline" size={16} />
          </View>
        </View>
      </Animated.View>

      {/* Sticky bottom action bar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 12,
          paddingBottom: 16 + insets.bottom,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "rgba(24,21,18,0.95)" : "rgba(251,248,244,0.95)",
          borderTopWidth: 1,
          borderTopColor: C.divider,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={[
            Sh.subtle,
            {
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.n200,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <FavoriteButton listingId={listing.id} variant="inline" size={20} />
        </View>
        <Pressable
          onPress={async () => {
            if (!apiListing) return;
            try {
              const thread = await threadsApi.open(apiListing.id);
              router.push(`/(tabs)/messages/${thread.id}` as any);
            } catch (err) {
              if (err instanceof ApiError && err.code === 'CANT_MESSAGE_SELF') {
                // Tentative de se message a soi-meme : on ignore
                return;
              }
              console.warn('open thread failed', err);
            }
          }}
          style={[
            Sh.subtle,
            {
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: C.surface,
              borderWidth: 1, borderColor: C.n200,
              alignItems: 'center', justifyContent: 'center',
            },
          ]}
        >
          <Icon.Mail size={16} color={C.ink} />
        </Pressable>
        {canMakeOffer ? (
          <Pressable
            onPress={() => setOfferOpen(true)}
            style={[
              Sh.subtle,
              {
                flex: 1, height: 48, borderRadius: 24,
                backgroundColor: C.surface,
                borderWidth: 1.5, borderColor: C.ink,
                flexDirection: 'row',
                alignItems: 'center', justifyContent: 'center', gap: 6,
              },
            ]}
          >
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 14, color: C.ink }}>
              Faire une offre
            </Text>
          </Pressable>
        ) : null}
        <View style={{ flex: 1.2 }}>
          <MSButton size="lg" fullWidth onPress={handleBuy} state={buying ? 'disabled' : 'default'}>
            {buying ? 'Achat…' : 'Acheter'}
          </MSButton>
        </View>
      </View>

      {/* Sheet "Faire une offre" */}
      {apiListing && canMakeOffer ? (
        <MakeOfferSheet
          visible={offerOpen}
          onClose={() => setOfferOpen(false)}
          listingId={apiListing.id}
          listingTitle={apiListing.title}
          askingPriceCents={apiListing.priceCents!}
        />
      ) : null}
    </View>
  );
}

function Stat({ top, bottom }: { top: string; bottom: string }) {
  const C = useColors();
  return (
    <View style={{ flex: 1 }}>
      <Text style={[t('h3'), { fontSize: 16, color: C.ink }]}>{top}</Text>
      <Text style={[t('caption'), { color: C.n500 }]}>{bottom}</Text>
    </View>
  );
}

function Divider() {
  const C = useColors();
  return <View style={{ width: 1, height: 32, backgroundColor: C.divider }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const C = useColors();
  return (
    <Text
      style={{
        fontFamily: 'InstrumentSans-SemiBold',
        fontSize: 12,
        color: C.n500,
        letterSpacing: 0.48,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const C = useColors();
  return (
    <View style={{ width: '50%' }}>
      <Text style={[t('caption'), { color: C.n500 }]}>{label}</Text>
      <Text style={[t('body'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}>
        {value}
      </Text>
    </View>
  );
}

/** Ligne "label ... valeur" pour le bloc location/service. */
function Row2({ label, value }: { label: string; value: string }) {
  const C = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={[t('body'), { color: C.n600 }]}>{label}</Text>
      <Text style={[t('body'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}>
        {value}
      </Text>
    </View>
  );
}

function daysAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(d)).toString();
}
