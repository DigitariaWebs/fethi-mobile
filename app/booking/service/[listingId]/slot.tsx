import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { Calendar } from '@/components/calendar';
import { MSButton, PageHeader } from '@/components';
import { LISTINGS, type ServiceListing } from '@/lib/fixtures';
import { fromISODate, toISODate, type ISODate } from '@/lib/availability';

// Buyer picks a date + time slot for a service. Slots are derived from
// the seller's availabilityWindows for that weekday, sliced into 60-min
// chunks. Real backend would honor the seller's actual booked slots.
export default function ServiceSlot() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const listing = LISTINGS.find((l) => l.id === listingId) as ServiceListing | undefined;
  const [date, setDate] = useState<ISODate>(toISODate(new Date()));
  const [slot, setSlot] = useState<string | null>(null);

  const slots = useMemo(() => {
    if (!listing) return [];
    const weekday = (fromISODate(date).getDay()); // 0..6
    const windows = listing.availabilityWindows.filter((w) => w.weekday === weekday);
    const out: string[] = [];
    windows.forEach((w) => {
      const [fh] = w.from.split(':').map(Number);
      const [th] = w.to.split(':').map(Number);
      for (let h = fh; h < th; h++) out.push(`${String(h).padStart(2, '0')}:00`);
    });
    return out;
  }, [listing, date]);

  if (!listing || listing.listingType !== 'service') {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Réserver un créneau" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[t('body'), { color: C.n500 }]}>Service introuvable.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Réserver un créneau" subtitle={listing.title} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.divider,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <Calendar
            mode="single"
            value={date}
            onChange={(d) => {
              setDate(d);
              setSlot(null);
            }}
          />
        </View>

        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 11,
            color: C.n500,
            letterSpacing: 0.6,
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          Créneaux disponibles
        </Text>
        {slots.length === 0 ? (
          <View
            style={{
              backgroundColor: C.n50,
              borderRadius: R.md,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <Text style={[t('bodySm'), { color: C.n500 }]}>
              Aucun créneau ce jour-là. Essaie une autre date.
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {slots.map((s) => {
              const sel = slot === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setSlot(s)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: sel ? C.ink : C.surface,
                    borderWidth: 1,
                    borderColor: sel ? C.ink : C.divider,
                  }}
                >
                  <Text
                    style={{
                      color: sel ? '#FFF' : C.ink,
                      fontFamily: 'InstrumentSans-SemiBold',
                      fontSize: 14,
                    }}
                  >
                    {s}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
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
          state={slot ? undefined : 'disabled'}
          onPress={() =>
            slot &&
            router.push(`/booking/service/${listing.id}/details?date=${date}&from=${slot}` as any)
          }
        >
          Continuer
        </MSButton>
      </View>
    </View>
  );
}
