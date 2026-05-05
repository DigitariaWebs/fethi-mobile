import { ScrollView, Text, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { useLocalSearchParams } from 'expo-router';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { PageHeader } from '@/components';
import { LISTINGS } from '@/lib/fixtures';

const VIEWS_7D = [12, 21, 18, 9, 26, 31, 27];
const RECOMMENDATIONS = [
  'Baisse ton prix de 10 % pour obtenir ~30 % de vues en plus.',
  'Ajoute 2 photos de plus — les annonces avec 5+ photos se vendent 2× plus vite.',
  "Réponds aux messages en moins d'une heure — ta moyenne est de 2 h 12 min.",
];

export default function ListingInsights() {
  const C = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = LISTINGS.find((l) => l.id === id) ?? LISTINGS[0];

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Statistiques" subtitle={listing.title} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat label="Vues (7j)" value="127" delta="+18%" />
          <Stat label="Sauvegardes" value="14" delta="+4" />
          <Stat label="Messages" value="4" delta="+2" />
        </View>

        {/* Mini sparkline */}
        <View
          style={[
            Sh.subtle,
            {
              backgroundColor: C.surface,
              borderRadius: R.lg,
              borderWidth: 1,
              borderColor: C.divider,
              padding: 16,
            },
          ]}
        >
          <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 14, color: C.ink }}>
            Tendance des vues
          </Text>
          <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>Les 7 derniers jours</Text>
          <View style={{ height: 80, marginTop: 14 }}>
            <Svg width="100%" height={80} viewBox={`0 0 ${VIEWS_7D.length * 40} 80`}>
              <Path
                d={`M 0 ${80 - VIEWS_7D[0] * 2} ${VIEWS_7D.map((v, i) => `L ${i * 40} ${80 - v * 2}`).join(' ')} L ${(VIEWS_7D.length - 1) * 40} 80 L 0 80 Z`}
                fill={C.primary}
                opacity={0.12}
              />
              <Polyline
                points={VIEWS_7D.map((v, i) => `${i * 40},${80 - v * 2}`).join(' ')}
                stroke={C.primary}
                strokeWidth={2.5}
                fill="none"
              />
            </Svg>
          </View>
        </View>

        <View>
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 11,
              color: C.n500,
              letterSpacing: 0.6,
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            Actions recommandées
          </Text>
          {RECOMMENDATIONS.map((r, i) => (
            <View
              key={i}
              style={{
                backgroundColor: C.surface,
                borderRadius: R.md,
                borderWidth: 1,
                borderColor: C.divider,
                padding: 14,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: C.primary,
                  marginTop: 7,
                }}
              />
              <Text style={[t('bodySm'), { color: C.ink, flex: 1, lineHeight: 19 }]}>{r}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta: string }) {
  const C = useColors();
  return (
    <View
      style={[
        Sh.subtle,
        {
          flex: 1,
          backgroundColor: C.surface,
          borderRadius: R.lg,
          borderWidth: 1,
          borderColor: C.divider,
          padding: 14,
        },
      ]}
    >
      <Text style={[t('caption'), { color: C.n500 }]}>{label}</Text>
      <Text
        style={{
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 22,
          color: C.ink,
          letterSpacing: -0.4,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
      <Text
        style={[t('caption'), { color: delta.startsWith('+') ? C.success : C.danger, marginTop: 2 }]}
      >
        {delta}
      </Text>
    </View>
  );
}
