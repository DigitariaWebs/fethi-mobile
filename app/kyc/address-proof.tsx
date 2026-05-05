import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { Icon, MSButton, PageHeader } from '@/components';
import { useKYC } from '@/lib/kyc';
import { useToast } from '@/lib/toast';

export default function AddressProof() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const setCapture = useKYC((s) => s.setCapture);
  const proof = useKYC((s) => s.addressProof);

  const upload = () => {
    setCapture('addressProof', 'mock://addr.pdf');
    toast.success('Document chargé.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Justificatif de domicile" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[t('body'), { color: C.n600, lineHeight: 22, marginBottom: 18 }]}>
          Charge une facture récente, un relevé bancaire ou une quittance de loyer (moins de 3 mois).
        </Text>

        <Pressable
          onPress={upload}
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1.5,
            borderColor: C.divider,
            borderStyle: 'dashed',
            padding: 24,
            alignItems: 'center',
            gap: 8,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: C.primarySoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 4 V 16 M 6 10 L 12 4 L 18 10"
                stroke={C.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path d="M4 18 H 20" stroke={C.primary} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </View>
          <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
            {proof ? 'Remplacer le document' : 'Charger un PDF ou une image'}
          </Text>
          <Text style={[t('caption'), { color: C.n500 }]}>
            {proof ? '✓ Document joint' : 'Jusqu\'à 10 Mo · PDF, JPG, PNG'}
          </Text>
        </Pressable>

        <View
          style={{
            marginTop: 18,
            padding: 12,
            backgroundColor: C.n50,
            borderRadius: R.md,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Icon.Pin size={14} color={C.n500} />
          <Text style={[t('caption'), { color: C.n500, flex: 1, lineHeight: 16 }]}>
            L'adresse doit correspondre à celle de tes versements. Tu peux recadrer — vérifie que le nom, l'adresse et la date sont visibles.
          </Text>
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <MSButton
          size="lg"
          fullWidth
          state={proof ? undefined : 'disabled'}
          onPress={() => router.push('/kyc/review' as any)}
        >
          Continuer
        </MSButton>
      </View>
    </View>
  );
}
