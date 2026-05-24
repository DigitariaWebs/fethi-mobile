import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useColors, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { listingsApi, type Listing } from '@/lib/api';
import { useSellDraft } from '@/lib/sellDraft';

// Edit a live listing — pre-fills the sell draft with the listing's
// current values, then routes the user into the existing sell flow at
// the most relevant first step. The actual update is done on publish.
export default function EditListing() {
  const C = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const draft = useSellDraft();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the listing from the backend.
  useEffect(() => {
    if (!id) return;
    let alive = true;
    listingsApi
      .get(id)
      .then((l) => {
        if (alive) setListing(l);
      })
      .catch(() => {
        if (alive) setListing(null);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  // Hydrate the draft once the listing is loaded, then jump into the sell flow.
  useEffect(() => {
    if (!listing) return;
    const backendType =
      listing.listingType === 'LOCATION'
        ? 'rental'
        : listing.listingType === 'SERVICE'
          ? 'service'
          : 'sale';
    const priceEuros =
      backendType === 'sale'
        ? (listing.priceCents ?? 0) / 100
        : backendType === 'rental'
          ? (listing.pricePerDayCents ?? 0) / 100
          : (listing.hourlyRateCents ?? listing.flatRateCents ?? 0) / 100;
    draft.set({
      listingType: backendType,
      photos: listing.photos ?? [],
      title: listing.title,
      category: listing.categoryLabel ?? '',
      categoryId: listing.categoryId,
      description: listing.description ?? '',
      price: priceEuros,
    });
    const tid = setTimeout(() => {
      router.replace((backendType === 'service' ? '/sell/service/details' : '/sell/title') as any);
    }, 80);
    return () => clearTimeout(tid);
  }, [listing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Modifier l'annonce" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        {loading ? (
          <ActivityIndicator color={C.n500} />
        ) : !listing ? (
          <>
            <Text style={[t('body'), { color: C.n500 }]}>Annonce introuvable.</Text>
            <View style={{ marginTop: 16 }}>
              <MSButton variant="ghost" size="md" onPress={() => router.back()}>
                Retour
              </MSButton>
            </View>
          </>
        ) : (
          <>
            <Text style={[t('body'), { color: C.n500 }]}>Chargement de l'éditeur…</Text>
            <View style={{ marginTop: 16 }}>
              <MSButton variant="ghost" size="md" onPress={() => router.back()}>
                Annuler
              </MSButton>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
