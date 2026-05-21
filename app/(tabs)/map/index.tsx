import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import {
  Icon,
  MSAvatar,
  MSButton,
  MSGlass,
  MSSheetHandle,
} from '@/components';
import {
  MapHost,
  type MapCamera,
  type MapCircle,
  type MapHostRef,
} from '@/components/map/MapHost';
import { MapBackground } from '@/components/map/MapBackground';
import { MapPin } from '@/components/map/MapPin';
import { deltasFromZoom } from '@/components/map/projection';
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_MIN_BOTTOM,
  useFloatingTabBarSpace,
} from '@/components/navigation/FloatingTabBar';
import { CURRENT_USER } from '@/lib/fixtures';
import { useMe } from '@/hooks/useMe';
import { useSellDraft } from '@/lib/sellDraft';
import {
  listingsApi,
  meApi,
  formatListingPrice,
  listingMainPhoto,
  type Listing as ApiListing,
  type ListingType,
} from '@/lib/api';
import { useCategories, flattenLeaves } from '@/hooks/useCategories';
import { reverseGeocode } from '@/lib/location';
import {
  useEffectiveCoords,
  useLocationLabel,
  useLocationStore,
} from '@/lib/locationStore';

// Mapping fixture types <-> backend (mobile UI parle 'sale/rental/service',
// le backend parle 'VENTE/LOCATION/SERVICE').
const FIXTURE_TO_API: Record<'sale' | 'rental' | 'service', ListingType> = {
  sale: 'VENTE',
  rental: 'LOCATION',
  service: 'SERVICE',
};
const API_TO_FIXTURE: Record<ListingType, 'sale' | 'rental' | 'service'> = {
  VENTE: 'sale',
  LOCATION: 'rental',
  SERVICE: 'service',
};

const DEFAULT_RADIUS_M = 500; // rayon par defaut — modifiable via le sheet de filtres

type AdvFilters = {
  categoryId: string | null;
  condition: 'new' | 'likenew' | 'good' | 'fair' | null;
  minPrice: string; // tenu en string pour l'input
  maxPrice: string;
  radiusKm: number; // 0.5 / 1 / 2 / 5
};
const DEFAULT_FILTERS: AdvFilters = {
  categoryId: null,
  condition: null,
  minPrice: '',
  maxPrice: '',
  radiusKm: 0.5,
};
function filtersAreActive(f: AdvFilters): boolean {
  return (
    f.categoryId !== null ||
    f.condition !== null ||
    f.minPrice.trim() !== '' ||
    f.maxPrice.trim() !== '' ||
    f.radiusKm !== 0.5
  );
}
function countActive(f: AdvFilters): number {
  let n = 0;
  if (f.categoryId) n++;
  if (f.condition) n++;
  if (f.minPrice.trim() || f.maxPrice.trim()) n++;
  if (f.radiusKm !== 0.5) n++;
  return n;
}

export default function MapHomeScreen() {
  const C = useColors();
  const router = useRouter();
  const mapRef = useRef<MapHostRef>(null);
  const insets = useSafeAreaInsets();
  const tabBarSpace = useFloatingTabBarSpace();
  // null = no listing sheet showing; map-only state. Selecting a pin pops
  // the sheet up; the close affordance on the sheet drops back to null.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Type filter pill row above the search bar — `all` shows everything,
  // any specific type filters the visible pins.
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'rental' | 'service'>('all');
  // Filtres avances (categorie, etat, prix, rayon) — ouverts dans un modal.
  const [advFilters, setAdvFilters] = useState<AdvFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchRadiusM = useMemo(() => Math.round(advFilters.radiusKm * 1000), [advFilters.radiusKm]);
  // Coords effectives : on lit d'abord le store persistant (rempli lors de
  // l'onboarding par expo-location + reverse-geocode). Si vide -> fallback
  // Lille. Le /me appel ci-dessous peut ensuite raffiner si le backend a
  // une position plus recente (ex: l'user a modifie son profil sur web).
  const effective = useEffectiveCoords();
  const locationLabel = useLocationLabel();
  const storeSetLocation = useLocationStore((s) => s.setLocation);
  // Avatar du user pour la search bar — vient de /me (vrai backend) avec
  // fallback sur le fixture pour ne pas casser l'UI avant que /me arrive.
  const me = useMe();
  const myAvatarName = me.data?.displayName || CURRENT_USER.name;
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: effective.lat,
    lng: effective.lng,
  });
  // Synchronise userCoords avec le store quand l'hydratation arrive apres
  // le premier render (cold start, store vide -> ResolvedLocation).
  useEffect(() => {
    setUserCoords({ lat: effective.lat, lng: effective.lng });
  }, [effective.lat, effective.lng]);
  // Annonces dans le rayon, chargees depuis l'API.
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [locating, setLocating] = useState(false);

  // Recupere la VRAIE position GPS temps reel + recentre la map dessus
  const locateMe = useCallback(async () => {
    if (locating) return;
    setLocating(true);
    try {
      // 1. Permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Localisation refusée',
          'Active la localisation dans les réglages pour voir les annonces proches.',
        );
        return;
      }
      // 2. Position GPS actuelle (precision balanced -> ~10-50m)
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      // 3. Met a jour coords -> declenche le re-fetch via useEffect
      setUserCoords({ lat: latitude, lng: longitude });
      // 4. Recentre la map sur la position
      mapRef.current?.recenter(latitude, longitude);
      // 5. Reverse-geocode + persistence transparente (le label en haut
      // change tout seul via useLocationLabel). On ne bloque pas la
      // re-centring si Photon repond lentement.
      reverseGeocode({ lat: latitude, lng: longitude })
        .then((rg) => {
          storeSetLocation({
            lat: latitude,
            lng: longitude,
            accuracyM: pos.coords.accuracy ?? null,
            addressLabel: rg?.addressLabel ?? null,
            city: rg?.city ?? null,
            neighborhood: rg?.neighborhood ?? null,
            postcode: rg?.postcode ?? null,
            capturedAt: Date.now(),
          });
        })
        .catch(() => {
          // pas grave — on garde quand meme les coords sans label enrichi
          storeSetLocation({
            lat: latitude,
            lng: longitude,
            accuracyM: pos.coords.accuracy ?? null,
            addressLabel: null,
            city: null,
            neighborhood: null,
            postcode: null,
            capturedAt: Date.now(),
          });
        });
    } catch (err) {
      console.warn('locate failed', err);
      Alert.alert('Erreur', 'Impossible de récupérer ta position. Réessaie.');
    } finally {
      setLocating(false);
    }
  }, [locating, storeSetLocation]);

  // Recupere les coordonnees du user au mount depuis le backend. Si /me
  // a quelque chose de plus frais que ce qu'on a en cache local, on prend
  // sa valeur — sinon on laisse le store/Lille par defaut.
  useEffect(() => {
    meApi.get()
      .then((me) => {
        if (me.lat != null && me.lng != null) {
          setUserCoords({ lat: me.lat, lng: me.lng });
        }
      })
      .catch(() => {
        // Si /me echoue (deconnecte), on garde le store / Lille par defaut
      });
  }, []);

  // Loader extrait dans une fonction pour pouvoir l'appeler ailleurs (focus, etc.)
  const fetchListings = useCallback(() => {
    let alive = true;
    setLoadingListings(true);
    const minCents = advFilters.minPrice.trim()
      ? Math.round(parseFloat(advFilters.minPrice.replace(',', '.')) * 100)
      : undefined;
    const maxCents = advFilters.maxPrice.trim()
      ? Math.round(parseFloat(advFilters.maxPrice.replace(',', '.')) * 100)
      : undefined;
    listingsApi.list({
      lat: userCoords.lat,
      lng: userCoords.lng,
      radiusMeters: searchRadiusM,
      listingType: typeFilter === 'all' ? undefined : FIXTURE_TO_API[typeFilter],
      categoryId: advFilters.categoryId ?? undefined,
      condition: advFilters.condition ?? undefined,
      minPriceCents: Number.isFinite(minCents as number) ? minCents : undefined,
      maxPriceCents: Number.isFinite(maxCents as number) ? maxCents : undefined,
      size: 50,
    })
      .then((res) => {
        if (alive) setListings(res.content);
      })
      .catch((err) => {
        console.warn('map listings load failed', err);
        if (alive) setListings([]);
      })
      .finally(() => {
        if (alive) setLoadingListings(false);
      });
    return () => {
      alive = false;
    };
  }, [
    userCoords.lat,
    userCoords.lng,
    typeFilter,
    searchRadiusM,
    advFilters.categoryId,
    advFilters.condition,
    advFilters.minPrice,
    advFilters.maxPrice,
  ]);

  // (Re)charge a chaque changement de coords ou filtre
  useEffect(() => {
    return fetchListings();
  }, [fetchListings]);

  // Re-fetch quand on revient sur la map (typiquement apres /sell/review)
  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [fetchListings]),
  );
  const hasSavedDraft = useSellDraft((s) => s.hasSaved);
  const savedRoute = useSellDraft((s) => s.lastRoute);
  const savedThumb = useSellDraft((s) => s.photos[0]);
  const savedTitle = useSellDraft((s) => s.title);
  const savedCategory = useSellDraft((s) => s.category);


  // Drag-to-dismiss for the listings sheet. Tracks the user's downward
  // drag on the sheet handle / header; dismisses past a threshold or
  // velocity, and snaps back otherwise.
  const dragY = useSharedValue(0);
  const dismissSheet = () => setSelectedId(null);
  const sheetPan = Gesture.Pan()
    .activeOffsetY([10, 9999])
    .failOffsetX([-20, 20])
    .onChange((e) => {
      'worklet';
      if (e.translationY > 0) dragY.value = e.translationY;
    })
    .onEnd((e) => {
      'worklet';
      if (e.translationY > 80 || e.velocityY > 600) {
        dragY.value = withTiming(400, { duration: 200 });
        runOnJS(dismissSheet)();
      } else {
        dragY.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });
  const sheetTransformStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
  }));
  // Reset the sheet's translation whenever a new pin is selected so a
  // freshly-tapped listing pops up from its home position.
  useEffect(() => {
    if (selectedId != null) dragY.value = 0;
  }, [selectedId, dragY]);

  // After Save & exit, the sell flow lands the user back on the map. If
  // a listing sheet was open from before they entered the sell flow we
  // close it so the freshly-saved draft becomes the focus.
  const prevHasSaved = useRef(false);
  useEffect(() => {
    if (hasSavedDraft && !prevHasSaved.current) {
      setSelectedId(null);
    }
    prevHasSaved.current = hasSavedDraft;
  }, [hasSavedDraft]);

  // Live camera + viewport size as Reanimated shared values. The pins
  // read these inside `useAnimatedStyle` worklets, which means each
  // onCameraMove tick repositions every pin on the UI thread — no React
  // reconciliation, no JS-thread scheduling lag, no swim.
  const cameraSv = useSharedValue<MapCamera>({
    latitude: userCoords.lat,
    longitude: userCoords.lng,
    latitudeDelta: 0.006,
    longitudeDelta: 0.009,
    zoom: 16,
  });
  const sizeSv = useSharedValue({ width: 0, height: 0 });

  const selectedApi = useMemo(
    () => (selectedId ? listings.find((l) => l.id === selectedId) ?? null : null),
    [selectedId, listings],
  );
  // Vue compat fixture pour le sheet (titre, prix formate, distance, photo, seller)
  const selected = useMemo(() => {
    if (!selectedApi) return null;
    return {
      id: selectedApi.id,
      title: selectedApi.title,
      priceLabel: formatListingPrice(selectedApi),
      photo: listingMainPhoto(selectedApi),
      thumb: listingMainPhoto(selectedApi),
      distanceLabel: selectedApi.distanceMeters != null
        ? `${selectedApi.distanceMeters} m`
        : (selectedApi.neighborhood ?? 'Lille'),
      distanceMeters: selectedApi.distanceMeters ?? 0,
      condition: selectedApi.condition ?? '',
      category: selectedApi.categoryLabel ?? '',
      listingType: API_TO_FIXTURE[selectedApi.listingType],
    };
  }, [selectedApi]);
  const selectedSeller = useMemo(() => {
    if (!selectedApi) return null;
    return {
      id: selectedApi.owner?.id ?? '',
      name: selectedApi.owner?.displayName ?? 'Voisin·e',
      verified: (selectedApi.owner?.rating ?? 0) >= 4.5,
      rating: selectedApi.owner?.rating ?? 4.5,
      transactions: selectedApi.owner?.reviewsCount ?? 0,
    };
  }, [selectedApi]);

  // Search-radius ring autour du user, dessine nativement par la
  // carte donc il reste colle aux coordonnees pendant pan/zoom.
  const circles: MapCircle[] = useMemo(
    () => [
      {
        id: 'radius',
        lat: userCoords.lat,
        lng: userCoords.lng,
        radiusMeters: searchRadiusM,
      },
    ],
    [userCoords.lat, userCoords.lng, searchRadiusM],
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Map basemap — emits camera changes; pins are drawn over the top */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <MapHost
          ref={mapRef}
          centerLat={userCoords.lat}
          centerLng={userCoords.lng}
          circles={circles}
          onCameraChange={(cam) => {
            cameraSv.value = cam;
          }}
          onSize={(s) => {
            sizeSv.value = s;
            // Seed plausible lat/lng deltas before the first onCameraMove
            // fires, so pins land in the right ballpark on first paint.
            const c = cameraSv.value;
            if (c.latitudeDelta === 0.006 && c.longitudeDelta === 0.009) {
              cameraSv.value = { ...c, ...deltasFromZoom(c.latitude, c.zoom, s) };
            }
          }}
          fallback={<MapBackground />}
        />
      </View>

      {/* Custom glassy pins — transforms run on the UI thread via shared
          values, so they stay locked to their lat/lng during pan/zoom. */}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {listings
          .filter((l) => l.lat != null && l.lng != null)
          .map((l, idx) => {
            const sel = l.id === selectedId;
            // Alterne variants pour un rendu visuel varie (thumb mis en avant)
            const variant = sel
              ? 'selected'
              : idx % 3 === 0
                ? 'thumb'
                : 'default';
            return (
              <MapPin
                key={l.id}
                lat={l.lat!}
                lng={l.lng!}
                variant={variant}
                label={formatListingPrice(l)}
                thumb={listingMainPhoto(l)}
                kind={API_TO_FIXTURE[l.listingType]}
                cameraSv={cameraSv}
                sizeSv={sizeSv}
                onPress={() => setSelectedId(l.id)}
                zIndex={sel ? 11 : 10}
              />
            );
          })}
      </View>

      {/* Top floating search bar */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 6,
          left: 16,
          right: 16,
          zIndex: 30,
        }}
      >
        <MSGlass
          tone="neutralLow"
          style={{
            height: 56,
            borderRadius: R.full,
            paddingHorizontal: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Pressable
            onPress={() => router.push('/(tabs)/profile' as any)}
            style={{ width: 44, height: 44 }}
          >
            <MSAvatar name={myAvatarName} size={44} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/search' as any)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon.Search size={16} color={C.n500} />
            <Text style={[t('body'), { color: C.n600 }]}>{locationLabel}</Text>
          </Pressable>
          <Link href="/(tabs)/map/filters" asChild>
            <Pressable
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: C.glassNeutral,
                borderWidth: 0.5,
                borderColor: C.divider,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.Filter size={18} color={C.ink} />
              <View
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: C.primary,
                  borderWidth: 1.5,
                  borderColor: '#FFF',
                }}
              />
            </Pressable>
          </Link>
        </MSGlass>
      </View>

      {/* Type filter pill row — sits just under the search bar so tapping
          a type filters the visible pins. Le bouton "Filtres" ouvre le sheet
          des filtres avances (categorie, prix, etat, rayon). */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 70,
          left: 16,
          right: 16,
          zIndex: 29,
          flexDirection: 'row',
          gap: 6,
          alignItems: 'center',
        }}
      >
        {(['all', 'sale', 'rental', 'service'] as const).map((k) => {
          const sel = typeFilter === k;
          return (
            <Pressable
              key={k}
              onPress={() => setTypeFilter(k)}
              style={[
                Sh.subtle,
                {
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: sel ? C.ink : C.surface,
                  borderWidth: 1,
                  borderColor: sel ? C.ink : C.divider,
                },
              ]}
            >
              <Text
                style={{
                  color: sel ? C.paper : C.ink,
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 12,
                }}
              >
                {k === 'all' ? 'Tout' : k === 'sale' ? 'À vendre' : k === 'rental' ? 'À louer' : 'Services'}
              </Text>
            </Pressable>
          );
        })}
        {/* Filters button */}
        <Pressable
          onPress={() => setFiltersOpen(true)}
          style={[
            Sh.subtle,
            {
              marginLeft: 'auto',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: filtersAreActive(advFilters) ? C.primary : C.surface,
              borderWidth: 1,
              borderColor: filtersAreActive(advFilters) ? C.primary : C.divider,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            },
          ]}
        >
          <Icon.Filter size={14} color={filtersAreActive(advFilters) ? '#FFF' : C.ink} />
          <Text
            style={{
              color: filtersAreActive(advFilters) ? '#FFF' : C.ink,
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 12,
            }}
          >
            Filtres{filtersAreActive(advFilters) ? ` (${countActive(advFilters)})` : ''}
          </Text>
        </Pressable>
      </View>

      <FiltersModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={advFilters}
        onChange={setAdvFilters}
        listingType={typeFilter}
      />

      {/* Left-side locate control. Tapping recenters the camera on the
          current user. Sits below the type-filter pill row. */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 156,
          left: 16,
          zIndex: 30,
        }}
      >
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
            onPress={locateMe}
            disabled={locating}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon.Locate size={18} color={locating ? C.n400 : C.ink} />
          </Pressable>
        </MSGlass>
      </View>

      {/* Floating "Post a listing" CTA — sits above the listings sheet
          when a pin is selected, otherwise just above the resume-draft
          pill (or the tab bar itself when there's neither). */}
      <View
        style={{
          position: 'absolute',
          right: 16,
          bottom:
            selected != null
              ? tabBarSpace + 260 + (hasSavedDraft ? 72 : 0)
              : hasSavedDraft
                ? tabBarSpace + 140
                : tabBarSpace + 16,
          zIndex: 31,
        }}
      >
        <MSButton
          icon={<Icon.Plus size={16} color="#FFF" />}
          onPress={() => router.push('/sell')}
        >
          Publier une annonce
        </MSButton>
      </View>

      {/* Saved-draft sheet — same "tuck under the tab bar" treatment as
          the listings sheet, so the bar appears to emerge from it. Shown
          only when there's a saved draft and the listings sheet isn't
          already occupying the bottom. */}
      {hasSavedDraft && selected == null ? (
        <View
          style={[
            Sh.sheet,
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 30,
            },
          ]}
        >
          <MSGlass
            tone="sheet"
            style={{
              borderTopLeftRadius: R.xl2,
              borderTopRightRadius: R.xl2,
              paddingTop: 14,
              paddingHorizontal: 16,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: C.primary,
                }}
              />
              <Text
                style={{
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 14,
                  color: C.ink,
                }}
              >
                Termine ton annonce
              </Text>
            </View>

            {/* Draft preview row */}
            <Pressable
              onPress={() => router.push((savedRoute ?? '/sell') as any)}
              style={[
                Sh.subtle,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 10,
                  backgroundColor: C.surface,
                  borderRadius: R.lg,
                  borderWidth: 1,
                  borderColor: C.divider,
                },
              ]}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: R.md,
                  overflow: 'hidden',
                  backgroundColor: C.primarySoft,
                }}
              >
                {savedThumb ? (
                  <Image
                    source={{ uri: savedThumb }}
                    style={{ width: 64, height: 64 }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={[
                    t('body'),
                    { fontFamily: 'InstrumentSans-SemiBold', color: C.ink },
                  ]}
                >
                  {savedTitle ? savedTitle : 'Brouillon sans titre'}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[t('caption'), { color: C.n500, marginTop: 2 }]}
                >
                  {savedCategory}
                </Text>
                <Text
                  style={[
                    t('caption'),
                    {
                      color: C.primary,
                      fontFamily: 'InstrumentSans-SemiBold',
                      marginTop: 4,
                    },
                  ]}
                >
                  Appuie pour reprendre
                </Text>
              </View>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: C.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Chevron size={14} color="#FFF" />
              </View>
            </Pressable>

            {/* Spacer reserves room for the floating tab bar so the sheet's
                glass surface fills the gap below the row. */}
            <View style={{ height: tabBarSpace }} />
          </MSGlass>
        </View>
      ) : null}

      {/* Bottom listings sheet — only mounted when a pin is selected.
          Extends to the very bottom of the screen so its surface visually
          tucks under the floating tab bar (and, when present, the draft
          pill that sits just above the bar). The whole sheet is wrapped
          in a Pan gesture so the user can drag-to-dismiss; the gesture
          only activates after 10px of *downward* travel so the horizontal
          thumbnail scroller stays usable. */}
      {selected && selectedSeller ? (
      <GestureDetector gesture={sheetPan}>
        <Animated.View
          style={[
            Sh.sheet,
            sheetTransformStyle,
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 30,
            },
          ]}
        >
        <MSGlass
          tone="sheet"
          style={{
            borderTopLeftRadius: R.xl2,
            borderTopRightRadius: R.xl2,
          }}
        >
          <MSSheetHandle />

          {/* Header — count on the left, See all + close on the right */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: C.primary,
                }}
              />
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 14,
                  color: C.ink,
                }}
              >
                {loadingListings
                  ? 'Recherche…'
                  : `${listings.length} annonce${listings.length > 1 ? 's' : ''} à moins de 500 m`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable
                onPress={() => router.push('/(tabs)/search/results' as any)}
                hitSlop={6}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 }}
              >
                <Text
                  style={[t('bodySm'), { color: C.n600, fontFamily: 'InstrumentSans-Medium' }]}
                >
                  Tout voir
                </Text>
                <Icon.Chevron size={12} color={C.n600} />
              </Pressable>
              <Pressable
                onPress={dismissSheet}
                hitSlop={8}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: C.n100,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Close size={14} color={C.ink} />
              </Pressable>
            </View>
          </View>

          {/* Selected listing — featured horizontal card */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
            <Pressable
              onPress={() => router.push(`/listing/${selected.id}` as any)}
              style={[
                Sh.subtle,
                {
                  flexDirection: 'row',
                  gap: 12,
                  padding: 10,
                  backgroundColor: C.surface,
                  borderRadius: R.lg,
                  borderWidth: 1,
                  borderColor: C.divider,
                },
              ]}
            >
              <View style={{ width: 80, height: 80, borderRadius: R.md, overflow: 'hidden' }}>
                <Image
                  source={{ uri: selected.photo }}
                  style={{ width: 80, height: 80 }}
                  contentFit="cover"
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: C.primary,
                    }}
                  />
                  <Text style={[t('caption'), { color: C.n500, letterSpacing: 0 }]}>
                    à {selected.distanceLabel}
                  </Text>
                </View>
                <Text
                  numberOfLines={2}
                  style={[
                    t('body'),
                    { fontFamily: 'InstrumentSans-SemiBold', color: C.ink, lineHeight: 19 },
                  ]}
                >
                  {selected.title}
                </Text>
                {/* Sous-titre service : rayon d'intervention si SERVICE */}
                {selectedApi?.listingType === 'SERVICE' && selectedApi.serviceRadiusKm != null ? (
                  <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
                    Intervient dans un rayon de {selectedApi.serviceRadiusKm} km
                  </Text>
                ) : null}
                {/* Sous-titre location : caution */}
                {selectedApi?.listingType === 'LOCATION' && selectedApi.depositCents != null ? (
                  <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
                    Caution : {(selectedApi.depositCents / 100).toFixed(0)} €
                  </Text>
                ) : null}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 4,
                  }}
                >
                  <Text style={[t('h3'), { color: C.ink }]}>{selected.priceLabel}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MSAvatar name={selectedSeller.name} size={18} />
                    <Text style={[t('caption'), { color: C.n600, fontFamily: 'InstrumentSans-Medium' }]}>
                      {selectedSeller.name.split(' ')[0]}
                    </Text>
                    <Text style={[t('caption'), { color: C.n400 }]}>·</Text>
                    <Text style={[t('caption'), { color: C.n600, fontFamily: 'InstrumentSans-SemiBold' }]}>
                      {selectedSeller.rating.toFixed(1)}★
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>

          {/* Adjacent thumbnails */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {listings.filter((l) => l.id !== selected.id)
              .slice(0, 4)
              .map((l) => (
                <Pressable
                  key={l.id}
                  onPress={() => setSelectedId(l.id)}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: R.md,
                    borderWidth: 1,
                    borderColor: C.divider,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Image
                    source={{ uri: listingMainPhoto(l) }}
                    style={{ width: 72, height: 72 }}
                    contentFit="cover"
                  />
                  <View
                    style={{
                      position: 'absolute',
                      left: 4,
                      bottom: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: R.sm,
                      backgroundColor: C.white95,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'InstrumentSans-Bold',
                        fontSize: 11,
                        color: C.ink,
                      }}
                    >
                      {formatListingPrice(l)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: R.md,
                backgroundColor: C.n50,
                borderWidth: 1,
                borderColor: C.n300,
                borderStyle: 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={[t('caption'), { color: C.n600, fontFamily: 'InstrumentSans-SemiBold', textAlign: 'center' }]}
              >
+39{'\n'}autres
              </Text>
            </View>
          </ScrollView>

          {/* Spacer that reserves room for the floating tab bar so the
              thumbnails end above it; the sheet's glass surface fills this
              gap, making the bar feel like it emerges from the sheet.
              When a saved draft is also showing we reserve extra room
              for the compact draft pill that sits between the listing
              content and the tab bar. */}
          <View
            style={{
              height: tabBarSpace + (hasSavedDraft ? 72 : 0),
            }}
          />
        </MSGlass>
        </Animated.View>
      </GestureDetector>
      ) : null}

      {/* Compact draft pill — rendered when a saved draft AND a listing
          sheet are both visible. Sits directly above the floating tab bar
          and inside the listing sheet's reserved bottom strip, giving the
          stacked order: tab bar → draft pill → listing sheet. */}
      {hasSavedDraft && selected ? (
        <Pressable
          onPress={() => router.push((savedRoute ?? '/sell') as any)}
          style={[
            Sh.medium,
            {
              position: 'absolute',
              left: 16,
              right: 16,
              bottom:
                TAB_BAR_HEIGHT + Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM) + 4,
              zIndex: 31,
              height: 64,
              backgroundColor: C.surface,
              borderRadius: 32,
              borderWidth: 1,
              borderColor: C.divider,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 8,
            },
          ]}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              overflow: 'hidden',
              backgroundColor: C.primarySoft,
            }}
          >
            {savedThumb ? (
              <Image
                source={{ uri: savedThumb }}
                style={{ width: 48, height: 48 }}
                contentFit="cover"
              />
            ) : null}
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 14,
                color: C.ink,
              }}
            >
              {savedTitle ? savedTitle : 'Termine ton annonce'}
            </Text>
            <Text numberOfLines={1} style={[t('caption'), { color: C.n500, marginTop: 1 }]}>
              {savedCategory} · Appuie pour reprendre
            </Text>
          </View>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: C.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 4,
            }}
          >
            <Icon.Chevron size={14} color="#FFF" />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// FiltersModal — sheet plein-ecran pour les filtres avances. Categorie (depuis
// backend selon listingType), etat (uniquement pour VENTE), fourchette prix,
// rayon de recherche. On garde l'etat *brouillon* localement puis on commit
// vers le parent via "Appliquer", pour eviter de refetch a chaque keystroke.
// ---------------------------------------------------------------------------
function FiltersModal({
  visible,
  onClose,
  value,
  onChange,
  listingType,
}: {
  visible: boolean;
  onClose: () => void;
  value: AdvFilters;
  onChange: (f: AdvFilters) => void;
  listingType: 'all' | 'sale' | 'rental' | 'service';
}) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<AdvFilters>(value);

  // Sync quand on rouvre le sheet avec une valeur externe modifiee
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  // Univers backend pour les categories. 'all' => VENTE (categorie defaut).
  const apiType: ListingType =
    listingType === 'rental' ? 'LOCATION' : listingType === 'service' ? 'SERVICE' : 'VENTE';
  const { categories: backendTree } = useCategories(apiType);
  const leaves = useMemo(() => flattenLeaves(backendTree), [backendTree]);

  const RADII = [
    { km: 0.3, label: '300 m' },
    { km: 0.5, label: '500 m' },
    { km: 1, label: '1 km' },
    { km: 2, label: '2 km' },
    { km: 5, label: '5 km' },
  ];
  const CONDITIONS = [
    { key: 'new' as const, label: 'Neuf' },
    { key: 'likenew' as const, label: 'Comme neuf' },
    { key: 'good' as const, label: 'Bon état' },
    { key: 'fair' as const, label: 'Correct' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0006' }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: C.paper,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingTop: 10,
          paddingBottom: insets.bottom + 16,
          maxHeight: '85%',
        }}
      >
        {/* Handle */}
        <View
          style={{
            alignSelf: 'center',
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: C.divider,
            marginBottom: 8,
          }}
        />
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 18, color: C.ink }}>
            Filtres
          </Text>
          <Pressable onPress={() => setDraft(DEFAULT_FILTERS)} hitSlop={8}>
            <Text style={{ fontFamily: 'InstrumentSans-Medium', fontSize: 13, color: C.primary }}>
              Réinitialiser
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Rayon */}
          <Text style={[t('caption'), { color: C.n500, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 12, marginBottom: 8 }]}>
            Rayon autour de moi
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {RADII.map((r) => {
              const sel = draft.radiusKm === r.km;
              return (
                <Pressable
                  key={r.km}
                  onPress={() => setDraft((d) => ({ ...d, radiusKm: r.km }))}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: sel ? C.ink : C.surface,
                    borderWidth: 1,
                    borderColor: sel ? C.ink : C.divider,
                  }}
                >
                  <Text style={{ color: sel ? C.paper : C.ink, fontFamily: 'InstrumentSans-SemiBold', fontSize: 12 }}>
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Prix */}
          <Text style={[t('caption'), { color: C.n500, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 18, marginBottom: 8 }]}>
            Prix (€)
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PriceInput
              placeholder="Min"
              value={draft.minPrice}
              onChange={(v) => setDraft((d) => ({ ...d, minPrice: v }))}
            />
            <PriceInput
              placeholder="Max"
              value={draft.maxPrice}
              onChange={(v) => setDraft((d) => ({ ...d, maxPrice: v }))}
            />
          </View>

          {/* Etat — affiche uniquement si pertinent (pas pour SERVICE) */}
          {listingType !== 'service' ? (
            <>
              <Text style={[t('caption'), { color: C.n500, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 18, marginBottom: 8 }]}>
                État
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CONDITIONS.map((c) => {
                  const sel = draft.condition === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      onPress={() => setDraft((d) => ({ ...d, condition: sel ? null : c.key }))}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: sel ? C.ink : C.surface,
                        borderWidth: 1,
                        borderColor: sel ? C.ink : C.divider,
                      }}
                    >
                      <Text style={{ color: sel ? C.paper : C.ink, fontFamily: 'InstrumentSans-SemiBold', fontSize: 12 }}>
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {/* Categorie */}
          {leaves.length > 0 ? (
            <>
              <Text style={[t('caption'), { color: C.n500, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 18, marginBottom: 8 }]}>
                Catégorie
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Pressable
                  onPress={() => setDraft((d) => ({ ...d, categoryId: null }))}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: draft.categoryId == null ? C.ink : C.surface,
                    borderWidth: 1,
                    borderColor: draft.categoryId == null ? C.ink : C.divider,
                  }}
                >
                  <Text style={{ color: draft.categoryId == null ? C.paper : C.ink, fontFamily: 'InstrumentSans-SemiBold', fontSize: 12 }}>
                    Toutes
                  </Text>
                </Pressable>
                {leaves.map((cat) => {
                  const sel = draft.categoryId === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setDraft((d) => ({ ...d, categoryId: sel ? null : cat.id }))}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: sel ? C.ink : C.surface,
                        borderWidth: 1,
                        borderColor: sel ? C.ink : C.divider,
                      }}
                    >
                      <Text style={{ color: sel ? C.paper : C.ink, fontFamily: 'InstrumentSans-SemiBold', fontSize: 12 }}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
        </ScrollView>

        {/* Footer — Appliquer */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.divider }}>
          <Pressable
            onPress={() => {
              onChange(draft);
              onClose();
            }}
            style={{
              backgroundColor: C.primary,
              borderRadius: 999,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontFamily: 'InstrumentSans-SemiBold', fontSize: 14 }}>
              Voir les annonces
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function PriceInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const C = useColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: C.divider,
        paddingHorizontal: 14,
        height: 46,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <TextInput
        value={value}
        onChangeText={(v) => onChange(v.replace(/[^0-9.,]/g, ''))}
        placeholder={placeholder}
        placeholderTextColor={C.n500}
        keyboardType="numeric"
        style={{
          flex: 1,
          fontFamily: 'InstrumentSans-Medium',
          fontSize: 15,
          color: C.ink,
          paddingVertical: 0,
        }}
      />
      <Text style={{ color: C.n500, fontFamily: 'InstrumentSans-Medium', fontSize: 14 }}>€</Text>
    </View>
  );
}
