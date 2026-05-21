// Recherches sauvegardees — l'user peut sauvegarder un set de filtres
// (categorie, prix, type, quartier) sous un nom court ("Velos < 200€")
// puis activer une cloche de notification : chaque nouvelle annonce
// matchant declenchera un push.
//
// Pour cette V1 on liste / supprime / toggle l'alerte. La creation se fait
// depuis l'ecran /search (bouton "Sauvegarder cette recherche") qui pre-remplit
// les filtres dans une mutation savedSearchesApi.create(...).

import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { Icon, MSButton, PageHeader } from '@/components';
import { savedSearchesApi, type SavedSearch } from '@/lib/api';
import { useToast } from '@/lib/toast';

function BellIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 8 a 6 6 0 0 1 12 0 v3 l2 4 H4 l2 -4 Z M10 19 a2 2 0 0 0 4 0"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

const QUERY_KEY = ['saved-searches'] as const;

export default function SavedSearches() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: searches = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => savedSearchesApi.list(),
    staleTime: 60 * 1000,
  });

  const toggleAlerts = useMutation({
    mutationFn: ({ s, next }: { s: SavedSearch; next: boolean }) =>
      savedSearchesApi.update(s.id, {
        name: s.name,
        query: s.query ?? undefined,
        listingType: s.listingType ?? undefined,
        categoryId: s.categoryId ?? undefined,
        condition: s.condition ?? undefined,
        minPriceCents: s.minPriceCents ?? undefined,
        maxPriceCents: s.maxPriceCents ?? undefined,
        centerLat: s.centerLat ?? undefined,
        centerLng: s.centerLng ?? undefined,
        radiusMeters: s.radiusMeters ?? undefined,
        alertsEnabled: next,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteOne = useMutation({
    mutationFn: (id: string) => savedSearchesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Recherche supprimée');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const confirmDelete = (s: SavedSearch) => {
    Alert.alert(
      'Supprimer cette recherche ?',
      `"${s.name}" disparaîtra ainsi que ses alertes.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteOne.mutate(s.id) },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader
        title="Recherches sauvegardées"
        subtitle={searches.length > 0 ? `${searches.length} recherche${searches.length > 1 ? 's' : ''}` : undefined}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {isLoading && searches.length === 0 ? (
          <View style={{ gap: 10 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <View
                key={`sk-${i}`}
                style={{
                  height: 88, borderRadius: R.lg,
                  backgroundColor: C.n50, borderWidth: 1, borderColor: C.divider,
                }}
              />
            ))}
          </View>
        ) : null}

        {!isLoading && searches.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 56, gap: 12 }}>
            <View
              style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: C.primarySoft,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon.Search size={32} color={C.primary} />
            </View>
            <Text style={[t('h3'), { color: C.ink, textAlign: 'center' }]}>
              Aucune recherche sauvegardée.
            </Text>
            <Text style={[t('body'), { color: C.n500, textAlign: 'center', paddingHorizontal: 40 }]}>
              Depuis la recherche, sauvegarde tes filtres préférés et active une cloche pour être prévenu·e des nouvelles annonces.
            </Text>
            <MSButton onPress={() => router.push('/(tabs)/search' as any)} size="md">
              Aller à la recherche
            </MSButton>
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          {searches.map((s) => (
            <View
              key={s.id}
              style={{
                padding: 14,
                borderRadius: R.lg,
                backgroundColor: C.surface,
                borderWidth: 1, borderColor: C.divider,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={1}
                    style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}
                  >
                    {s.name}
                  </Text>
                  <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
                    {summarize(s)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => confirmDelete(s)}
                  hitSlop={6}
                  style={{ padding: 6 }}
                >
                  <Icon.Close size={16} color={C.n500} />
                </Pressable>
              </View>

              <View
                style={{
                  marginTop: 12, paddingTop: 12,
                  borderTopWidth: 1, borderTopColor: C.divider,
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                }}
              >
                <BellIcon size={14} color={s.alertsEnabled ? C.primary : C.n500} />
                <Text style={{ flex: 1, fontFamily: 'InstrumentSans-Medium', fontSize: 13, color: C.ink }}>
                  Alertes par notification
                </Text>
                <Switch
                  value={s.alertsEnabled}
                  onValueChange={(next) => toggleAlerts.mutate({ s, next })}
                  trackColor={{ true: C.primary, false: C.n200 }}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Resume des filtres en une ligne pour l'affichage de la card.
 * Ex: "Vente · < 200 € · Vélos · rayon 1 km"
 */
function summarize(s: SavedSearch): string {
  const parts: string[] = [];
  if (s.listingType) {
    parts.push(s.listingType === 'VENTE' ? 'Vente' : s.listingType === 'LOCATION' ? 'Location' : 'Service');
  }
  if (s.query) parts.push(`"${s.query}"`);
  if (s.maxPriceCents != null && s.minPriceCents != null) {
    parts.push(`${s.minPriceCents / 100}–${s.maxPriceCents / 100} €`);
  } else if (s.maxPriceCents != null) {
    parts.push(`< ${s.maxPriceCents / 100} €`);
  } else if (s.minPriceCents != null) {
    parts.push(`> ${s.minPriceCents / 100} €`);
  }
  if (s.radiusMeters != null) {
    parts.push(s.radiusMeters >= 1000 ? `${(s.radiusMeters / 1000).toFixed(1)} km` : `${s.radiusMeters} m`);
  }
  return parts.join(' · ') || 'Tous filtres';
}
