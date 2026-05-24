import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, t } from '@/theme';
import { Calendar } from '@/components/calendar';
import { MSButton, PageHeader } from '@/components';
import { listingsApi, type Listing } from '@/lib/api';
import { daysBetween, formatRange, type ISODate } from '@/lib/availability';

function formatEuros(cents: number): string {
  return `${(cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

// Buyer picks a date range to rent. Backend doesn't return unavailable dates
// yet — we'll wire it once /listings/:id/availability is available. Bottom
// sticky bar previews subtotal + day count and routes to checkout.
export default function RentalDates() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<{ start: ISODate; end: ISODate } | null>(null);

  useEffect(() => {
    if (!listingId) return;
    let alive = true;
    listingsApi
      .get(listingId)
      .then((l) => alive && setListing(l))
      .catch(() => alive && setListing(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [listingId]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Choisis les dates" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.n500} />
        </View>
      </View>
    );
  }
  if (!listing || listing.listingType !== 'LOCATION') {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Choisis les dates" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[t('body'), { color: C.n500 }]}>Annonce introuvable.</Text>
        </View>
      </View>
    );
  }

  const dayPriceCents = listing.pricePerDayCents ?? 0;
  const days = range ? daysBetween(range.start, range.end) + 1 : 0;
  const subtotalCents = days * dayPriceCents;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Choisis les dates" subtitle={listing.title} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text style={[t('body'), { color: C.n600, marginBottom: 16, lineHeight: 22 }]}>
          Appuie sur une date de début, puis sur une date de fin.
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
            disabled={[]}
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
              {formatEuros(subtotalCents)}
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
          {range ? `Continuer · ${formatEuros(subtotalCents)}` : 'Choisis une période'}
        </MSButton>
      </View>
    </View>
  );
}
