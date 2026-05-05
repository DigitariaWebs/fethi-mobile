import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { MSButton } from '@/components';
import { getOrder, formatEuros } from '@/lib/orders';
import { SELLERS } from '@/lib/fixtures';

export default function PaymentSuccess() {
  const C = useColors();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = orderId ? getOrder(orderId) : undefined;
  const seller = order ? SELLERS[order.sellerId] : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper, padding: 24, justifyContent: 'center' }}>
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={{ alignItems: 'center', marginBottom: 28 }}
      >
        <View
          style={[
            Sh.primaryGlow,
            {
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: C.success,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            },
          ]}
        >
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path d="M5 12 L 10 17 L 19 7" stroke="#FFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 28, color: C.ink, letterSpacing: -0.4 }}>
          Paiement reçu.
        </Text>
        {order ? (
          <Text style={[t('body'), { color: C.n600, marginTop: 6 }]}>
            {`${formatEuros(order.amountCents)} · commande ${order.id}`}
          </Text>
        ) : null}
      </Animated.View>

      <Animated.View entering={FadeIn.delay(160).duration(400)} style={{ gap: 10 }}>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            padding: 14,
          }}
        >
          <Text style={[t('caption'), { color: C.n500 }]}>REÇU</Text>
          <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink, marginTop: 4 }}>
            {order?.listingTitle ?? '—'}
          </Text>
          <Text style={[t('caption'), { color: C.n500, marginTop: 4 }]}>
            Envoyé par e-mail · disponible aussi dans /orders.
          </Text>
        </View>

        {seller ? (
          <MSButton
            size="lg"
            fullWidth
            onPress={() => router.replace(`/(tabs)/messages/${seller.id}` as any)}
          >
            {`Écrire à ${seller.name}`}
          </MSButton>
        ) : null}
        {order ? (
          <MSButton
            size="md"
            fullWidth
            variant="secondary"
            onPress={() => router.replace(`/orders/${order.id}` as any)}
          >
            Voir la commande
          </MSButton>
        ) : null}
        <MSButton
          size="md"
          fullWidth
          variant="ghost"
          onPress={() => router.replace('/(tabs)/map' as any)}
        >
          Retour à la carte
        </MSButton>
      </Animated.View>
    </View>
  );
}
