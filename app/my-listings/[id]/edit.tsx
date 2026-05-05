import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useColors, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { LISTINGS } from '@/lib/fixtures';
import { useSellDraft } from '@/lib/sellDraft';

// Edit a live listing — pre-fills the sell draft with the listing's
// current values, then routes the user into the existing sell flow at
// the most relevant first step. Real backend would patch the listing on
// publish instead of creating a new one.
export default function EditListing() {
  const C = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const draft = useSellDraft();
  const listing = LISTINGS.find((l) => l.id === id);

  // Hydrate the draft on mount so the user lands on /sell/title with
  // their fields already populated. Auto-routes after one frame.
  useEffect(() => {
    if (!listing) return;
    draft.set({
      listingType: listing.listingType,
      photos: [listing.photo],
      title: listing.title,
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
      <PageHeader title="Modifier l'annonce" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={[t('body'), { color: C.n500 }]}>Chargement de l'éditeur…</Text>
        <View style={{ marginTop: 16 }}>
          <MSButton variant="ghost" size="md" onPress={() => router.back()}>
            Annuler
          </MSButton>
        </View>
      </View>
    </View>
  );
}
