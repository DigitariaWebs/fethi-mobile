import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';

// Mock Stripe Connect onboarding. Real implementation uses a hosted
// WebView; here we collect business type → name → DOB → address → IBAN
// → ID upload, then bounce to a "verifying" pending state.
type Step = 'business' | 'identity' | 'address' | 'iban' | 'review';

export default function PayoutsConnect() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [step, setStep] = useState<Step>('business');
  const [businessType, setBusinessType] = useState<'individual' | 'company'>('individual');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [iban, setIban] = useState('');

  const next = () => {
    const order: Step[] = ['business', 'identity', 'address', 'iban', 'review'];
    const i = order.indexOf(step);
    if (i < order.length - 1) setStep(order[i + 1]);
    else {
      toast.success('Stripe vérifie ton compte…');
      router.replace('/payouts' as any);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title="Configure tes versements" subtitle="Propulsé par Stripe" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        {/* Progress dots */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 22 }}>
          {(['business', 'identity', 'address', 'iban', 'review'] as Step[]).map((s, i) => {
            const done =
              ['business', 'identity', 'address', 'iban', 'review'].indexOf(step) >= i;
            return (
              <View
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: done ? C.ink : C.n200,
                }}
              />
            );
          })}
        </View>

        {step === 'business' ? (
          <Section title="Quel type de vendeur es-tu ?">
            {(['individual', 'company'] as const).map((opt) => {
              const sel = businessType === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setBusinessType(opt)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    backgroundColor: C.surface,
                    borderRadius: R.md,
                    borderWidth: sel ? 2 : 1,
                    borderColor: sel ? C.ink : C.divider,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
                      {opt === 'individual' ? 'Particulier' : 'Entreprise / association'}
                    </Text>
                    <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
                      {opt === 'individual' ? 'Pour vendre tes affaires personnelles.' : 'Entreprise enregistrée ou association.'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </Section>
        ) : null}

        {step === 'identity' ? (
          <Section title="Ton nom complet et ta date de naissance">
            <Input value={name} onChangeText={setName} placeholder="Nom complet" autoFocus />
            <Input value={dob} onChangeText={setDob} placeholder="JJ / MM / AAAA" />
          </Section>
        ) : null}

        {step === 'address' ? (
          <Section title="Où habites-tu ?">
            <Input
              value={address}
              onChangeText={setAddress}
              placeholder="Rue, code postal, ville"
              autoFocus
            />
          </Section>
        ) : null}

        {step === 'iban' ? (
          <Section title="Où envoyer tes versements ?">
            <Input
              value={iban}
              onChangeText={(v: string) => setIban(v.toUpperCase())}
              placeholder="FR76 0000 0000 0000 0000 0000 000"
              autoFocus
            />
            <Text style={[t('caption'), { color: C.n500, marginTop: 6 }]}>
              Nous ne stockons pas ton IBAN — c'est Stripe qui le garde.
            </Text>
          </Section>
        ) : null}

        {step === 'review' ? (
          <Section title="Vérifier">
            <View style={{ gap: 8 }}>
              <Row k="Type" v={businessType === 'individual' ? 'Particulier' : 'Entreprise'} />
              <Row k="Nom" v={name || '—'} />
              <Row k="Date de naissance" v={dob || '—'} />
              <Row k="Adresse" v={address || '—'} />
              <Row k="IBAN" v={iban ? '••••' + iban.slice(-4) : '—'} />
            </View>
            <View
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: R.md,
                backgroundColor: C.n50,
                flexDirection: 'row',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
                <Path d="M6 11 V 8 a 6 6 0 0 1 12 0 V 11" stroke={C.n500} strokeWidth={2} />
                <Path d="M5 11 H 19 V 21 H 5 Z" stroke={C.n500} strokeWidth={2} />
              </Svg>
              <Text style={[t('caption'), { color: C.n500, flex: 1, lineHeight: 16 }]}>
                Stripe vérifiera ces informations. Des documents supplémentaires peuvent t'être demandés.
              </Text>
            </View>
          </Section>
        ) : null}
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
        <MSButton size="lg" fullWidth onPress={next}>
          {step === 'review' ? 'Valider' : 'Continuer'}
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const C = useColors();
  return (
    <View>
      <Text
        style={{
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 18,
          color: C.ink,
          marginBottom: 14,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Input(props: any) {
  const C = useColors();
  return (
    <TextInput
      placeholderTextColor={C.n400}
      {...props}
      style={{
        backgroundColor: C.surface,
        borderRadius: R.md,
        borderWidth: 1,
        borderColor: C.divider,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 10,
        fontFamily: 'InstrumentSans-Medium',
        fontSize: 15,
        color: C.ink,
      }}
    />
  );
}

function Row({ k, v }: { k: string; v: string }) {
  const C = useColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.divider }}>
      <Text style={[t('bodySm'), { color: C.n500 }]}>{k}</Text>
      <Text style={{ fontFamily: 'InstrumentSans-Medium', fontSize: 14, color: C.ink }}>{v}</Text>
    </View>
  );
}
