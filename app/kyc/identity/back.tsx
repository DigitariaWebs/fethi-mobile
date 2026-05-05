import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useColors, t } from '@/theme';
import { PageHeader } from '@/components';
import { CaptureCard } from '@/components/kyc/CaptureCard';
import { useKYC } from '@/lib/kyc';
import { useToast } from '@/lib/toast';

export default function IdentityBack() {
  const C = useColors();
  const router = useRouter();
  const setCapture = useKYC((s) => s.setCapture);
  const toast = useToast();
  const { signup } = useLocalSearchParams<{ signup?: string }>();
  const isSignup = signup === '1';

  const capture = () => {
    setCapture('identityBack', 'mock://id-back');
    toast.success('Verso capturé.');
    router.push((isSignup ? '/kyc/selfie?signup=1' : '/kyc/selfie') as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Verso de la pièce" subtitle="2 sur 3" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[t('body'), { color: C.n600, lineHeight: 22 }]}>
          Retourne ta pièce et capture le verso.
        </Text>
        <CaptureCard shape="rect" label="Verso de ta pièce" onCapture={capture} />
      </ScrollView>
    </View>
  );
}
