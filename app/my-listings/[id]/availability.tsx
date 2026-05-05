import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, t } from '@/theme';
import { Calendar } from '@/components/calendar';
import { MSButton, PageHeader } from '@/components';
import { LISTINGS } from '@/lib/fixtures';
import { useToast } from '@/lib/toast';
import type { ISODate } from '@/lib/availability';

// Editable availability for a rental or service. Multi-select calendar
// where tapping a date toggles unavailable. Save bumps a toast and pops.
export default function ListingAvailability() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = LISTINGS.find((l) => l.id === id) ?? LISTINGS[0];
  const initial =
    listing.listingType === 'rental' ? listing.unavailableDates ?? [] : [];
  const [unavailable, setUnavailable] = useState<ISODate[]>(initial);

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
