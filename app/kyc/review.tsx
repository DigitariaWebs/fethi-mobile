import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useKYC } from '@/lib/kyc';

export default function KYCReview() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signup } = useLocalSearchParams<{ signup?: string }>();
  const isSignup = signup === '1';
  const front = useKYC((s) => s.identityFront);
  const back = useKYC((s) => s.identityBack);
  const selfie = useKYC((s) => s.selfie);
  const addr = useKYC((s) => s.addressProof);
  const submit = useKYC((s) => s.submit);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Vérifier et envoyer" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[t('body'), { color: C.n600, marginBottom: 18, lineHeight: 22 }]}>
          Vérifie tes captures. Appuie pour recommencer une étape.
        </Text>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            overflow: 'hidden',
          }}
        >
          <Row label="Recto de la pièce" filled={!!front} onPress={() => router.push('/kyc/identity' as any)} />
          <Row label="Verso de la pièce" filled={!!back} onPress={() => router.push('/kyc/identity/back' as any)} />
          <Row label="Selfie" filled={!!selfie} onPress={() => router.push('/kyc/selfie' as any)} last={!addr} />
          {addr ? <Row label="Justificatif de domicile" filled onPress={() => router.push('/kyc/address-proof' as any)} last /> : null}
        </View>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 16 + insets.bottom,
          backgroundColor: C.paper,
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <MSButton
          size="lg"
          fullWidth
          state={front && back && selfie ? undefined : 'disabled'}
          onPress={async () => {
            await submit();
            router.replace((isSignup ? '/onboarding/success' : '/kyc/status') as any);
          }}
        >
          Envoyer pour vérification
        </MSButton>
      </View>
    </View>
  );
}

function Row({ label, filled, onPress, last }: { label: string; filled: boolean; onPress: () => void; last?: boolean }) {
  const C = useColors();
  return (
    <Text
      onPress={onPress}
      style={{
        fontFamily: 'InstrumentSans-Medium',
        fontSize: 15,
        color: C.ink,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.divider,
      }}
    >
      <Text style={{ flex: 1 }}>{label}</Text>
      <Text style={[t('caption'), { color: filled ? C.success : C.n500 }]}>
        {filled ? '  ✓ Capturé' : '  Appuie pour capturer'}
      </Text>
    </Text>
  );
}
