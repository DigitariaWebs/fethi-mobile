// Mes favoris — la grille de toutes les annonces que l'user a "coeurises".
//
// Source: GET /me/favorites (paginated, retourne directement des Listing).
// On affiche en grille 2-colonnes (pareil que profil/onglet selling) avec:
//   - skeleton de chargement (4 cards grisees)
//   - empty state si liste vide (CTA "Explorer la map")
//   - pull-to-refresh
//   - tap card -> ouvre /listing/[id]
//
// Le coeur sur la card permet d'unfavorite directement depuis l'ecran, ce
// qui retire la card en optimistic via useToggleFavorite.

import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { Icon, MSButton, PageHeader } from '@/components';
import { FavoriteButton } from '@/components/listing/FavoriteButton';
import {
  useFavoritesList,
  FAVORITES_LIST_KEY,
  FAVORITE_IDS_KEY,
} from '@/hooks/useFavorites';
import { formatListingPrice, listingMainPhoto } from '@/lib/api';

export default function Favorites() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data, isLoading } = useFavoritesList();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: FAVORITES_LIST_KEY }),
        queryClient.invalidateQueries({ queryKey: FAVORITE_IDS_KEY }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const items = data?.content ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Mes favoris" subtitle={items.length > 0 ? `${items.length} annonce${items.length > 1 ? 's' : ''} sauvegardée${items.length > 1 ? 's' : ''}` : undefined} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Skeleton 4 cartes pendant le chargement initial */}
        {isLoading && items.length === 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <View
                key={`sk-${i}`}
                style={{
                  width: '47.5%',
                  aspectRatio: 0.85,
                  backgroundColor: C.n50,
                  borderRadius: R.lg,
                  borderWidth: 1,
                  borderColor: C.divider,
                }}
              />
            ))}
          </View>
        ) : null}

        {/* Empty state */}
        {!isLoading && items.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 56, gap: 12 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: C.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.Heart size={32} color={C.primary} />
            </View>
            <Text style={[t('h3'), { color: C.ink, textAlign: 'center' }]}>
              Aucun favori pour l'instant.
            </Text>
            <Text style={[t('body'), { color: C.n500, textAlign: 'center', paddingHorizontal: 40 }]}>
              Tape sur le coeur d'une annonce pour la garder ici. Tu pourras la retrouver à tout moment, même sans connexion à elle.
            </Text>
            <MSButton onPress={() => router.push('/(tabs)/map' as any)} size="md">
              Explorer la map
            </MSButton>
          </View>
        ) : null}

        {/* Grille 2 colonnes */}
        {items.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {items.map((listing) => (
              <Pressable
                key={listing.id}
                onPress={() => router.push(`/listing/${listing.id}` as any)}
                style={{
                  width: '47.5%',
                  backgroundColor: C.surface,
                  borderRadius: R.lg,
                  borderWidth: 1,
                  borderColor: C.divider,
                  overflow: 'hidden',
                }}
              >
                <View style={{ aspectRatio: 1, position: 'relative' }}>
                  <Image
                    source={{ uri: listingMainPhoto(listing) }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                  {/* Coeur en overlay top-right — unfavorite direct */}
                  <View style={{ position: 'absolute', top: 6, right: 6 }}>
                    <FavoriteButton listingId={listing.id} variant="overlay" size={18} />
                  </View>
                  {/* Tag listingType en bas a gauche */}
                  <View
                    style={{
                      position: 'absolute',
                      left: 8,
                      bottom: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: R.full,
                      backgroundColor: 'rgba(31,36,33,0.85)',
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFF',
                        fontSize: 10,
                        fontFamily: 'InstrumentSans-Bold',
                        letterSpacing: 0.4,
                      }}
                    >
                      {listing.listingType === 'VENTE'
                        ? 'VENTE'
                        : listing.listingType === 'LOCATION'
                          ? 'LOCATION'
                          : 'SERVICE'}
                    </Text>
                  </View>
                </View>
                <View style={{ padding: 10 }}>
                  <Text
                    numberOfLines={1}
                    style={[t('bodySm'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}
                  >
                    {listing.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'InstrumentSans-SemiBold',
                      fontSize: 14,
                      color: C.ink,
                      marginTop: 3,
                    }}
                  >
                    {formatListingPrice(listing)}
                  </Text>
                  {listing.neighborhood ? (
                    <Text
                      numberOfLines={1}
                      style={[t('caption'), { color: C.n500, marginTop: 2, fontSize: 10 }]}
                    >
                      {listing.neighborhood}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
