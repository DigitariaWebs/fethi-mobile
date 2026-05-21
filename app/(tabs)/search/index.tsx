import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Polyline, Line } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { Icon } from '@/components';
import { CategoryGlyph } from '@/components/sell/CategoryGlyph';
import { useFloatingTabBarHeight } from '@/hooks/useFloatingTabBarHeight';
import { useEffectiveCoords, useLocationLabel } from '@/lib/locationStore';
import { listingsApi, formatListingPrice, listingMainPhoto } from '@/lib/api';
import type { CategoryGlyph as Glyph } from '@/lib/categories';

const RECENTS = [
  { q: 'vélo de ville', tag: 'Vélos' },
  { q: 'kallax', tag: 'Meubles' },
  { q: 'Le Creuset', tag: 'Cuisine' },
];

// Category tiles — emojis render unreliably with our custom font on the
// iOS sim (Apple Color Emoji fallback isn't kicking in for Fabric custom
// fonts), so we use stroke SVG glyphs from `CategoryGlyph` everywhere.
const CATEGORIES: Array<{ glyph: Glyph; label: string }> = [
  { glyph: 'garment',  label: 'Mode' },
  { glyph: 'home',     label: 'Maison' },
  { glyph: 'bike',     label: 'Mobilité' },
  { glyph: 'book',     label: 'Livres' },
  { glyph: 'music',    label: 'Musique' },
  { glyph: 'baby',     label: 'Enfants' },
  { glyph: 'gamepad',  label: 'Loisirs' },
  { glyph: 'leaf',     label: 'Plantes' },
];

// Phase 8 / Screen 52 — Search entry.
export default function SearchEntry() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useFloatingTabBarHeight();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const coords = useEffectiveCoords();
  const locationLabel = useLocationLabel();

  // Top "trending" : 6 annonces les plus favorisees dans un rayon de 5 km
  // autour de l'user. On les affiche en horizontal scroll de cards.
  const trending = useQuery({
    queryKey: ['trending', coords.lat, coords.lng],
    queryFn: () =>
      listingsApi.list({
        lat: coords.lat,
        lng: coords.lng,
        radiusMeters: 5000,
        size: 20,
      }),
    staleTime: 60 * 1000,
  });
  const trendingItems = (trending.data?.content ?? [])
    .filter((l) => (l.favoritesCount ?? 0) > 0 || (l.viewCount ?? 0) > 0)
    .sort((a, b) => (b.favoritesCount ?? 0) - (a.favoritesCount ?? 0)
                 || (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 6);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  const submit = (q: string) => router.push({ pathname: '/(tabs)/search/results', params: { q } });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: C.paper }}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 12,
          paddingBottom: 12,
          backgroundColor: C.paper,
          borderBottomWidth: 1,
          borderBottomColor: C.divider,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.Chevron size={18} color={C.ink} dir="left" />
          </Pressable>
          <View
            style={{
              flex: 1,
              height: 40,
              borderRadius: R.full,
              backgroundColor: C.surface,
              borderWidth: 1.5,
              borderColor: C.ink,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Circle cx={11} cy={11} r={8} stroke={C.n500} strokeWidth={2.2} />
              <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={C.n500} strokeWidth={2.2} />
            </Svg>
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => query.trim() && submit(query)}
              placeholder="Recherche ce que tu veux…"
              placeholderTextColor={C.n400}
              returnKeyType="search"
              style={[t('body'), { flex: 1, color: C.ink, padding: 0 }]}
            />
          </View>
          <Pressable
            onPress={() => router.back()}
            style={{ paddingHorizontal: 8, paddingVertical: 6 }}
          >
            <Text
              style={[
                t('bodySm'),
                { color: C.n600, fontFamily: 'InstrumentSans-Medium' },
              ]}
            >
              Annuler
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 14, paddingBottom: tabBarHeight + 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Recents */}
        <Section title="Récent" right="Effacer">
          {RECENTS.map((r) => (
            <Pressable
              key={r.q}
              onPress={() => submit(r.q)}
              android_ripple={{ color: C.n100 }}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                backgroundColor: 'transparent',
              }}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} stroke={C.n400} strokeWidth={2} />
                <Polyline
                  points="12 6 12 12 16 14"
                  stroke={C.n400}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text
                numberOfLines={1}
                style={[t('body'), { color: C.ink, flex: 1 }]}
              >
                {r.q}
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: R.full,
                  backgroundColor: C.n50,
                }}
              >
                <Text
                  style={[t('caption'), { color: C.n500, fontFamily: 'InstrumentSans-Medium' }]}
                >
                  {r.tag}
                </Text>
              </View>
              <Pressable
                hitSlop={6}
                style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon.Close size={11} color={C.n400} />
              </Pressable>
            </Pressable>
          ))}
        </Section>

        {/* Trending — horizontal scroll des annonces les plus favorisees pres de l'user */}
        {trendingItems.length > 0 ? (
          <Section
            title={`Populaire à ${locationLabel}`}
            subtitle="Les annonces les plus sauvegardées autour de toi"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
            >
              {trendingItems.map((l) => (
                <Pressable
                  key={l.id}
                  onPress={() => router.push(`/listing/${l.id}` as any)}
                  style={{
                    width: 140,
                    backgroundColor: C.surface,
                    borderRadius: R.lg,
                    borderWidth: 1, borderColor: C.divider,
                    overflow: 'hidden',
                  }}
                >
                  <View style={{ width: 140, height: 100, position: 'relative' }}>
                    <Image
                      source={{ uri: listingMainPhoto(l) }}
                      style={{ width: 140, height: 100 }}
                      contentFit="cover"
                    />
                    {(l.favoritesCount ?? 0) > 0 ? (
                      <View
                        style={{
                          position: 'absolute', top: 6, right: 6,
                          paddingHorizontal: 6, paddingVertical: 2,
                          borderRadius: 999,
                          backgroundColor: 'rgba(255,255,255,0.92)',
                          flexDirection: 'row', alignItems: 'center', gap: 3,
                        }}
                      >
                        <Icon.Heart size={9} color={C.danger} />
                        <Text style={{ fontFamily: 'InstrumentSans-Bold', fontSize: 10, color: C.ink }}>
                          {l.favoritesCount}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={{ padding: 8 }}>
                    <Text
                      numberOfLines={1}
                      style={[t('caption'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}
                    >
                      {l.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'InstrumentSans-SemiBold',
                        fontSize: 12, color: C.ink, marginTop: 2,
                      }}
                    >
                      {formatListingPrice(l)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </Section>
        ) : null}

        {/* Browse */}
        <Section title="Parcourir">
          <View
            style={{
              paddingHorizontal: 20,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.label}
                onPress={() => submit(c.label)}
                style={{
                  width: '23%',
                  backgroundColor: C.surface,
                  borderRadius: R.lg,
                  borderWidth: 1,
                  borderColor: C.divider,
                  paddingVertical: 14,
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <CategoryGlyph name={c.glyph} size={22} color={C.ink} />
                <Text
                  style={[
                    t('caption'),
                    {
                      color: C.ink,
                      fontFamily: 'InstrumentSans-SemiBold',
                    },
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: string;
  children: React.ReactNode;
}) {
  const C = useColors();
  return (
    <View style={{ marginBottom: 18 }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 12,
              color: C.n500,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>{subtitle}</Text>
          )}
        </View>
        {right && (
          <Pressable hitSlop={4}>
            <Text
              style={[
                t('caption'),
                {
                  color: C.n500,
                  fontFamily: 'InstrumentSans-SemiBold',
                  paddingVertical: 4,
                },
              ]}
            >
              {right}
            </Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}
