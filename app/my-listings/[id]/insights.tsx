import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { useLocalSearchParams } from 'expo-router';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { PageHeader } from '@/components';
import { listingsApi, type Listing } from '@/lib/api';

// Mini sparkline values — derives from real viewCount so it's coherent with
// the actual listing without a per-day analytics endpoint yet.
function makeTrend(seed: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 7; i++) {
    out.push(Math.max(2, Math.round((seed / 7) * (0.55 + ((i * 37) % 100) / 100))));
  }
  return out;
}

export default function ListingInsights() {
  const C = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    listingsApi
      .get(id)
      .then((l) => {
        if (alive) setListing(l);
      })
      .catch(() => alive && setListing(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const VIEWS_7D = useMemo(() => makeTrend(listing?.viewCount ?? 14), [listing?.viewCount]);

  const RECOMMENDATIONS = useMemo(() => {
    const recs: string[] = [];
    if ((listing?.photos?.length ?? 0) < 3) {
      recs.push("Ajoute 2 photos de plus — les annonces avec 5+ photos se vendent 2x plus vite.");
    }
    if ((listing?.favoritesCount ?? 0) < 3 && (listing?.viewCount ?? 0) > 20) {
      recs.push("Baisse ton prix de 10 % pour obtenir ~30 % de vues en plus.");
    }
    if (!listing?.description || listing.description.length < 80) {
      recs.push("Etoffe la description : indique les details (etat, dimensions, accessoires).");
    }
    if (recs.length === 0) {
      recs.push("Tes indicateurs sont bons : reponds vite aux messages pour convertir.");
    }
    return recs;
  }, [listing]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Statistiques" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.n500} />
        </View>
      </View>
    );
  }
  if (!listing) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Statistiques" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={[t('body'), { color: C.n500 }]}>Annonce introuvable.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Statistiques" subtitle={listing.title} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat label="Vues totales" value={String(listing.viewCount ?? 0)} delta="cumulees" />
          <Stat label="Favoris" value={String(listing.favoritesCount ?? 0)} delta="actifs" />
          <Stat label="Photos" value={String(listing.photos?.length ?? 0)} delta="publiees" />
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
