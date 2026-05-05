import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { Calendar } from '@/components/calendar';
import { MSButton, PageHeader } from '@/components';
import { LISTINGS, type RentalListing } from '@/lib/fixtures';
import { daysBetween, formatRange, type ISODate } from '@/lib/availability';

// Buyer picks a date range to rent. Days the seller blocked are shown
// disabled. Bottom sticky bar previews subtotal + day count and routes
// to checkout when the user has a valid range.
export default function RentalDates() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const listing = LISTINGS.find((l) => l.id === listingId) as RentalListing | undefined;
  const [range, setRange] = useState<{ start: ISODate; end: ISODate } | null>(null);

  if (!listing || listing.listingType !== 'rental') {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Choisis les dates" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[t('body'), { color: C.n500 }]}>Annonce introuvable.</Text>
        </View>
      </View>
    );
  }

  const days = range ? daysBetween(range.start, range.end) + 1 : 0;
  const subtotal = days * listing.pricePerDay;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Choisis les dates" subtitle={listing.title} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text style={[t('body'), { color: C.n600, marginBottom: 16, lineHeight: 22 }]}>
          Appuie sur une date de début, puis sur une date de fin. Les jours grisés sont indisponibles.
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
            mode="range"
            range={range}
            onRangeChange={setRange}
            disabled={listing.unavailableDates}
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
        {range ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text style={[t('bodySm'), { color: C.n600 }]}>
              {`${formatRange(range.start, range.end)} · ${days} jour${days === 1 ? '' : 's'}`}
            </Text>
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 17, color: C.ink }}>
              {`€${subtotal}`}
            </Text>
          </View>
        ) : null}
        <MSButton
          size="lg"
          fullWidth
          state={range ? undefined : 'disabled'}
          onPress={() =>
            range &&
            router.push(
              `/payment/checkout/rental/${listing.id}?start=${range.start}&end=${range.end}` as any,
            )
          }
        >
          {range ? `Continuer · €${subtotal}` : 'Choisis une période'}
        </MSButton>
      </View>
    </View>
  );
}
