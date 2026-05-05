import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { Icon } from '@/components';
import { useFloatingTabBarHeight } from '@/hooks/useFloatingTabBarHeight';
import { LISTINGS, SELLERS } from '@/lib/fixtures';

// Phase 8 / Screen 54 — Search results.
export default function SearchResults() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useFloatingTabBarHeight();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const query = q || 'vélo';
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  // For the demo, return all listings filtered by a substring match in title or category.
  const results = LISTINGS.filter((l) => {
    const haystack = `${l.title} ${l.category}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  const visible = results.length > 0 ? results : LISTINGS.slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 12,
          paddingBottom: 8,
          backgroundColor: C.paper,
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
          <Pressable
            onPress={() => router.push('/(tabs)/search')}
            style={{
              flex: 1,
              height: 38,
              borderRadius: R.full,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.n200,
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
            <Text
              numberOfLines={1}
              style={[
                t('body'),
                { color: C.ink, fontFamily: 'InstrumentSans-Medium', flex: 1 },
              ]}
            >
              {query}
            </Text>
            <Icon.Close size={12} color={C.n400} />
          </Pressable>
          {/* List/Map toggle */}
          <View
            style={{
              flexDirection: 'row',
              gap: 2,
              padding: 3,
              backgroundColor: C.surface,
              borderRadius: R.full,
              borderWidth: 1,
              borderColor: C.n200,
            }}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: C.ink,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Line x1={8} y1={6} x2={21} y2={6} stroke={C.paper} strokeWidth={2} />
                <Line x1={8} y1={12} x2={21} y2={12} stroke={C.paper} strokeWidth={2} />
                <Line x1={8} y1={18} x2={21} y2={18} stroke={C.paper} strokeWidth={2} />
                <Circle cx={3} cy={6} r={1} fill={C.paper} />
                <Circle cx={3} cy={12} r={1} fill={C.paper} />
                <Circle cx={3} cy={18} r={1} fill={C.paper} />
              </Svg>
            </View>
            <Pressable
              onPress={() => router.replace('/(tabs)/map')}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.Pin size={14} color={C.n500} />
            </Pressable>
          </View>
        </View>

        {/* Active filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 4, gap: 6, alignItems: 'center' }}
        >
          <Pressable
            onPress={() => router.push('/(tabs)/search/filters')}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: R.full,
              backgroundColor: C.ink,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
              <Polygon
                points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
                stroke={C.paper}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            </Svg>
            <Text
              style={{
                color: C.paper,
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 11,
              }}
            >
              Filtres · 4
            </Text>
          </Pressable>
          {['500m', '€10–€200', 'Bon+', 'Vérifié'].map((f) => (
            <ActiveChip key={f} label={f} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 12, paddingBottom: tabBarHeight + 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
      >
        {/* Result count + sort */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={[t('bodySm'), { color: C.n600 }]}>
            <Text style={{ color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }}>
              {visible.length} résultats
            </Text>{' '}
            <Text style={{ color: C.n500 }}>à moins de 500 m</Text>
          </Text>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text
              style={[
                t('bodySm'),
                { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' },
              ]}
            >
              Plus proches
            </Text>
            <Icon.Chevron size={12} color={C.ink} />
          </Pressable>
        </View>

        {/* Result rows */}
        <View style={{ paddingHorizontal: 16 }}>
          {visible.map((l, i) => {
            const seller = SELLERS[l.sellerId];
            const isHot = i === 0;
            return (
              <Pressable
                key={l.id}
                onPress={() => router.push(`/listing/${l.id}` as any)}
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  paddingHorizontal: 4,
                  paddingVertical: 10,
                  borderBottomWidth: i < visible.length - 1 ? 1 : 0,
                  borderBottomColor: C.divider,
                }}
              >
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: R.lg,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Image
                    source={{ uri: l.photo }}
                    style={{ width: 96, height: 96 }}
                    contentFit="cover"
                  />
                  {isHot && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: R.full,
                        backgroundColor: C.primary,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Svg width={9} height={11} viewBox="0 0 16 20">
                        <Path
                          d="M8 1 C 9 4, 12 5, 12 9 C 12 13, 10 14, 10 12 C 10 9, 7 9, 6 12 C 5 14, 4 13, 4 11 C 4 8, 6 6, 8 1 Z"
                          fill="#FFF"
                        />
                      </Svg>
                      <Text
                        style={{
                          color: '#FFF',
                          fontFamily: 'InstrumentSans-Bold',
                          fontSize: 9,
                          letterSpacing: 0.4,
                        }}
                      >
                        POPULAIRE
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={2}
                    style={[
                      t('body'),
                      { color: C.ink, fontFamily: 'InstrumentSans-SemiBold', lineHeight: 19 },
                    ]}
                  >
                    {l.title}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      marginTop: 4,
                    }}
                  >
                    <Icon.Pin size={10} color={C.n500} />
                    <Text
                      style={[
                        t('caption'),
                        { color: C.primary, fontFamily: 'InstrumentSans-SemiBold' },
                      ]}
                    >
                      {l.distanceLabel}
                    </Text>
                    <Text style={[t('caption'), { color: C.n500 }]}>· {l.condition}</Text>
                    <Text style={[t('caption'), { color: C.n500 }]}>· 2d</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          t('caption'),
                          {
                            color: C.n600,
                            fontFamily: 'InstrumentSans-Medium',
                            maxWidth: 120,
                          },
                        ]}
                      >
                        {seller.name}
                      </Text>
                      {seller.verified && (
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: C.accent,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon.Check size={7} color="#FFF" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        fontFamily: 'InstrumentSans-SemiBold',
                        fontSize: 17,
                        color: C.ink,
                      }}
                    >
                      {l.priceLabel}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Save search prompt */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 14,
            paddingHorizontal: 14,
            paddingVertical: 14,
            backgroundColor: C.primarySoft,
            borderRadius: R.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#FFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Polygon
                points="22 17 22 5 13 5 11 2 4 2 2 5 2 17 22 17"
                stroke={C.primary}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={[t('bodySm'), { color: C.primaryInk, fontFamily: 'InstrumentSans-SemiBold' }]}
            >
              Enregistrer cette recherche
            </Text>
            <Text
              style={[t('caption'), { color: C.primaryInk, opacity: 0.75, marginTop: 1 }]}
            >
              Sois notifié quand un voisin publie « {query} »
            </Text>
          </View>
          <Pressable
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: R.full,
              backgroundColor: C.primary,
            }}
          >
            <Text
              style={{
                color: '#FFF',
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 12,
              }}
            >
              Enregistrer
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function ActiveChip({ label }: { label: string }) {
  const C = useColors();
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: R.full,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.n200,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Text
        style={{
          color: C.ink,
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 11,
        }}
      >
        {label}
      </Text>
      <Icon.Close size={9} color={C.n400} />
    </View>
  );
}
