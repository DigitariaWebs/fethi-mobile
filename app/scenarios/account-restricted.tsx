import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';

export default function AccountRestricted() {
  const C = useColors();
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Vente restreinte" />
      <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: C.warningSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 22,
          }}
        >
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <Path d="M12 3 L22 20 H 2 Z M12 10 V14 M12 17 V17.01" stroke={C.warning} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 22, color: C.ink, textAlign: 'center' }}>
          La vente est mise en pause.
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, textAlign: 'center', maxWidth: 340, lineHeight: 22 }]}>
          Tu peux parcourir, sauvegarder, et envoyer des messages — mais il faut vérifier ton identité avant de publier.
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
          <Text style={[t('caption'), { color: C.n500, marginBottom: 4 }]}>POURQUOI</Text>
          <Text style={[t('bodySm'), { color: C.ink, lineHeight: 20 }]}>
            Les nouveaux comptes doivent vérifier leur identité avant la première annonce — une étape unique de ~3 minutes.
          </Text>
        </View>
        <View style={{ marginTop: 22, gap: 8, width: '100%', maxWidth: 360 }}>
          <MSButton size="lg" fullWidth onPress={() => router.replace('/kyc' as any)}>
            Vérifier mon identité
          </MSButton>
          <MSButton size="md" fullWidth variant="ghost" onPress={() => router.back()}>
            Retour
          </MSButton>
        </View>
      </View>
    </View>
  );
}
