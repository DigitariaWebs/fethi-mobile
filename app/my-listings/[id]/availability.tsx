import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, t } from '@/theme';
import { Calendar } from '@/components/calendar';
import { MSButton, PageHeader } from '@/components';
import { listingsApi, type Listing } from '@/lib/api';
import { useToast } from '@/lib/toast';
import type { ISODate } from '@/lib/availability';

// Editable availability for a rental or service. Multi-select calendar
// where tapping a date toggles unavailable. Save bumps a toast and pops.
// NOTE backend: il n'y a pas encore d'endpoint pour persister les dates
// indisponibles. On garde l'UI cote client et on enverra un PATCH quand
// l'endpoint sera dispo (cf. ListingService.setUnavailableDates).
export default function ListingAvailability() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState<ISODate[]>([]);

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

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Disponibilites" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.n500} />
        </View>
      </View>
    );
  }
  if (!listing) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Disponibilites" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={[t('body'), { color: C.n500 }]}>Annonce introuvable.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Disponibilités" subtitle={listing.title} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text style={[t('body'), { color: C.n600, marginBottom: 16, lineHeight: 22 }]}>
          Appuie sur une date pour la bloquer. Les loueurs ne pourront pas réserver ces jours-là.
        </Text>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.divider,
            padding: 14,
          }}
        >
          <Calendar
            mode="multi"
            selected={unavailable}
            onToggle={(d) =>
              setUnavailable((cur) =>
                cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d],
              )
            }
          />
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
            toast.success('Disponibilités enregistrées.');
            router.back();
          }}
        >
          {unavailable.length === 0 ? 'Enregistrer' : `Enregistrer · ${unavailable.length} bloquée${unavailable.length === 1 ? '' : 's'}`}
        </MSButton>
      </View>
    </View>
  );
}
