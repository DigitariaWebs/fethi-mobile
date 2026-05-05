import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useColors, t } from '@/theme';
import { PageHeader } from '@/components';
import { CaptureCard } from '@/components/kyc/CaptureCard';
import { useKYC } from '@/lib/kyc';
import { useToast } from '@/lib/toast';

export default function IdentityFront() {
  const C = useColors();
  const router = useRouter();
  const setCapture = useKYC((s) => s.setCapture);
  const toast = useToast();

  const capture = () => {
    // Mock — backend would store the actual photo URI.
    setCapture('identityFront', 'mock://id-front');
    toast.success('Recto capturé.');
    router.push('/kyc/identity/back' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Recto de la pièce" subtitle="1 sur 3" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[t('body'), { color: C.n600, lineHeight: 22 }]}>
          Place ta pièce à plat dans le cadre. La photo et le numéro doivent être lisibles.
        </Text>
        <CaptureCard shape="rect" label="Recto de ta pièce" onCapture={capture} />
      </ScrollView>
    </View>
  );
}
