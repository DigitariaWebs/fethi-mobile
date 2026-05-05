import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

// Service pricing — hourly rate OR flat-rate per booking, plus minimum
// duration (for hourly) and service-area radius. Buyers see the
// preferred mode on the listing.
export default function ServicePricing() {
  const C = useColors();
  const router = useRouter();
  const draft = useSellDraft();
  const [mode, setMode] = useState<'hourly' | 'flat'>(draft.serviceMode ?? 'hourly');
  const [rate, setRate] = useState(draft.serviceRate?.toString() ?? '');
  const [minDuration, setMinDuration] = useState(draft.serviceMinDuration?.toString() ?? '60');
  const [radius, setRadius] = useState(draft.serviceRadiusKm?.toString() ?? '3');

  const rateN = parseInt(rate || '0', 10);
  const valid = rateN > 0;

  const next = () => {
    draft.set({
      serviceMode: mode,
      serviceRate: rateN,
      serviceMinDuration: parseInt(minDuration || '0', 10) || null,
      serviceRadiusKm: parseInt(radius || '0', 10) || 0,
    });
    router.push('/sell/review' as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: C.paper }}
    >
      <StepHeader step={3} total={5} />
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
          Fixe le prix de ton{' '}
          <Text style={{ fontFamily: 'InstrumentSerif-Italic' }}>temps</Text>
          .
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, marginBottom: 24 }]}>
          Choisis horaire ou forfaitaire. Tu pourras proposer les deux plus tard.
        </Text>

        {/* Mode segmented */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: C.n50,
            borderRadius: 999,
            padding: 4,
            marginBottom: 22,
          }}
        >
          {(['hourly', 'flat'] as const).map((m) => {
            const sel = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: sel ? C.surface : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: sel ? C.ink : C.n500,
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 14,
                  }}
                >
                  {m === 'hourly' ? 'Tarif horaire' : 'Tarif forfaitaire'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Label>TARIF</Label>
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
          <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 32, color: C.ink, letterSpacing: -0.6 }}>€</Text>
          <TextInput
            autoFocus
            value={rate}
            onChangeText={(v) => setRate(v.replace(/[^0-9]/g, ''))}
            placeholder="0"
            placeholderTextColor={C.n300}
            keyboardType="number-pad"
            style={{
              flex: 1,
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 32,
              color: C.ink,
              letterSpacing: -0.6,
              padding: 0,
            }}
          />
          <Text style={[t('body'), { color: C.n500 }]}>{mode === 'hourly' ? '/h' : '/prestation'}</Text>
        </View>

        {mode === 'hourly' ? (
          <View style={{ marginTop: 22 }}>
            <Label>DURÉE MINIMUM</Label>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[30, 60, 90].map((m) => {
                const sel = parseInt(minDuration || '0', 10) === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMinDuration(String(m))}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 9,
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
                        fontSize: 13,
                      }}
                    >
                      {m} min
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={{ marginTop: 22 }}>
          <Label>ZONE D'INTERVENTION</Label>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3, 5, 10].map((km) => {
              const sel = parseInt(radius || '0', 10) === km;
              return (
                <Pressable
                  key={km}
                  onPress={() => setRadius(String(km))}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 9,
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
                      fontSize: 13,
                    }}
                  >
                    {km} km
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[t('caption'), { color: C.n500, marginTop: 6 }]}>
            À quelle distance tu peux te déplacer depuis chez toi.
          </Text>
        </View>
      </ScrollView>
      <StepFooter ctaLabel="Vérifier" ctaDisabled={!valid} onCta={next} />
    </KeyboardAvoidingView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  const C = useColors();
  return (
    <Text
      style={{
        fontFamily: 'InstrumentSans-SemiBold',
        fontSize: 11,
        color: C.n500,
        letterSpacing: 0.6,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}
