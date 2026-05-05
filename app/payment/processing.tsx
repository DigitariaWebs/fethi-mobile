import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useColors, t } from '@/theme';

// Full-screen pending state. After ~1.6s, branches into one of three
// QA scenarios: ~20% card refused, ~30% 3DS challenge, ~50% straight success.
export default function PaymentProcessing() {
  const C = useColors();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  useEffect(() => {
    const tid = setTimeout(() => {
      const roll = Math.random();
      if (roll < 0.2) {
        router.replace(`/payment/failure?orderId=${orderId}` as any);
      } else if (roll < 0.5) {
        router.replace(`/payment/3ds?orderId=${orderId}` as any);
      } else {
        router.replace(`/payment/success?orderId=${orderId}` as any);
      }
    }, 1600);
    return () => clearTimeout(tid);
  }, [orderId, router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.paper,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <ActivityIndicator size="large" color={C.primary} />
      <Text
        style={{
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 20,
          color: C.ink,
          marginTop: 18,
          textAlign: 'center',
        }}
      >
        Sécurisation du paiement avec Stripe…
      </Text>
      <Text style={[t('body'), { color: C.n500, marginTop: 8, textAlign: 'center' }]}>
        Ne ferme pas l'application.
      </Text>
    </View>
  );
}
