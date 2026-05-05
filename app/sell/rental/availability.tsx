import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useColors, t } from '@/theme';
import { Calendar } from '@/components/calendar';
import { StepHeader } from '@/components/sell/StepHeader';
import { StepFooter } from '@/components/sell/StepFooter';
import { useSellDraft } from '@/lib/sellDraft';
import type { ISODate } from '@/lib/availability';

// Block out dates the item isn't available — vacation, already-booked,
// servicing, etc. Multi-select calendar; tap to toggle.
export default function RentalAvailability() {
  const C = useColors();
  const router = useRouter();
  const draft = useSellDraft();
  const [unavailable, setUnavailable] = useState<ISODate[]>(draft.rentalUnavailableDates);

  const next = () => {
    draft.set({ rentalUnavailableDates: unavailable });
    router.push('/sell/pickup' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StepHeader step={5} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 28,
            lineHeight: 33,
            letterSpacing: -0.56,
            color: C.ink,
          }}
        >
          Quand n'est-il{' '}
          <Text style={{ fontFamily: 'InstrumentSerif-Italic' }}>pas</Text>
          {' '}disponible ?
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, marginBottom: 24 }]}>
          Appuie sur les dates à bloquer. Tu pourras ajuster à tout moment depuis ton annonce.
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
              setUnavailable((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))
            }
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 16,
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: C.ink,
            }}
          />
          <Text style={[t('caption'), { color: C.n600 }]}>
            {unavailable.length === 0
              ? 'Toutes les dates sont libres.'
              : `${unavailable.length} date${unavailable.length === 1 ? '' : 's'} bloquée${unavailable.length === 1 ? '' : 's'}.`}
          </Text>
        </View>
      </ScrollView>
      <StepFooter ctaLabel="Continuer" onCta={next} />
    </View>
  );
}
