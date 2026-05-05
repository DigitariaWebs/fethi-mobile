import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { AuthShell } from '@/components/auth/AuthShell';

const LEN = 6;
const RESEND_SECONDS = 30;

// Shared OTP screen — works for both email (`?via=email`) and phone (`?via=phone`).
// Six visual digit slots are driven by a single hidden TextInput so paste,
// keyboard suggestions (one-time-code autofill) and backspace all work the
// way iOS users expect.
export default function AuthOTP() {
  const C = useColors();
  const router = useRouter();
  const { via, value } = useLocalSearchParams<{ via?: 'email' | 'phone'; value?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Resend countdown.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const channelLabel = via === 'phone' ? 'téléphone' : 'e-mail';
  const masked = maskTarget(via, value);

  const submit = async (override?: string) => {
    const c = (override ?? code).replace(/\D/g, '').slice(0, LEN);
    if (c.length !== LEN || submitting) return;
    setSubmitting(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);

    // Demo rule: any code ending in 000 fails. Anything else proceeds.
    if (c.endsWith('000')) {
      setError('Ce code ne correspond pas. Réessaie ou renvoie-le.');
      setCode('');
      inputRef.current?.focus();
      return;
    }
    router.replace('/onboarding/slides');
  };

  const onChange = (raw: string) => {
    const clean = raw.replace(/\D/g, '').slice(0, LEN);
    setCode(clean);
    setError(null);
    if (clean.length === LEN) submit(clean);
  };

  const resend = () => {
    if (secondsLeft > 0) return;
    setCode('');
    setError(null);
    setSecondsLeft(RESEND_SECONDS);
    inputRef.current?.focus();
  };

  return (
    <AuthShell
      title={'Entre ton\ncode'}
      subtitle={`On a envoyé un code à 6 chiffres à ton ${channelLabel}${masked ? ' ' + masked : ''}.`}
      ctaLabel={submitting ? 'Vérification…' : 'Vérifier et continuer'}
      ctaDisabled={code.length !== LEN}
      ctaLoading={submitting}
      onCta={() => submit()}
      footer={
        <View style={{ alignItems: 'center', gap: 14 }}>
          <Pressable
            disabled={secondsLeft > 0}
            onPress={resend}
            hitSlop={8}
            style={{ paddingVertical: 6 }}
          >
            <Text
              style={[
                t('body'),
                {
                  color: secondsLeft > 0 ? C.n400 : C.primary,
                  fontFamily: 'InstrumentSans-SemiBold',
                },
              ]}
            >
              {secondsLeft > 0 ? `Renvoyer le code dans ${secondsLeft}s` : 'Renvoyer le code'}
            </Text>
          </Pressable>
          <Pressable hitSlop={8} onPress={() => router.back()}>
            <Text
              style={[
                t('bodySm'),
                { color: C.n600, fontFamily: 'InstrumentSans-Medium' },
              ]}
            >
              Utiliser un autre {channelLabel}
            </Text>
          </Pressable>
        </View>
      }
    >
      {/* Hidden input drives the visible slots */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={onChange}
        keyboardType="number-pad"
        autoComplete={via === 'phone' ? 'sms-otp' : 'one-time-code'}
        textContentType="oneTimeCode"
        maxLength={LEN}
        caretHidden
        style={{
          position: 'absolute',
          opacity: 0,
          width: 1,
          height: 1,
        }}
      />
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}
      >
        {Array.from({ length: LEN }).map((_, i) => {
          const ch = code[i];
          const isCursor = i === code.length;
          return (
            <View
              key={i}
              style={[
                Sh.subtle,
                {
                  flex: 1,
                  height: 64,
                  borderRadius: R.md,
                  backgroundColor: C.surface,
                  borderWidth: 1.5,
                  borderColor: error
                    ? C.danger
                    : ch
                      ? C.ink
                      : isCursor
                        ? C.ink
                        : C.n200,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 28,
                  color: C.ink,
                  letterSpacing: 0,
                }}
              >
                {ch ?? ''}
              </Text>
            </View>
          );
        })}
      </Pressable>
      {error && (
        <Text
          style={[
            t('bodySm'),
            { color: C.danger, marginTop: 12, marginLeft: 4 },
          ]}
        >
          {error}
        </Text>
      )}
    </AuthShell>
  );
}

function maskTarget(via: string | undefined, value: string | undefined): string {
  if (!value) return '';
  if (via === 'email') {
    const [local, domain] = value.split('@');
    if (!domain) return value;
    const head = local.slice(0, 2);
    return `${head}${'•'.repeat(Math.max(1, local.length - 2))}@${domain}`;
  }
  // phone — keep dial code + last 2 digits visible
  const last = value.slice(-2);
  const head = value.slice(0, value.length > 6 ? 4 : 2);
  return `${head} ••• •• ${last}`;
}
