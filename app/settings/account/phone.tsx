import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';

export default function ChangePhone() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [next, setNext] = useState('');

  const valid = next.replace(/\D/g, '').length >= 9;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title="Modifier le téléphone" />
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={[t('body'), { color: C.n600, lineHeight: 22, marginBottom: 18 }]}>
          Nous allons envoyer un code à ton nouveau numéro pour vérifier qu'il fonctionne.
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: C.surface,
            borderRadius: R.md,
            borderWidth: 1,
            borderColor: C.divider,
            paddingHorizontal: 14,
            paddingVertical: 12,
            gap: 8,
          }}
        >
          <Text style={{ fontFamily: 'InstrumentSans-Medium', fontSize: 15, color: C.n500 }}>+33</Text>
          <TextInput
            autoFocus
            value={next}
            onChangeText={setNext}
            placeholder="6 12 34 56 78"
            placeholderTextColor={C.n400}
            keyboardType="phone-pad"
            style={{ flex: 1, fontFamily: 'InstrumentSans-Medium', fontSize: 16, color: C.ink, padding: 0 }}
          />
        </View>
      </View>
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 + insets.bottom, backgroundColor: C.paper, borderTopWidth: 1, borderTopColor: C.divider }}>
        <MSButton size="lg" fullWidth state={valid ? undefined : 'disabled'} onPress={() => {
          toast.info('Code envoyé.');
          router.push('/auth/otp' as any);
        }}>
          Envoyer le code
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}
