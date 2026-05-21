import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon } from '@/components';
import { AuthShell } from '@/components/auth/AuthShell';
import { FrenchFlag } from '@/components/auth/FrenchFlag';
import { authApi, ApiError } from '@/lib/api';

// Single-region demo: France only. Extending to a full picker is straightforward
// (swap the static button for a modal with the standard country list).
const COUNTRY = { name: 'France', dial: '+33' };

// Light formatter for FR mobile: groups of 2 digits ("06 12 34 56 78").
function formatFr(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  return d.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

export default function AuthPhone() {
  const C = useColors();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, '');
  const valid = digits.length >= 9; // FR mobiles are 9 digits after the leading 0

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setNetworkError(null);
    const e164 = `${COUNTRY.dial}${digits.replace(/^0/, '')}`;
    try {
      await authApi.requestOtp({
        channel: 'SMS',
        target: e164,
        purpose: 'LOGIN',
      });
      router.push({
        pathname: '/auth/otp',
        params: { via: 'phone', value: e164 },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setNetworkError(err.message || 'Envoi du SMS impossible.');
      } else {
        setNetworkError('Impossible de contacter le serveur.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={'Se connecter\npar téléphone'}
      subtitle="On t'envoie un code à 6 chiffres par SMS. Tarifs standards susceptibles de s'appliquer."
      ctaLabel={submitting ? 'Envoi…' : 'Envoyer le code'}
      ctaDisabled={!valid}
      ctaLoading={submitting}
      onCta={submit}
    >
      <Label>NUMÉRO DE TÉLÉPHONE</Label>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          style={[
            Sh.subtle,
            {
              height: 56,
              borderRadius: R.full,
              paddingLeft: 12,
              paddingRight: 10,
              backgroundColor: C.surface,
              borderWidth: 1.5,
              borderColor: C.n200,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            },
          ]}
        >
          <FrenchFlag size={20} />
          <Text
            style={[
              t('bodyLg'),
              { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' },
            ]}
          >
            {COUNTRY.dial}
          </Text>
          <Icon.Chevron size={12} color={C.n500} dir="down" />
        </Pressable>
        <View
          style={[
            Sh.subtle,
            {
              flex: 1,
              minWidth: 0,
              height: 56,
              borderRadius: R.full,
              paddingHorizontal: 18,
              backgroundColor: C.surface,
              borderWidth: 1.5,
              borderColor: focused ? C.ink : C.n200,
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}
        >
          <TextInput
            autoFocus
            value={phone}
            onChangeText={(v) => setPhone(formatFr(v))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            placeholder="06 12 34 56 78"
            placeholderTextColor={C.n400}
            style={[
              t('bodyLg'),
              { flex: 1, minWidth: 0, color: C.ink, padding: 0 },
            ]}
          />
        </View>
      </View>

      {networkError && (
        <Text style={[t('bodySm'), { color: C.danger, marginTop: 8, marginLeft: 4 }]}>
          {networkError}
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
        <Text style={[t('bodySm'), { color: '#1F4F38', lineHeight: 19 }]}>
          On utilise ton numéro uniquement pour vérifier que c'est toi et pour
          envoyer les SMS de coordination lors d'une remise en main propre.
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
