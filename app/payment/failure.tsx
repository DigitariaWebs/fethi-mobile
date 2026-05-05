import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useColors, t } from '@/theme';
import { MSButton } from '@/components';

export default function PaymentFailure() {
  const C = useColors();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper, padding: 24, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: C.dangerSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
          }}
        >
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <Path d="M6 6 L 18 18 M 18 6 L 6 18" stroke={C.danger} strokeWidth={3} strokeLinecap="round" />
          </Svg>
        </View>
        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 22, color: C.ink, textAlign: 'center' }}>
          Paiement échoué.
        </Text>
        <Text style={[t('body'), { color: C.n600, textAlign: 'center', marginTop: 8, maxWidth: 320, lineHeight: 22 }]}>
          Ta carte a été refusée par la banque. Aucun débit effectué.
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        <MSButton
          size="lg"
          fullWidth
          onPress={() =>
            router.replace(`/payment/processing?orderId=${orderId}` as any)
          }
        >
          Réessayer
        </MSButton>
        <MSButton
          size="md"
          fullWidth
          variant="secondary"
          onPress={() => router.replace('/payment/methods' as any)}
        >
          Utiliser une autre carte
        </MSButton>
      </View>
    </View>
  );
}
