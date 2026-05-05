import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polygon, Polyline } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon } from '@/components';
import {
  DECLINED_OFFERS,
  INCOMING_OFFERS,
  MY_LISTING,
  type IncomingOffer,
} from '@/lib/myListings';

type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered';
type OfferState = { status: OfferStatus; counterPrice?: number };

// Phase 6 / Screen 47 — offers inbox.
export default function SellerOffers() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [offerStates, setOfferStates] = useState<Record<string, OfferState>>(() =>
    Object.fromEntries(INCOMING_OFFERS.map((o) => [o.id, { status: 'pending' as OfferStatus }])),
  );
  const [counterModal, setCounterModal] = useState<{ offer: IncomingOffer } | null>(null);
  const [counterValue, setCounterValue] = useState('');

  const pending = useMemo(
    () =>
      INCOMING_OFFERS.filter(
        (o) => offerStates[o.id]?.status !== 'declined',
      ),
    [offerStates],
  );

  const handleAccept = (offer: IncomingOffer) => {
    Alert.alert(
      `Accepter l'offre de ${offer.buyerName} ?`,
      `Tu vendras ton vélo €${offer.price}. Les autres offres seront automatiquement refusées.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          style: 'default',
          onPress: () => {
            setOfferStates((prev) => {
              const next: Record<string, OfferState> = { ...prev };
              for (const o of INCOMING_OFFERS) {
                next[o.id] = o.id === offer.id ? { status: 'accepted' } : { status: 'declined' };
              }
              return next;
            });
            router.push(`/seller/${MY_LISTING.base.id}/sold`);
          },
        },
      ],
    );
  };

  const handleDecline = (offer: IncomingOffer) => {
    Alert.alert(`Refuser l'offre de ${offer.buyerName} ?`, undefined, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Refuser',
        style: 'destructive',
        onPress: () =>
          setOfferStates((prev) => ({ ...prev, [offer.id]: { status: 'declined' } })),
      },
    ]);
  };

  const openCounter = (offer: IncomingOffer) => {
    setCounterValue(String(offer.price + 10));
    setCounterModal({ offer });
  };

  const submitCounter = () => {
    if (!counterModal) return;
    const num = parseInt(counterValue.replace(/[^0-9]/g, ''), 10);
    if (!Number.isFinite(num) || num <= 0) {
      Alert.alert('Prix invalide', 'Entre un montant en euros.');
      return;
    }
    setOfferStates((prev) => ({
      ...prev,
      [counterModal.offer.id]: { status: 'countered', counterPrice: num },
    }));
    setCounterModal(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
          backgroundColor: C.paper,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.Chevron size={18} dir="left" color={C.ink} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text
              style={[t('h3'), { fontSize: 17, color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}
            >
              Offres
            </Text>
            <Text style={[t('caption'), { color: C.n500, marginTop: 1 }]}>
              {MY_LISTING.base.title.split(',')[0]} · {MY_LISTING.base.priceLabel}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={10} stroke={C.n500} strokeWidth={2} />
              <Polyline
                points="12 6 12 12 16 14"
                stroke={C.n500}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
            <Text
              style={[
                t('caption'),
                { color: C.n500, fontFamily: 'InstrumentSans-Medium' },
              ]}
            >
48 h restantes
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <SectionLabel>EN ATTENTE · {pending.length}</SectionLabel>
        {pending.map((o) => (
          <OfferCard
            key={o.id}
            offer={o}
            state={offerStates[o.id] ?? { status: 'pending' }}
            onAccept={() => handleAccept(o)}
            onCounter={() => openCounter(o)}
            onDecline={() => handleDecline(o)}
          />
        ))}

        <View style={{ marginTop: 14 }}>
          <SectionLabel>REFUSÉES AUTOMATIQUEMENT · {DECLINED_OFFERS.length}</SectionLabel>
        </View>
        {DECLINED_OFFERS.map((d) => (
          <View
            key={d.id}
            style={{
              backgroundColor: C.surface,
              borderRadius: R.lg,
              borderWidth: 1,
              borderColor: C.divider,
              padding: 14,
              marginBottom: 10,
              opacity: 0.7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 18, overflow: 'hidden' }}>
              <Image
                source={{ uri: d.buyerAvatar }}
                style={{ width: 36, height: 36 }}
                contentFit="cover"
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={[
                  t('bodySm'),
                  { color: C.n600, fontFamily: 'InstrumentSans-SemiBold' },
                ]}
              >
                {d.buyerName} a proposé{' '}
                <Text style={{ textDecorationLine: 'line-through' }}>€{d.price}</Text>
              </Text>
              <Text style={[t('caption'), { color: C.n500, marginTop: 1 }]}>
                {d.reason} · {d.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={!!counterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCounterModal(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: C.paper,
              borderRadius: R.xl,
              padding: 20,
              gap: 12,
            }}
          >
            <Text
              style={[
                t('h3'),
                { color: C.ink, fontFamily: 'InstrumentSans-SemiBold', fontSize: 18 },
              ]}
            >
              Contre-offre à {counterModal?.offer.buyerName}
            </Text>
            <Text style={[t('bodySm'), { color: C.n600 }]}>
              Propose un nouveau prix. {counterModal?.offer.buyerName} pourra accepter, refuser
              ou re-négocier.
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: R.md,
                backgroundColor: C.n50,
                gap: 6,
              }}
            >
              <Text
                style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 22, color: C.ink }}
              >
                €
              </Text>
              <TextInput
                value={counterValue}
                onChangeText={setCounterValue}
                keyboardType="number-pad"
                autoFocus
                style={{
                  flex: 1,
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 22,
                  color: C.ink,
                  padding: 0,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Pressable
                onPress={() => setCounterModal(null)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: R.full,
                  backgroundColor: C.surface,
                  borderWidth: 1.5,
                  borderColor: C.n200,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: C.ink,
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 14,
                  }}
                >
                  Annuler
                </Text>
              </Pressable>
              <Pressable
                onPress={submitCounter}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: R.full,
                  backgroundColor: C.ink,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: C.paper,
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 14,
                  }}
                >
                  Envoyer
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const C = useColors();
  return (
    <Text
      style={{
        fontFamily: 'InstrumentSans-SemiBold',
        fontSize: 12,
        color: C.n500,
        marginBottom: 10,
        marginTop: 6,
      }}
    >
      {children}
    </Text>
  );
}

function OfferCard({
  offer,
  state,
  onAccept,
  onCounter,
  onDecline,
}: {
  offer: IncomingOffer;
  state: OfferState;
  onAccept: () => void;
  onCounter: () => void;
  onDecline: () => void;
}) {
  const C = useColors();
  const discount = Math.round((1 - offer.price / offer.original) * 100);
  const isAccepted = state.status === 'accepted';
  const isCountered = state.status === 'countered';

  return (
    <View
      style={[
        Sh.subtle,
        {
          backgroundColor: C.surface,
          borderRadius: R.xl,
          borderWidth: 1,
          borderColor: isAccepted
            ? C.primary
            : offer.belowMin
              ? C.warningSoft
              : C.divider,
          padding: 14,
          paddingBottom: 12,
          marginBottom: 12,
          position: 'relative',
        },
      ]}
    >
      {offer.belowMin && (
        <View
          style={{
            position: 'absolute',
            top: -8,
            right: 14,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: R.full,
            backgroundColor: C.warningSoft,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 3 L22 20 H 2 Z"
              stroke="#7A4F0E"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <Path d="M12 10 V14 M12 17 V17.01" stroke="#7A4F0E" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <Text
            style={{
              color: '#7A4F0E',
              fontSize: 10,
              fontFamily: 'InstrumentSans-Bold',
              letterSpacing: 0.4,
            }}
          >
SOUS TON MIN €{MY_LISTING.base.priceLabel}
          </Text>
        </View>
      )}

      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={[Sh.subtle, { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' }]}>
          <Image
            source={{ uri: offer.buyerAvatar }}
            style={{ width: 40, height: 40 }}
            contentFit="cover"
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <Text style={[t('body'), { fontFamily: 'InstrumentSans-SemiBold', color: C.ink }]}>
              {offer.buyerName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Svg width={10} height={10} viewBox="0 0 24 24">
                <Polygon
                  points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"
                  fill="#C68A2E"
                />
              </Svg>
              <Text
                style={[t('caption'), { color: C.n500, fontFamily: 'InstrumentSans-Medium' }]}
              >
                {offer.rating} · {offer.sales} ventes
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Icon.Pin size={10} color={C.n500} />
            <Text style={[t('caption'), { color: C.n500 }]}>
à {offer.distance} · {offer.time}
            </Text>
          </View>
        </View>
      </View>

      {/* Price band */}
      <View
        style={{
          marginTop: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: R.md,
          backgroundColor: C.n50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <View>
          <Text
            style={[
              t('caption'),
              { color: C.n500, fontFamily: 'InstrumentSans-Medium' },
            ]}
          >
            OFFRE
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
            <Text
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 26,
                color: C.ink,
              }}
            >
              €{offer.price}
            </Text>
            <Text
              style={[
                t('caption'),
                { color: C.n500, textDecorationLine: 'line-through' },
              ]}
            >
              €{offer.original}
            </Text>
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: R.full,
            backgroundColor: discount > 15 ? C.warningSoft : C.n100,
          }}
        >
          <Text
            style={{
              color: discount > 15 ? '#7A4F0E' : C.n600,
              fontSize: 11,
              fontFamily: 'InstrumentSans-Bold',
            }}
          >
            −{discount}%
          </Text>
        </View>
      </View>

      {/* Message */}
      <View
        style={{
          marginTop: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: R.md,
          borderWidth: 1,
          borderColor: C.n200,
          borderStyle: 'dashed',
        }}
      >
        <Text style={[t('bodySm'), { color: C.n700, lineHeight: 19, fontStyle: 'italic' }]}>
          "{offer.message}"
        </Text>
      </View>

      {isCountered && (
        <View
          style={{
            marginTop: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: R.md,
            backgroundColor: C.n50,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Path
              d="M21 12a9 9 0 1 1-9-9c2.5 0 4.7 1 6.4 2.6"
              stroke={C.ink}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Polyline points="21 3 21 8 16 8" stroke={C.ink} strokeWidth={2} />
          </Svg>
          <Text
            style={[t('caption'), { color: C.n700, fontFamily: 'InstrumentSans-Medium' }]}
          >
            Contre-offre envoyée · €{state.counterPrice}
          </Text>
        </View>
      )}

      {/* Actions */}
      {isAccepted ? (
        <View
          style={{
            marginTop: 12,
            paddingVertical: 11,
            borderRadius: R.full,
            backgroundColor: C.primarySoft,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Icon.Check size={14} color={C.primary} />
          <Text
            style={{
              color: C.primary,
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 13,
            }}
          >
            Offre acceptée
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 12, flexDirection: 'row', gap: 6 }}>
          <Pressable
            onPress={onAccept}
            style={{
              flex: 1,
              paddingVertical: 11,
              borderRadius: R.full,
              backgroundColor: C.ink,
              alignItems: 'center',
            }}
          >
            <Text
              style={{ color: C.paper, fontFamily: 'InstrumentSans-SemiBold', fontSize: 13 }}
            >
              Accepter
            </Text>
          </Pressable>
          <Pressable
            onPress={onCounter}
            style={{
              flex: 1,
              paddingVertical: 11,
              borderRadius: R.full,
              backgroundColor: C.surface,
              borderWidth: 1.5,
              borderColor: C.ink,
              alignItems: 'center',
            }}
          >
            <Text
              style={{ color: C.ink, fontFamily: 'InstrumentSans-SemiBold', fontSize: 13 }}
            >
              {isCountered ? 'Modifier' : 'Contre-offre'}
            </Text>
          </Pressable>
          <Pressable
            onPress={onDecline}
            style={{ flex: 1, paddingVertical: 11, alignItems: 'center' }}
          >
            <Text style={{ color: C.n600, fontFamily: 'InstrumentSans-Medium', fontSize: 13 }}>
              Refuser
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
