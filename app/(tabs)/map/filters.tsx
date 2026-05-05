import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSButton, MSPill, MSSheetHandle } from '@/components';
import { CATEGORIES, CONDITIONS } from '@/lib/fixtures';
import { useSubscription } from '@/lib/subscription';

// Phase 2 / Screen 31 — filter sheet.
// Presented as a modal route by `app/(tabs)/map/_layout.tsx`.
// Sticky Apply pill at the bottom matches the design's CTA shape.
export default function FiltersScreen() {
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isPlus = useSubscription((s) => s.tier === 'plus');
  // Plus subscribers default to a wider radius and unlock the larger
  // presets + "Custom…" without going through the paywall.
  const [distance, setDistance] = useState(isPlus ? '5km' : '500m');
  const [cats, setCats] = useState<Set<string>>(new Set(['Maison', 'Vêtements']));
  const [conds, setConds] = useState<Set<string>>(new Set(['Neuf', 'Comme neuf']));
  const [sort, setSort] = useState('Plus pertinents');

  const toggle = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View
        style={{
          paddingTop: 10,
        }}
      >
        <MSSheetHandle />
      </View>

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: C.divider,
        }}
      >
        <Pressable
          onPress={() => {
            setDistance('500m');
            setCats(new Set());
            setConds(new Set());
            setSort('Plus pertinents');
          }}
        >
          <Text style={[t('body'), { color: C.n600, fontFamily: 'InstrumentSans-Medium' }]}>
            Réinitialiser
          </Text>
        </Pressable>
        <Text style={[t('h3'), { color: C.ink, fontSize: 17 }]}>Filtres</Text>
        <Pressable onPress={() => router.back()}>
          <Icon.Close size={20} color={C.ink} />
        </Pressable>
      </View>

      {/* Body */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Price range */}
        <Section title="Fourchette de prix" trailing="€0 — €250+">
          <PriceHistogram />
        </Section>

        {/* Distance — preset radii are free; the wider presets and
            "Custom…" require MyStreet+. Free users tapping a paid pill
            land on the paywall; subscribers get all options unlocked
            with a green dot affordance on the new ones. */}
        <Section title="Distance">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[
              { d: '200m', plus: false },
              { d: '500m', plus: false },
              { d: '1km', plus: false },
              { d: '2km', plus: false },
              { d: '5km', plus: true },
              { d: '10km', plus: true },
              { d: 'Personnalisée…', plus: true },
            ].map(({ d, plus }) => (
              <MSPill
                key={d}
                size="sm"
                selected={distance === d}
                onPress={() => {
                  if (plus && !isPlus) router.push('/subscription' as any);
                  else setDistance(d);
                }}
              >
                {plus && !isPlus ? `${d} ✦` : d}
              </MSPill>
            ))}
          </View>
          {isPlus ? (
            <Text style={[t('caption'), { color: C.success, marginTop: 8 }]}>
              MyStreet+ actif · tous les rayons débloqués.
            </Text>
          ) : null}
        </Section>

        {/* Category */}
        <Section title="Catégorie">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map((c) => (
              <MSPill
                key={c}
                size="sm"
                selected={cats.has(c)}
                onPress={() => setCats(toggle(cats, c))}
              >
                {c}
              </MSPill>
            ))}
          </View>
        </Section>

        {/* Condition */}
        <Section title="État">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {CONDITIONS.map((c) => (
              <MSPill
                key={c}
                size="sm"
                selected={conds.has(c)}
                onPress={() => setConds(toggle(conds, c))}
              >
                {c}
              </MSPill>
            ))}
          </View>
        </Section>

        {/* Sort */}
        <Section title="Trier par" last>
          <View
            style={{
              backgroundColor: C.surface,
              borderRadius: R.lg,
              borderWidth: 1,
              borderColor: C.divider,
            }}
          >
            {[
              'Plus pertinents',
              'Plus proches',
              'Plus récents',
              'Prix : croissant',
              'Prix : décroissant',
            ].map((label, i, arr) => (
              <Pressable
                key={label}
                onPress={() => setSort(label)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: C.divider,
                }}
              >
                <Text style={[t('body'), { color: C.ink }]}>{label}</Text>
                {sort === label && (
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: C.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon.Check size={14} color="#FFF" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </Section>
      </ScrollView>

      {/* Sticky Apply */}
      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 28 + insets.bottom,
            backgroundColor: isDark ? "rgba(24,21,18,0.95)" : "rgba(251, 248, 244, 0.95)",
            borderTopWidth: 1,
            borderTopColor: C.divider,
          },
        ]}
      >
        <MSButton size="lg" fullWidth onPress={() => router.back()}>
          <Text style={{ color: '#FFF', fontFamily: 'InstrumentSans-SemiBold', fontSize: 17 }}>
            Voir {isPlus ? 142 : 23} annonces{'  '}
            <Text
              style={{
                backgroundColor: 'rgba(255,255,255,0.22)',
                paddingHorizontal: 10,
                paddingVertical: 2,
                borderRadius: 999,
                fontSize: 13,
                color: '#FFF',
              }}
            >
              {'  '}
              {distance}
              {'  '}
            </Text>
          </Text>
        </MSButton>
      </View>
    </View>
  );
}

function Section({
  title,
  trailing,
  children,
  last,
}: {
  title: string;
  trailing?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  const C = useColors();
  return (
    <View style={{ marginBottom: last ? 0 : 24 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 10,
        }}
      >
        <Text
          style={[
            t('label'),
            {
              color: C.ink,
              textTransform: 'none',
              letterSpacing: 0,
              fontSize: 14,
            },
          ]}
        >
          {title}
        </Text>
        {trailing && (
          <Text style={[t('bodySm'), { color: C.n600 }]}>{trailing}</Text>
        )}
      </View>
      {children}
    </View>
  );
}

function PriceHistogram() {
  const C = useColors();
  const bars = [3, 5, 8, 12, 18, 22, 28, 24, 18, 14, 10, 8, 6, 5, 4, 3, 2, 2, 1, 1];
  return (
    <View style={{ height: 56, marginTop: 8 }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 16,
          height: 32,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 2,
        }}
      >
        {bars.map((h, i) => {
          const inRange = i >= 1 && i <= 17;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: h * 1.2,
                backgroundColor: inRange ? C.primary : C.n200,
                borderRadius: 2,
                opacity: inRange ? 1 : 0.4,
              }}
            />
          );
        })}
      </View>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 8,
          height: 4,
          backgroundColor: C.n200,
          borderRadius: 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: '5%',
          right: '15%',
          bottom: 8,
          height: 4,
          backgroundColor: C.ink,
          borderRadius: 2,
        }}
      />
      {/* handles */}
      <View
        style={[
          Sh.subtle,
          {
            position: 'absolute',
            bottom: 0,
            left: '5%',
            marginLeft: -12,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#FFF',
            borderWidth: 2,
            borderColor: C.ink,
          },
        ]}
      />
      <View
        style={[
          Sh.subtle,
          {
            position: 'absolute',
            bottom: 0,
            right: '15%',
            marginRight: -12,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#FFF',
            borderWidth: 2,
            borderColor: C.ink,
          },
        ]}
      />
    </View>
  );
}
