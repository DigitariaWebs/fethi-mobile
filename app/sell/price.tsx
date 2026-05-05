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
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon } from '@/components';
import { StepHeader } from '@/components/sell/StepHeader';
import { StepFooter } from '@/components/sell/StepFooter';
import { useSellDraft } from '@/lib/sellDraft';

// Phase 5 / Step 4 — Price.
// Big centered price input, market-range histogram, accept-offers toggle, min offer.
export default function SellPrice() {
  const C = useColors();
  const router = useRouter();
  const draft = useSellDraft();
  const [text, setText] = useState(draft.price ? String(draft.price) : '');

  const valid = !!text && Number(text) > 0;

  // Hand-tuned histogram from the design — represents 14 similar bikes.
  const bars = [2, 4, 6, 9, 12, 14, 11, 7, 4, 2];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: C.paper }}
    >
      <StepHeader step={4} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 28,
            lineHeight: 33,
            letterSpacing: -0.56,
            color: C.ink,
          }}
        >
          Fixe ton prix.
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, marginBottom: 28 }]}>
          Tu pourras toujours ajuster.
        </Text>

        {/* Price input — large, centered */}
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1.5,
            borderColor: valid ? C.ink : C.n200,
            paddingTop: 20,
            paddingBottom: 16,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 56,
                color: C.ink,
                letterSpacing: -1.12,
              }}
            >
              €
            </Text>
            <TextInput
              value={text}
              onChangeText={(v) => {
                const clean = v.replace(/[^0-9]/g, '').slice(0, 5);
                setText(clean);
                draft.set({ price: clean ? Number(clean) : null });
              }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={C.n300}
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 64,
                color: C.ink,
                letterSpacing: -1.92,
                minWidth: 80,
                padding: 0,
                textAlign: 'left',
              }}
            />
          </View>
          <Text style={[t('caption'), { color: C.n500, marginTop: 8 }]}>Appuie pour modifier</Text>
        </View>

        {/* Market range card */}
        <View
          style={{
            backgroundColor: C.primarySoft,
            borderRadius: R.lg,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 18,
            marginBottom: 18,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: R.full,
                backgroundColor: C.primary,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Svg width={10} height={10} viewBox="0 0 16 16">
                <Path
                  d="M8 1.2 L9.4 6 L14.2 7.4 L9.4 8.8 L8 13.6 L6.6 8.8 L1.8 7.4 L6.6 6 Z"
                  fill="#FFF"
                />
              </Svg>
              <Text
                style={{
                  color: '#FFF',
                  fontFamily: 'InstrumentSans-Bold',
                  fontSize: 10,
                  letterSpacing: 0.4,
                }}
              >
                FOURCHETTE DU MARCHÉ
              </Text>
            </View>
            <Text
              style={[
                t('bodySm'),
                { color: C.primaryInk, fontFamily: 'InstrumentSans-Medium', flex: 1 },
              ]}
              numberOfLines={1}
            >
              Sur la base de 14 annonces similaires
            </Text>
          </View>

          <View style={{ height: 70 }}>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 22,
                height: 40,
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 3,
              }}
            >
              {bars.map((h, i) => {
                const lo = 3, hi = 7;
                const isYou = i === 5;
                return (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: h * 2.5,
                      backgroundColor: isYou
                        ? C.primary
                        : i >= lo && i <= hi
                        ? 'rgba(200,85,61,0.55)'
                        : 'rgba(200,85,61,0.18)',
                      borderRadius: 2,
                    }}
                  />
                );
              })}
            </View>
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
              <Text
                style={{
                  position: 'absolute',
                  left: '52%',
                  marginLeft: -40,
                  color: C.primary,
                  fontFamily: 'InstrumentSans-Bold',
                  fontSize: 11,
                }}
              >
                Toi · €{text || '120'}
              </Text>
              <Text
                style={{
                  position: 'absolute',
                  right: 0,
                  color: C.primaryInk,
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 11,
                }}
              >
                €80 — €160
              </Text>
            </View>
          </View>
        </View>

        {/* Accept offers toggle */}
        <View
          style={{
            backgroundColor: C.surface,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: R.md,
            borderWidth: 1,
            borderColor: C.divider,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={[t('body'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}>
              Accepter les offres
            </Text>
            <Text style={[t('caption'), { color: C.n500, marginTop: 1 }]}>
              Les acheteurs peuvent proposer un autre prix
            </Text>
          </View>
          <Pressable
            onPress={() => draft.set({ acceptOffers: !draft.acceptOffers })}
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              backgroundColor: draft.acceptOffers ? C.primary : C.n300,
              padding: 2,
            }}
          >
            <View
              style={[
                Sh.subtle,
                {
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#FFF',
                  alignSelf: draft.acceptOffers ? 'flex-end' : 'flex-start',
                },
              ]}
            />
          </Pressable>
        </View>

        {/* Min offer */}
        {draft.acceptOffers && (
          <Pressable
            onPress={() => router.push('/sell/min-offer' as any)}
            style={{
              backgroundColor: C.surface,
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderRadius: R.md,
              borderWidth: 1,
              borderColor: C.divider,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[t('body'), { color: C.ink, fontFamily: 'InstrumentSans-Medium' }]}>
                Offre minimum
              </Text>
              <Text style={[t('caption'), { color: C.n500, marginTop: 1 }]}>
                Refuse automatiquement en dessous
              </Text>
            </View>
            <Text style={[t('h3'), { fontSize: 17, color: C.ink }]}>
              €{draft.minOffer ?? 0}
            </Text>
            <Icon.Chevron size={14} color={C.n400} />
          </Pressable>
        )}
      </ScrollView>

      <StepFooter
        ctaDisabled={!valid}
        onCta={() =>
          router.push(
            (draft.listingType === 'rental' ? '/sell/rental/pricing' : '/sell/pickup') as any,
          )
        }
      />
    </KeyboardAvoidingView>
  );
}
