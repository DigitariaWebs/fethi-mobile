import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { MSButton } from '@/components';
import { ordersApi, publicUsersApi, type ApiOrder, type PublicProfile } from '@/lib/api';

function formatEuros(cents: number): string {
  return `${(cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export default function PaymentSuccess() {
  const C = useColors();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [seller, setSeller] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Charge l'order depuis le backend. Le webhook Stripe marque le paiement
  // SUCCEEDED en arriere-plan, donc on poll pas — on affiche juste les details.
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let alive = true;
    ordersApi
      .get(orderId)
      .then(async (o) => {
        if (!alive) return;
        setOrder(o);
        if (o.sellerId) {
          publicUsersApi
            .get(o.sellerId)
            .then((s) => alive && setSeller(s))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [orderId]);

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
        {loading ? (
          <ActivityIndicator color={C.n500} style={{ marginTop: 10 }} />
        ) : order ? (
          <Text style={[t('body'), { color: C.n600, marginTop: 6 }]}>
            {`${formatEuros(order.amountCents)} · commande ${order.id.slice(0, 8)}`}
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
            {`Écrire à ${seller.displayName ?? 'le vendeur'}`}
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
