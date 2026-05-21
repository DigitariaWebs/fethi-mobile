import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { Icon } from '@/components';
import { AuthShell } from '@/components/auth/AuthShell';
import { authApi, ApiError } from '@/lib/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthEmail() {
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const valid = EMAIL_RE.test(email.trim());
  const showError =
    networkError !== null || (email.length > 0 && !valid && !focused);

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setNetworkError(null);
    const target = email.trim().toLowerCase();
    try {
      await authApi.requestOtp({
        channel: 'EMAIL',
        target,
        purpose: 'LOGIN',
      });
      router.push({
        pathname: '/auth/otp',
        params: { via: 'email', value: target },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setNetworkError(err.message || 'Envoi impossible.');
      } else {
        setNetworkError('Impossible de contacter le serveur.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={'Se connecter\npar e-mail'}
      subtitle="On t'envoie un code à 6 chiffres pour vérifier que c'est bien toi."
      ctaLabel={submitting ? 'Envoi…' : 'Envoyer le code'}
      ctaDisabled={!valid}
      ctaLoading={submitting}
      onCta={submit}
    >
      <Label>E-MAIL</Label>
      <View
        style={[
          Sh.subtle,
          {
            height: 56,
            borderRadius: R.full,
            paddingHorizontal: 20,
            backgroundColor: C.surface,
            borderWidth: 1.5,
            borderColor: showError ? C.danger : focused ? C.ink : C.n200,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          },
        ]}
      >
        <Icon.Mail size={18} color={showError ? C.danger : C.n500} />
        <TextInput
          autoFocus
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={submit}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          placeholder="toi@exemple.com"
          placeholderTextColor={C.n400}
          returnKeyType="send"
          style={[t('bodyLg'), { flex: 1, color: C.ink, padding: 0 }]}
        />
      </View>
      {showError && (
        <Text style={[t('bodySm'), { color: C.danger, marginTop: 6, marginLeft: 4 }]}>
          {networkError ?? 'Cet e-mail ne semble pas valide.'}
        </Text>
      )}

      <View
        style={{
          marginTop: 22,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: R.md,
          backgroundColor: C.accentSoft,
        }}
      >
        <Text style={[t('bodySm'), { color: isDark ? C.n800 : '#1F4F38', lineHeight: 19 }]}>
          Nouveau sur MyStreet ?{' '}
          <Text style={{ fontFamily: 'InstrumentSans-SemiBold' }}>
            Utilise le même e-mail
          </Text>{' '}
          pour te connecter ou créer un compte — on gère les deux.
        </Text>
      </View>
    </AuthShell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  const C = useColors();
  return (
    <Text
      style={{
        fontFamily: 'InstrumentSans-SemiBold',
        fontSize: 12,
        color: C.n500,
        marginBottom: 8,
        marginLeft: 4,
      }}
    >
      {children}
    </Text>
  );
}
