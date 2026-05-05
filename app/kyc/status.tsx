import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useColors, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useKYC } from '@/lib/kyc';

export default function KYCStatus() {
  const C = useColors();
  const router = useRouter();
  const status = useKYC((s) => s.status);
  const reason = useKYC((s) => s.rejectionReason);
  const reset = useKYC((s) => s.reset);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Statut de la vérification" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        {status === 'pending' ? (
          <>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 22, color: C.ink, marginTop: 18, textAlign: 'center' }}>
              Nous vérifions tes documents…
            </Text>
            <Text style={[t('body'), { color: C.n600, marginTop: 8, textAlign: 'center', maxWidth: 320 }]}>
              La plupart sont vérifiés en moins d'une minute. Tu seras prévenu(e).
            </Text>
          </>
        ) : status === 'approved' ? (
          <>
            <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: C.successSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                <Path d="M5 12 L 10 17 L 19 7" stroke={C.success} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 24, color: C.ink, textAlign: 'center' }}>
              Tu es vérifié(e).
            </Text>
            <Text style={[t('body'), { color: C.n600, marginTop: 8, textAlign: 'center', maxWidth: 320 }]}>
              Tu peux maintenant recevoir des versements.
            </Text>
            <View style={{ marginTop: 24, width: '100%', maxWidth: 320 }}>
              <MSButton size="lg" fullWidth onPress={() => router.replace('/payouts' as any)}>
                Configurer les versements
              </MSButton>
            </View>
          </>
        ) : status === 'rejected' ? (
          <>
            <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: C.dangerSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                <Path d="M6 6 L 18 18 M 18 6 L 6 18" stroke={C.danger} strokeWidth={3} strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 22, color: C.ink, textAlign: 'center' }}>
              Nous n'avons pas pu te vérifier.
            </Text>
            <Text style={[t('body'), { color: C.n600, marginTop: 8, textAlign: 'center', maxWidth: 320 }]}>
              {reason ?? 'Réessaie, s\'il te plaît.'}
            </Text>
            <View style={{ marginTop: 24, width: '100%', maxWidth: 320 }}>
              <MSButton
                size="lg"
                fullWidth
                onPress={() => {
                  reset();
                  router.replace('/kyc/intro' as any);
                }}
              >
                Réessayer
              </MSButton>
            </View>
          </>
        ) : (
          <>
            <Text style={[t('body'), { color: C.n500 }]}>Aucune vérification en cours.</Text>
            <View style={{ marginTop: 18 }}>
              <MSButton size="md" onPress={() => router.replace('/kyc' as any)}>
                Retour
              </MSButton>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
