import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useColors, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';

export default function BookingAccepted() {
  const C = useColors();
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Réservation acceptée" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: C.successSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 22,
          }}
        >
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12 L 10 17 L 19 7"
              stroke={C.success}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 24, color: C.ink, textAlign: 'center' }}>
          C'est réservé.
        </Text>
        <Text style={[t('body'), { color: C.n600, textAlign: 'center', marginTop: 8, maxWidth: 320, lineHeight: 22 }]}>
          Paie maintenant pour confirmer. Tu recevras une confirmation dès que les fonds sont validés.
        </Text>
        <View style={{ marginTop: 32, width: '100%', maxWidth: 320 }}>
          <MSButton size="lg" fullWidth onPress={() => router.replace('/payment/methods' as any)}>
            Continuer vers le paiement
          </MSButton>
        </View>
      </View>
    </View>
  );
}
