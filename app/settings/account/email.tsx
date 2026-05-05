import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';

export default function ChangeEmail() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState('fadiprogix@gmail.com');
  const [next, setNext] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  const valid = next.includes('@') && next === confirmEmail;
  const fieldInputStyle = { fontFamily: 'InstrumentSans-Medium', fontSize: 15, color: C.ink, padding: 0 } as const;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title="Modifier l'e-mail" />
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Field label="E-mail actuel">
          <TextInput value={current} editable={false} style={[fieldInputStyle, { color: C.n500 }]} />
        </Field>
        <Field label="Nouvel e-mail" style={{ marginTop: 14 }}>
          <TextInput
            autoFocus
            value={next}
            onChangeText={setNext}
            placeholder="you@example.com"
            placeholderTextColor={C.n400}
            keyboardType="email-address"
            autoCapitalize="none"
            style={fieldInputStyle}
          />
        </Field>
        <Field label="Confirmer le nouvel e-mail" style={{ marginTop: 14 }}>
          <TextInput
            value={confirmEmail}
            onChangeText={setConfirmEmail}
            placeholder="you@example.com"
            placeholderTextColor={C.n400}
            keyboardType="email-address"
            autoCapitalize="none"
            style={fieldInputStyle}
          />
        </Field>
        <Text style={[t('caption'), { color: C.n500, marginTop: 14, lineHeight: 16 }]}>
          Nous allons envoyer un lien de confirmation à ta nouvelle adresse. L'ancienne reste active jusqu'à ce que tu confirmes.
        </Text>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 + insets.bottom, backgroundColor: C.paper, borderTopWidth: 1, borderTopColor: C.divider }}>
        <MSButton size="lg" fullWidth state={valid ? undefined : 'disabled'} onPress={() => {
          toast.success(`Confirmation envoyée à ${next}`);
          router.back();
        }}>
          Envoyer la confirmation
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: object }) {
  const C = useColors();
  return (
    <View style={style}>
      <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 11, color: C.n500, letterSpacing: 0.6, marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <View style={{ backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.divider, paddingHorizontal: 14, paddingVertical: 12 }}>
        {children}
      </View>
    </View>
  );
}