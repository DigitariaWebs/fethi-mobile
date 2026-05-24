import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { listingsApi, type Listing } from '@/lib/api';
import { useToast } from '@/lib/toast';

const TIERS = [
  { id: '24h',  hours: 24,  price: 99,   impressions: '~250',  perks: ['En haut de la carte pendant 24 h'] },
  { id: '7d',   hours: 168, price: 499,  impressions: '~1 500', perks: ['Placement en tête pendant une semaine', 'Mise en avant dans la recherche'] },
  { id: '30d',  hours: 720, price: 1499, impressions: '~6 000', perks: ['Placement en tête permanent', 'Mise en avant + badge boost', 'Réponses prioritaires'] },
] as const;

export default function PromoteListing() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<typeof TIERS[number]['id']>('7d');

  useEffect(() => {
    if (!id) return;
    let alive = true;
    listingsApi
      .get(id)
      .then((l) => alive && setListing(l))
      .catch(() => alive && setListing(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const selected = TIERS.find((tt) => tt.id === tier)!;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Booster l'annonce" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.n500} />
        </View>
      </View>
    );
  }
  if (!listing) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Booster l'annonce" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={[t('body'), { color: C.n500 }]}>Annonce introuvable.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Booster l'annonce" subtitle={listing.title} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <View
          style={{
            backgroundColor: C.primarySoft,
            borderRadius: R.xl,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 22,
          }}
        >
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path
              d="M13 2 L4 14 H11 L10 22 L20 10 H13 Z"
              fill={C.primary}
            />
          </Svg>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.primaryInk }}>
              5 à 10× plus de vues
            </Text>
            <Text style={[t('caption'), { color: C.primaryInk, marginTop: 2 }]}>
              Les annonces boostées apparaissent en tête de la carte et des résultats de recherche.
            </Text>
          </View>
        </View>

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
          Choisis une durée
        </Text>
        <View style={{ gap: 10 }}>
          {TIERS.map((tt) => {
            const sel = tier === tt.id;
            return (
              <Pressable
                key={tt.id}
                onPress={() => setTier(tt.id)}
                style={[
                  Sh.subtle,
                  {
                    backgroundColor: C.surface,
                    borderRadius: R.lg,
                    borderWidth: sel ? 2 : 1,
                    borderColor: sel ? C.ink : C.divider,
                    padding: 16,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 17, color: C.ink }}>
                    {tt.id === '24h' ? '24 heures' : tt.id === '7d' ? '7 jours' : '30 jours'}
                  </Text>
                  <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 17, color: C.ink }}>
                    €{(tt.price / 100).toFixed(2)}
                  </Text>
                </View>
                <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
                  {tt.impressions} impressions supplémentaires
                </Text>
                <View style={{ marginTop: 8, gap: 4 }}>
                  {tt.perks.map((p) => (
                    <View key={p} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <View
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: C.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
                          <Path d="M5 12 L10 17 L19 7" stroke="#FFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                      <Text style={[t('caption'), { color: C.n700 }]}>{p}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 16 + insets.bottom,
          backgroundColor: C.paper,
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <MSButton
          size="lg"
          fullWidth
          onPress={() => {
            toast.success(
              `Boost activé · ${selected.id === '24h' ? '24 heures' : selected.id === '7d' ? '7 jours' : '30 jours'}`,
            );
            router.back();
          }}
        >
          {`Booster · €${(selected.price / 100).toFixed(2)}`}
        </MSButton>
      </View>
    </View>
  );
}
