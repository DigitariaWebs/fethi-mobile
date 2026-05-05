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
import { usePayments } from '@/lib/payments';
import { useToast } from '@/lib/toast';

export default function AddIBAN() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const addBank = usePayments((s) => s.addBank);
  const [holder, setHolder] = useState('');
  const [iban, setIban] = useState('');
  const [touched, setTouched] = useState<{ holder?: boolean; iban?: boolean }>({});

  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  const ibanOk = /^FR\d{12,25}$/.test(cleanIban);
  const holderOk = holder.trim().length >= 3;
  const valid = holderOk && ibanOk;
  const fieldInputStyle = {
    fontFamily: 'InstrumentSans-Medium',
    fontSize: 16,
    color: C.ink,
    padding: 0,
  } as const;

  const submit = () => {
    if (!valid) return;
    addBank({ iban: chunked(cleanIban), holder: holder.trim() });
    toast.success('Compte bancaire ajouté.');
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title="Ajouter un IBAN" />
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Field
          label="Titulaire du compte"
          error={touched.holder && !holderOk ? 'Requis.' : null}
        >
          <TextInput
            autoFocus
            value={holder}
            onChangeText={setHolder}
            onBlur={() => setTouched((s) => ({ ...s, holder: true }))}
            placeholder="Marie Lefèvre"
            placeholderTextColor={C.n400}
            style={fieldInputStyle}
          />
        </Field>

        <Field
          label="IBAN"
          error={touched.iban && !ibanOk ? 'Un IBAN français commence par FR.' : null}
          style={{ marginTop: 14 }}
        >
          <TextInput
            value={iban}
            onChangeText={(v) => setIban(v.toUpperCase())}
            onBlur={() => setTouched((s) => ({ ...s, iban: true }))}
            placeholder="FR76 0000 0000 0000 0000 0000 000"
            placeholderTextColor={C.n400}
            autoCapitalize="characters"
            style={fieldInputStyle}
          />
        </Field>

        <Text style={[t('caption'), { color: C.n500, marginTop: 12, lineHeight: 16 }]}>
          Nous ne voyons pas ton IBAN — c'est Stripe qui le stocke. Les versements arrivent sous 1 à 2 jours ouvrés.
        </Text>
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
        <MSButton size="lg" fullWidth state={valid ? undefined : 'disabled'} onPress={submit}>
          Enregistrer
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}

function chunked(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

function Field({
  label,
  children,
  error,
  style,
}: {
  label: string;
  children: React.ReactNode;
  error?: string | null;
  style?: object;
}) {
  const C = useColors();
  return (
    <View style={style}>
      <Text
        style={{
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 11,
          color: C.n500,
          letterSpacing: 0.6,
          marginBottom: 6,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <View
        style={{
          backgroundColor: C.surface,
          borderRadius: R.md,
          borderWidth: 1,
          borderColor: error ? C.danger : C.divider,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        {children}
      </View>
      {error ? <Text style={[t('caption'), { color: C.danger, marginTop: 4 }]}>{error}</Text> : null}
    </View>
  );
}
