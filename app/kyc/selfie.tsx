import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useColors, t } from '@/theme';
import { PageHeader } from '@/components';
import { CaptureCard } from '@/components/kyc/CaptureCard';
import { useKYC } from '@/lib/kyc';
import { useToast } from '@/lib/toast';

export default function Selfie() {
  const C = useColors();
  const router = useRouter();
  const setCapture = useKYC((s) => s.setCapture);
  const toast = useToast();

  const capture = () => {
    setCapture('selfie', 'mock://selfie');
    toast.success('Selfie capturé.');
    router.push('/kyc/review' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Prends un selfie" subtitle="3 sur 3" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[t('body'), { color: C.n600, lineHeight: 22 }]}>
          Centre ton visage dans l'ovale. Nous le comparons à la photo de ta pièce.
        </Text>
        <CaptureCard shape="oval" label="Regarde l'objectif" onCapture={capture} />
      </ScrollView>
    </View>
  );
}
