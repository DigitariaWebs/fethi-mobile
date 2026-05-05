import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useColors, t } from '@/theme';
import { PageHeader } from '@/components';
import { LISTINGS } from '@/lib/fixtures';
import { useSellDraft } from '@/lib/sellDraft';

// Duplicate a listing — same as edit, but does NOT carry the original
// listing's id forward. Used when a seller wants a near-identical follow-up.
export default function DuplicateListing() {
  const C = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const draft = useSellDraft();
  const listing = LISTINGS.find((l) => l.id === id);

  useEffect(() => {
    if (!listing) return;
    draft.reset();
    draft.set({
      listingType: listing.listingType,
      photos: [listing.photo],
      title: `${listing.title} (copie)`,
      category: listing.category,
      description: listing.description,
      price: listing.price,
    });
    const tid = setTimeout(() => {
      router.replace((listing.listingType === 'service' ? '/sell/service/details' : '/sell/title') as any);
    }, 80);
    return () => clearTimeout(tid);
  }, [listing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Dupliquer" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[t('body'), { color: C.n500 }]}>Préparation de ton brouillon…</Text>
      </View>
    </View>
  );
}
