import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSButton, PageHeader } from '@/components';
import { CardBrandGlyph } from './CardBrandGlyph';
import { usePayments } from '@/lib/payments';

// Shared shell for all three checkout variants. Provides the listing
// preview, optional metadata block, fees breakdown, payment-method
// selector, and the sticky CTA. Variant-specific copy + extra rows are
// passed in via slots.
export type FeeRow = { label: string; value: string; muted?: boolean; emphasis?: boolean };

type Props = {
  title: string;
  thumb: string;
  subtitle: string;
  // Optional metadata strip above fees (e.g. "May 8 → May 11 · 3 days").
  meta?: string;
  // Optional pre-fees note (e.g. deposit hold disclosure).
  note?: string;
  fees: FeeRow[];
  ctaLabel: string;
  onPay: (cardId: string) => void;
  // Optional extra block under the listing strip — used by rentals to
  // surface the deposit-hold notice.
  extras?: ReactNode;
};

export function CheckoutShell({
  title,
  thumb,
  subtitle,
  meta,
  note,
  fees,
  ctaLabel,
  onPay,
  extras,
}: Props) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const cards = usePayments((s) => s.cards);
  const [cardId, setCardId] = useState<string>(
    cards.find((c) => c.isDefault)?.id ?? cards[0]?.id ?? '',
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title={title} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 + insets.bottom }}>
        {/* Listing summary */}
        <View
          style={[
            Sh.subtle,
            {
              flexDirection: 'row',
              gap: 12,
              padding: 12,
              backgroundColor: C.surface,
              borderRadius: R.lg,
              borderWidth: 1,
              borderColor: C.divider,
            },
          ]}
        >
          <Image source={{ uri: thumb }} style={{ width: 72, height: 72, borderRadius: R.md }} contentFit="cover" />
          <View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
            <Text
              numberOfLines={2}
              style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink, lineHeight: 19 }}
            >
              {title}
            </Text>
            <Text style={[t('caption'), { color: C.n500, marginTop: 4 }]}>{subtitle}</Text>
            {meta ? (
              <Text style={[t('caption'), { color: C.primary, fontFamily: 'InstrumentSans-SemiBold', marginTop: 4 }]}>
                {meta}
              </Text>
            ) : null}
          </View>
        </View>

        {extras}

        {note ? (
          <View
            style={{
              marginTop: 14,
              padding: 12,
              backgroundColor: C.accentSoft,
              borderRadius: R.md,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <Icon.Pin size={14} color="#2F4F45" />
            <Text style={[t('bodySm'), { color: '#2F4F45', flex: 1, lineHeight: 19 }]}>{note}</Text>
          </View>
        ) : null}

        {/* Fee breakdown */}
        <View
          style={{
            marginTop: 20,
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            padding: 16,
          }}
        >
          {fees.map((f, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginTop: i === 0 ? 0 : 10,
              }}
            >
              <Text
                style={
                  f.emphasis
                    ? { fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }
                    : [t('bodySm'), { color: f.muted ? C.n500 : C.n700 }]
                }
              >
                {f.label}
              </Text>
              <Text
                style={
                  f.emphasis
                    ? { fontFamily: 'InstrumentSans-SemiBold', fontSize: 17, color: C.ink, letterSpacing: -0.2 }
                    : [t('bodySm'), { color: f.muted ? C.n500 : C.ink, fontFamily: 'InstrumentSans-Medium' }]
                }
              >
                {f.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment method picker */}
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 11,
            color: C.n500,
            letterSpacing: 0.6,
            marginTop: 20,
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          Payer avec
        </Text>
        <View style={{ gap: 8 }}>
          {cards.map((c) => {
            const sel = cardId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCardId(c.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  backgroundColor: C.surface,
                  borderRadius: R.md,
                  borderWidth: sel ? 2 : 1,
                  borderColor: sel ? C.ink : C.divider,
                }}
              >
                <CardBrandGlyph brand={c.brand} size="sm" />
                <Text style={{ flex: 1, fontFamily: 'InstrumentSans-Medium', fontSize: 14, color: C.ink }}>
                  {`${c.brand[0].toUpperCase() + c.brand.slice(1)} •••• ${c.last4}`}
                </Text>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 2,
                    borderColor: sel ? C.ink : C.n300,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {sel ? (
                    <View
                      style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.ink }}
                    />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
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
          state={cardId ? undefined : 'disabled'}
          onPress={() => cardId && onPay(cardId)}
        >
          {ctaLabel}
        </MSButton>
      </View>
    </View>
  );
}
