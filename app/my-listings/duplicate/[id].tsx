import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useColors, t } from '@/theme';
import { PageHeader } from '@/components';
import { listingsApi, type Listing } from '@/lib/api';
import { useSellDraft } from '@/lib/sellDraft';

// Duplicate a listing — same as edit, but does NOT carry the original
// listing's id forward. Used when a seller wants a near-identical follow-up.
export default function DuplicateListing() {
  const C = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const draft = useSellDraft();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

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
    draft.reset();
    draft.set({
      listingType: backendType,
      photos: listing.photos ?? [],
      title: `${listing.title} (copie)`,
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
      <PageHeader title="Dupliquer" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <ActivityIndicator color={C.n500} />
        ) : !listing ? (
          <Text style={[t('body'), { color: C.n500 }]}>Annonce introuvable.</Text>
        ) : (
          <Text style={[t('body'), { color: C.n500 }]}>Préparation de ton brouillon…</Text>
        )}
      </View>
    </View>
  );
}
