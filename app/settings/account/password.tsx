import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';

export default function ChangePassword() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const valid = next.length >= 8 && next === confirmPwd;
  const fieldInputStyle = { fontFamily: 'InstrumentSans-Medium', fontSize: 15, color: C.ink, padding: 0 } as const;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title="Modifier le mot de passe" />
      <View style={{ flex: 1, padding: 20, gap: 14 }}>
        <Field label="Mot de passe actuel">
          <TextInput
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            autoFocus
            placeholder="••••••••"
            placeholderTextColor={C.n400}
            style={fieldInputStyle}
          />
        </Field>
        <Field label="Nouveau mot de passe">
          <TextInput
            value={next}
            onChangeText={setNext}
            secureTextEntry
            placeholder="Au moins 8 caractères"
            placeholderTextColor={C.n400}
            style={fieldInputStyle}
          />
        </Field>
        <Field label="Confirmer le nouveau mot de passe">
          <TextInput
            value={confirmPwd}
            onChangeText={setConfirmPwd}
            secureTextEntry
            placeholder="Répéter le nouveau mot de passe"
            placeholderTextColor={C.n400}
            style={fieldInputStyle}
          />
        </Field>
      </View>
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 + insets.bottom, backgroundColor: C.paper, borderTopWidth: 1, borderTopColor: C.divider }}>
        <MSButton size="lg" fullWidth state={valid ? undefined : 'disabled'} onPress={() => {
          toast.success('Mot de passe mis à jour.');
          router.back();
        }}>
          Mettre à jour
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const C = useColors();
  return (
    <View>
      <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 11, color: C.n500, letterSpacing: 0.6, marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <View style={{ backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.divider, paddingHorizontal: 14, paddingVertical: 12 }}>
        {children}
      </View>
    </View>
  );
}