import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useColors, radius as R, t } from '@/theme';
import { StepHeader } from '@/components/sell/StepHeader';
import { StepFooter } from '@/components/sell/StepFooter';
import { useSellDraft } from '@/lib/sellDraft';

// Rental — daily rate, optional weekly (auto-suggested as 5×daily so a
// 7-day rental is cheaper than the per-day total), refundable deposit.
export default function RentalPricing() {
  const C = useColors();
  const router = useRouter();
  const draft = useSellDraft();
  const [day, setDay] = useState(draft.rentalPricePerDay?.toString() ?? '');
  const [week, setWeek] = useState(draft.rentalPricePerWeek?.toString() ?? '');
  const [deposit, setDeposit] = useState(draft.rentalDeposit?.toString() ?? '');

  // Auto-suggest weekly = 5×daily until the user types something custom.
  useEffect(() => {
    const d = parseInt(day || '0', 10);
    if (d > 0 && !week) setWeek(String(d * 5));
  }, [day]); // eslint-disable-line react-hooks/exhaustive-deps

  const dayN = parseInt(day || '0', 10);
  const weekN = parseInt(week || '0', 10);
  const depN = parseInt(deposit || '0', 10);
  const valid = dayN > 0 && depN >= 0;

  const next = () => {
    draft.set({
      rentalPricePerDay: dayN,
      rentalPricePerWeek: weekN || null,
      rentalDeposit: depN,
    });
    router.push('/sell/rental/availability' as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: C.paper }}
    >
      <StepHeader step={4} />
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
          Fixe tes{' '}
          <Text style={{ fontFamily: 'InstrumentSerif-Italic' }}>tarifs</Text>
          .
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, marginBottom: 24 }]}>
          Les loueurs voient d'abord le tarif journalier. La caution est retenue par Stripe et libérée après la restitution.
        </Text>

        {/* Daily rate */}
        <RateField
          label="TARIF PAR JOUR"
          unit="/jour"
          value={day}
          onChange={setDay}
          placeholder="0"
          autoFocus
        />

        {/* Weekly rate */}
        <RateField
          label="TARIF PAR SEMAINE  (optionnel)"
          unit="/semaine"
          value={week}
          onChange={setWeek}
          placeholder={dayN > 0 ? `${dayN * 5}` : '0'}
          hint={
            dayN > 0 && weekN > 0
              ? `${Math.round((1 - weekN / (dayN * 7)) * 100)}% de remise sur le total journalier`
              : 'Suggéré : 5× le tarif journalier.'
          }
        />

        {/* Deposit */}
        <RateField
          label="CAUTION"
          unit=""
          value={deposit}
          onChange={setDeposit}
          placeholder="0"
          hint="Retenue par Stripe, rendue au loueur lorsque l'objet est restitué en bon état."
        />
      </ScrollView>
      <StepFooter
        ctaDisabled={!valid}
        onCta={next}
      />
    </KeyboardAvoidingView>
  );
}

function RateField({
  label,
  unit,
  value,
  onChange,
  placeholder,
  hint,
  autoFocus,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hint?: string;
  autoFocus?: boolean;
}) {
  const C = useColors();
  return (
    <View style={{ marginBottom: 22 }}>
      <Text
        style={{
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 11,
          color: C.n500,
          letterSpacing: 0.6,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          backgroundColor: C.surface,
          borderRadius: R.md,
          borderWidth: 1,
          borderColor: C.divider,
          paddingHorizontal: 16,
          paddingVertical: 14,
          gap: 4,
        }}
      >
        <Text
          style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 32, color: C.ink, letterSpacing: -0.6 }}
        >
          €
        </Text>
        <TextInput
          value={value}
          onChangeText={(v) => onChange(v.replace(/[^0-9]/g, ''))}
          placeholder={placeholder}
          placeholderTextColor={C.n300}
          keyboardType="number-pad"
          autoFocus={autoFocus}
          style={{
            flex: 1,
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 32,
            color: C.ink,
            letterSpacing: -0.6,
            padding: 0,
          }}
        />
        {unit ? (
          <Text style={[t('body'), { color: C.n500 }]}>{unit}</Text>
        ) : null}
      </View>
      {hint ? (
        <Text style={[t('caption'), { color: C.n500, marginTop: 6 }]}>{hint}</Text>
      ) : null}
    </View>
  );
}
