import { useMemo, useState } from 'react';
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
import { Icon, MSButton, PageHeader } from '@/components';
import { CardBrandGlyph } from '@/components/payments/CardBrandGlyph';
import { detectBrand, formatPan, usePayments, type CardBrand } from '@/lib/payments';
import { useToast } from '@/lib/toast';

// Stripe-style card form. PAN field shows the brand glyph inline as the
// user types. Errors only render after blur (less noisy than per-keystroke
// validation), and disappear as soon as the value becomes valid.
export default function AddCard() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const addCard = usePayments((s) => s.addCard);

  const [pan, setPan] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [postal, setPostal] = useState('');
  const fieldInputStyle = {
    flex: 1,
    fontFamily: 'InstrumentSans-Medium',
    fontSize: 16,
    color: C.ink,
    padding: 0,
  } as const;
  const [nickname, setNickname] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const brand: CardBrand = useMemo(() => detectBrand(pan), [pan]);
  const panDigits = pan.replace(/\D/g, '');
  const panFormatted = formatPan(pan, brand);
  const panLen = brand === 'amex' ? 15 : 16;
  const panOk = panDigits.length === panLen;
  const expMatch = exp.match(/^(\d{2})\s*\/?\s*(\d{2})$/);
  const expOk =
    !!expMatch &&
    parseInt(expMatch[1], 10) >= 1 &&
    parseInt(expMatch[1], 10) <= 12;
  const cvcOk = brand === 'amex' ? cvc.length === 4 : cvc.length === 3;
  const postalOk = postal.length === 5; // FR
  const valid = panOk && expOk && cvcOk && postalOk;

  const submit = () => {
    if (!valid || !expMatch) return;
    addCard({
      brand,
      last4: panDigits.slice(-4),
      expMonth: parseInt(expMatch[1], 10),
      expYear: 2000 + parseInt(expMatch[2], 10),
      nickname: nickname.trim() || undefined,
    });
    toast.success(`Carte ajoutée · ${brand.toUpperCase()} •••• ${panDigits.slice(-4)}`);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PageHeader
        title="Ajouter une carte"
        trailing={
          <Pressable
            onPress={() => router.push('/payment/methods/add/scan' as any)}
            hitSlop={6}
            style={{
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.Camera size={20} color={C.ink} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card number */}
        <Field label="Numéro de carte" error={touched.pan && !panOk ? 'Saisis un numéro de carte valide.' : null}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TextInput
              autoFocus
              value={panFormatted}
              onChangeText={(v) => setPan(v.replace(/\D/g, '').slice(0, panLen))}
              onBlur={() => setTouched((s) => ({ ...s, pan: true }))}
              placeholder="1234 1234 1234 1234"
              placeholderTextColor={C.n400}
              keyboardType="number-pad"
              autoComplete="cc-number"
              style={fieldInputStyle}
            />
            <CardBrandGlyph brand={brand} size="sm" />
          </View>
        </Field>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={{ flex: 1 }}>
            <Field
              label="Expire"
              error={touched.exp && !expOk ? 'MM / AA' : null}
            >
              <TextInput
                value={exp}
                onChangeText={(v) => {
                  const d = v.replace(/\D/g, '').slice(0, 4);
                  setExp(d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d);
                }}
                onBlur={() => setTouched((s) => ({ ...s, exp: true }))}
                placeholder="MM / AA"
                placeholderTextColor={C.n400}
                keyboardType="number-pad"
                autoComplete="cc-exp"
                style={fieldInputStyle}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Cryptogramme"
              error={touched.cvc && !cvcOk ? `${brand === 'amex' ? '4' : '3'} chiffres` : null}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TextInput
                  value={cvc}
                  onChangeText={(v) => setCvc(v.replace(/\D/g, '').slice(0, brand === 'amex' ? 4 : 3))}
                  onBlur={() => setTouched((s) => ({ ...s, cvc: true }))}
                  placeholder={brand === 'amex' ? 'CVV' : 'CVC'}
                  placeholderTextColor={C.n400}
                  keyboardType="number-pad"
                  secureTextEntry
                  autoComplete="cc-csc"
                  style={fieldInputStyle}
                />
                <Svg width={18} height={12} viewBox="0 0 24 16">
                  <Path d="M2 2 H 22 V 14 H 2 Z" stroke={C.n400} strokeWidth={1.5} fill="none" />
                  <Path d="M16 8 H 20" stroke={C.n400} strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </View>
            </Field>
          </View>
        </View>

        <Field
          label="Code postal"
          error={touched.postal && !postalOk ? 'Code postal français à 5 chiffres.' : null}
          style={{ marginTop: 14 }}
        >
          <TextInput
            value={postal}
            onChangeText={(v) => setPostal(v.replace(/\D/g, '').slice(0, 5))}
            onBlur={() => setTouched((s) => ({ ...s, postal: true }))}
            placeholder="59000"
            placeholderTextColor={C.n400}
            keyboardType="number-pad"
            autoComplete="postal-code"
            style={fieldInputStyle}
          />
        </Field>

        <Field label="Surnom  (optionnel)" style={{ marginTop: 14 }}>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="ex. Perso"
            placeholderTextColor={C.n400}
            style={fieldInputStyle}
          />
        </Field>

        <View
          style={{
            marginTop: 18,
            padding: 12,
            backgroundColor: C.n50,
            borderRadius: R.md,
            flexDirection: 'row',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
            <Path d="M6 11 V 8 a 6 6 0 0 1 12 0 V 11" stroke={C.n500} strokeWidth={2} strokeLinejoin="round" />
            <Path d="M5 11 H 19 V 21 H 5 Z" stroke={C.n500} strokeWidth={2} strokeLinejoin="round" />
          </Svg>
          <Text style={[t('caption'), { color: C.n500, flex: 1, lineHeight: 16 }]}>
            Nous ne voyons pas ton numéro de carte — c'est Stripe qui le stocke. Les débits apparaissent sous MYSTREET sur ton relevé.
          </Text>
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
        <MSButton size="lg" fullWidth state={valid ? undefined : 'disabled'} onPress={submit}>
          Enregistrer la carte
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}

// Field wrapper — Stripe treatment: subtle bottom border, error appears
// red below the input (not inside it), border tints red while error active.
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
      {error ? (
        <Text style={[t('caption'), { color: C.danger, marginTop: 4 }]}>{error}</Text>
      ) : null}
    </View>
  );
}

