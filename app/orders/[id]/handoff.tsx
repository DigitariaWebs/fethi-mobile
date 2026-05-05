import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';

import { useColors, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useOrders } from '@/lib/orders';
import { useToast } from '@/lib/toast';

// "We met!" — both parties tap a button. The button is wired with a soft
// pulsing animation while the other side hasn't confirmed.
export default function Handoff() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const confirmHandoff = useOrders((s) => s.confirmHandoff);

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + pulse.value * 0.5,
    transform: [{ scale: 1 + pulse.value * 0.18 }],
  }));

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Remise" />
      </View>
    );
  }
  const isBuyer = order.buyerId === 'me';
  const myConfirmed = isBuyer ? order.buyerConfirmed : order.sellerConfirmed;
  const otherConfirmed = isBuyer ? order.sellerConfirmed : order.buyerConfirmed;

  const onTap = () => {
    confirmHandoff(order.id, isBuyer ? 'buyer' : 'seller');
    if (otherConfirmed) {
      toast.success('Commande terminée.');
      router.back();
    } else {
      toast.info(isBuyer ? 'En attente du vendeur…' : 'En attente de l\'acheteur…');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="On s'est vus" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 24,
            color: C.ink,
            textAlign: 'center',
          }}
        >
          {myConfirmed && otherConfirmed
            ? 'C\'est terminé !'
            : myConfirmed
              ? 'En attente de l\'autre…'
              : 'Appuie quand vous êtes ensemble.'}
        </Text>
        <Text style={[t('body'), { color: C.n600, textAlign: 'center', marginTop: 8, maxWidth: 320 }]}>
          La commande se finalise dès que vous avez tous les deux confirmé.
        </Text>
        <View
          style={{
            marginTop: 36,
            width: 160,
            height: 160,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!myConfirmed ? (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  backgroundColor: C.primarySoft,
                },
                ringStyle,
              ]}
            />
          ) : null}
          <Pressable
            onPress={onTap}
            disabled={myConfirmed && otherConfirmed}
            style={{
              width: 130,
              height: 130,
              borderRadius: 65,
              backgroundColor: myConfirmed ? C.success : C.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12 L 10 17 L 19 7"
                stroke="#FFF"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </View>
        <Text style={[t('caption'), { color: C.n500, marginTop: 18 }]}>
          {`Acheteur : ${order.buyerConfirmed ? '✓' : '–'}    Vendeur : ${order.sellerConfirmed ? '✓' : '–'}`}
        </Text>

        {myConfirmed && otherConfirmed ? (
          <View style={{ marginTop: 26, width: '100%', maxWidth: 320 }}>
            <MSButton size="lg" fullWidth onPress={() => router.replace(`/orders/${order.id}/review-prompt` as any)}>
              Laisser un avis
            </MSButton>
          </View>
        ) : null}
      </View>
    </View>
  );
}
