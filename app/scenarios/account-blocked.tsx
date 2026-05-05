import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';

export default function AccountBlocked() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Compte suspendu" />
      <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: C.dangerSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 22,
          }}
        >
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <Path d="M5.6 5.6 L18.4 18.4 M12 3 a9 9 0 1 1 0 18 a9 9 0 0 1 0-18" stroke={C.danger} strokeWidth={2.4} strokeLinecap="round" />
          </Svg>
        </View>
        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 22, color: C.ink, textAlign: 'center' }}>
          Ton compte est suspendu.
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, textAlign: 'center', maxWidth: 320, lineHeight: 22 }]}>
          Nous avons suspendu ton compte suite à plusieurs litiges de paiement. Tu peux parcourir l'application, mais pas envoyer de message ni publier tant que ce n'est pas résolu.
        </Text>
        <View
          style={{
            marginTop: 22,
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            padding: 14,
            width: '100%',
            maxWidth: 360,
          }}
        >
          <Text style={[t('caption'), { color: C.n500, marginBottom: 4 }]}>RAISON</Text>
          <Text style={[t('bodySm'), { color: C.ink, lineHeight: 20 }]}>
            Plusieurs litiges de paiement et commandes contestées. Vérifié par l'équipe Confiance & Sécurité le 04/05/2026.
          </Text>
        </View>
        <View style={{ marginTop: 22, gap: 8, width: '100%', maxWidth: 360 }}>
          <MSButton size="lg" fullWidth onPress={() => toast.info('Boîte de support ouverte (mock).')}>
            Contester auprès du support
          </MSButton>
          <MSButton size="md" fullWidth variant="ghost" onPress={() => router.back()}>
            Retour
          </MSButton>
        </View>
      </View>
    </View>
  );
}
