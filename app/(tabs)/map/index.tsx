import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
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
import { LISTINGS, SELLERS, CURRENT_USER } from '@/lib/fixtures';
import { useSellDraft } from '@/lib/sellDraft';

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
    latitude: CURRENT_USER.lat,
    longitude: CURRENT_USER.lng,
    latitudeDelta: 0.006,
    longitudeDelta: 0.009,
    zoom: 16,
  });
  const sizeSv = useSharedValue({ width: 0, height: 0 });

  const selected = useMemo(
    () => (selectedId ? LISTINGS.find((l) => l.id === selectedId) : null),
    [selectedId],
  );
  const selectedSeller = selected ? SELLERS[selected.sellerId] : null;

  // 500m search-radius ring around the user's home, drawn natively by
  // the basemap so it stays glued to the coordinate.
  const circles: MapCircle[] = useMemo(
    () => [
      {
        id: 'radius',
        lat: CURRENT_USER.lat,
        lng: CURRENT_USER.lng,
        radiusMeters: 500,
      },
    ],
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Map basemap — emits camera changes; pins are drawn over the top */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <MapHost
          ref={mapRef}
          centerLat={CURRENT_USER.lat}
          centerLng={CURRENT_USER.lng}
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
        {LISTINGS.filter((l) => typeFilter === 'all' || l.listingType === typeFilter).map((l) => {
          const sel = l.id === selectedId;
          const variant = sel
            ? 'selected'
            : ['1', '3', '4', '5'].includes(l.id)
              ? 'thumb'
              : 'default';
          return (
            <MapPin
              key={l.id}
              lat={l.lat}
              lng={l.lng}
              variant={variant}
              label={l.priceLabel}
              thumb={l.thumb}
              kind={l.listingType}
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
            <MSAvatar name={CURRENT_USER.name} size={44} />
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
            <Text style={[t('body'), { color: C.n600 }]}>{CURRENT_USER.neighborhood}</Text>
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
          a type filters the visible pins. */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 70,
          left: 16,
          right: 16,
          zIndex: 29,
          flexDirection: 'row',
          gap: 6,
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
      </View>

      {/* Right-side locate control. Positioned beneath Apple Maps' built-in
          3D / pitch toggle (which sits a little below the search bar at
          top-right). Tapping recenters the camera on the current user. */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 156,
          right: 16,
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
            onPress={() => mapRef.current?.recenter(CURRENT_USER.lat, CURRENT_USER.lng)}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon.Locate size={18} color={C.ink} />
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
                {LISTINGS.length * 5 + 3} annonces à moins de 500 m
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
            {LISTINGS.filter((l) => l.id !== selected.id)
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
                    source={{ uri: l.thumb }}
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
                      {l.priceLabel}
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
