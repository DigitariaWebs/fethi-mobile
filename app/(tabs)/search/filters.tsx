import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSButton, MSPill, MSSheetHandle } from '@/components';
import { CategoryGlyph } from '@/components/sell/CategoryGlyph';

// Phase 8 / Screen 53 — Filter sheet (richer than the Phase 2 map filters).
export default function SearchFilters() {
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [distance, setDistance] = useState(0.38);
  const [condSelected, setCondSelected] = useState<Set<string>>(new Set(['Comme neuf', 'Bon état']));
  const [pickup, setPickup] = useState<Set<string>>(
    new Set(['Chez le vendeur', 'Lieu public']),
  );
  const [verified, setVerified] = useState(true);
  const [topRated, setTopRated] = useState(true);
  const [recent, setRecent] = useState(false);

  const toggle = <T,>(set: Set<T>, v: T) => {
    const next = new Set(set);
    next.has(v) ? next.delete(v) : next.add(v);
    return next;
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <MSSheetHandle />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: C.divider,
        }}
      >
        <Pressable
          onPress={() => {
            setDistance(0.38);
            setCondSelected(new Set());
            setPickup(new Set());
            setVerified(false);
            setTopRated(false);
            setRecent(false);
          }}
        >
          <Text
            style={[t('bodySm'), { color: C.n600, fontFamily: 'InstrumentSans-Medium' }]}
          >
            Réinitialiser
          </Text>
        </Pressable>
        <Text
          style={[
            t('h3'),
            { fontSize: 17, color: C.ink, fontFamily: 'InstrumentSans-SemiBold' },
          ]}
        >
          Filtres
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text
            style={[t('bodySm'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}
          >
            Terminé
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Group title="Distance" value="Moins de 500 m">
          <View style={{ height: 32, justifyContent: 'center' }}>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 4,
                borderRadius: 2,
                backgroundColor: C.n100,
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: 0,
                width: `${distance * 100}%`,
                height: 4,
                borderRadius: 2,
                backgroundColor: C.primary,
              }}
            />
            <View
              style={[
                Sh.medium,
                {
                  position: 'absolute',
                  left: `${distance * 100}%`,
                  marginLeft: -12,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#FFF',
                  borderWidth: 2,
                  borderColor: C.primary,
                },
              ]}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 6,
            }}
          >
            {['200m', '500m', '1km', '2km', '5km'].map((l) => (
              <Text
                key={l}
                style={[t('caption'), { color: C.n400, fontSize: 11 }]}
              >
                {l}
              </Text>
            ))}
          </View>
        </Group>

        <Group title="Prix" value="€10 — €200">
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PriceField label="Min" value="€10" />
            <PriceField label="Max" value="€200" />
          </View>
        </Group>

        <Group title="État">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {['Comme neuf', 'Bon état', 'Neuf', 'Correct'].map((c) => (
              <MSPill
                key={c}
                size="sm"
                selected={condSelected.has(c)}
                onPress={() => setCondSelected(toggle(condSelected, c))}
              >
                {c}
              </MSPill>
            ))}
          </View>
        </Group>

        <Group title="Catégorie" value="Vélos & mobilité">
          <Pressable
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: R.md,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.divider,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <CategoryGlyph name="bike" size={16} color={C.ink} />
              <Text
                numberOfLines={1}
                style={[
                  t('bodySm'),
                  { color: C.ink, fontFamily: 'InstrumentSans-Medium', flex: 1 },
                ]}
              >
                Vélos & mobilité{' '}
                <Text style={{ color: C.n500, fontFamily: 'InstrumentSans' }}>· +3 sous-cat.</Text>
              </Text>
            </View>
            <Icon.Chevron size={14} color={C.n400} />
          </Pressable>
        </Group>

        <Group title="Récupération">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {['Chez le vendeur', 'Lieu public', 'Livraison'].map((p) => (
              <MSPill
                key={p}
                size="sm"
                selected={pickup.has(p)}
                onPress={() => setPickup(toggle(pickup, p))}
              >
                {p}
              </MSPill>
            ))}
          </View>
        </Group>

        <Group title="Vendeur" last>
          <ToggleRow label="Identité vérifiée uniquement" on={verified} onPress={() => setVerified((v) => !v)} />
          <ToggleRow label="Note 4★ et plus" on={topRated} onPress={() => setTopRated((v) => !v)} />
          <ToggleRow
            label="Publié dans les 7 derniers jours"
            on={recent}
            onPress={() => setRecent((v) => !v)}
            last
          />
        </Group>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24 + insets.bottom,
          backgroundColor: isDark ? "rgba(24,21,18,0.95)" : "rgba(251,248,244,0.95)",
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <MSButton size="lg" fullWidth onPress={() => router.back()}>
          Voir 24 résultats
        </MSButton>
      </View>
    </View>
  );
}

function Group({
  title,
  value,
  children,
  last,
}: {
  title: string;
  value?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  const C = useColors();
  return (
    <View
      style={{
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.divider,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <Text style={[t('body'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}>
          {title}
        </Text>
        {value && (
          <Text
            style={[
              t('caption'),
              { color: C.n500, fontFamily: 'InstrumentSans-Medium' },
            ]}
          >
            {value}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

function PriceField({ label, value }: { label: string; value: string }) {
  const C = useColors();
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: R.md,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.n200,
      }}
    >
      <Text style={[t('caption'), { color: C.n500, fontFamily: 'InstrumentSans-Medium' }]}>
        {label}
      </Text>
      <Text
        style={[
          t('body'),
          { color: C.ink, fontFamily: 'InstrumentSans-SemiBold', marginTop: 1 },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function ToggleRow({
  label,
  on,
  onPress,
  last,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  last?: boolean;
}) {
  const C = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.divider,
      }}
    >
      <Text
        style={[
          t('bodySm'),
          {
            flex: 1,
            color: C.ink,
            fontFamily: 'InstrumentSans-Medium',
          },
        ]}
      >
        {label}
      </Text>
      <Pressable
        onPress={onPress}
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          backgroundColor: on ? C.primary : C.n200,
          padding: 2,
        }}
      >
        <View
          style={[
            Sh.subtle,
            {
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: '#FFF',
              alignSelf: on ? 'flex-end' : 'flex-start',
            },
          ]}
        />
      </Pressable>
    </View>
  );
}
