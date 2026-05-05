import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { Icon } from '@/components';

// Phase 1 / Screen 3 — Auth method picker.
// Three primary methods (Apple, Google, email) + phone fallback.

type AuthRowProps = {
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'outline' | 'ink';
  onPress?: () => void;
};

function AuthRow({ icon, label, variant = 'outline', onPress }: AuthRowProps) {
  const C = useColors();
  const isFilled = variant === 'primary' || variant === 'ink';
  const bg = variant === 'primary' ? '#000' : variant === 'ink' ? C.ink : C.surface;
  const fg = isFilled ? '#FFF' : C.ink;

  return (
    <Pressable
      onPress={onPress}
      style={{
        height: 56,
        borderRadius: R.full,
        backgroundColor: bg,
        borderWidth: isFilled ? 0 : 1.5,
        borderColor: C.n200,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: isFilled ? 4 : 1 },
        shadowOpacity: isFilled ? 0.12 : 0.04,
        shadowRadius: isFilled ? 12 : 2,
        elevation: isFilled ? 4 : 1,
      }}
    >
      {icon}
      <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: fg }}>
        {label}
      </Text>
    </Pressable>
  );
}

const AppleGlyph = () => (
  <Svg width={18} height={22} viewBox="0 0 18 22">
    <Path
      d="M14.7 11.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-2-3.7-2-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.3.9 1.2 1.9 2.6 3.3 2.6 1.3-.1 1.8-.9 3.4-.9s2 .9 3.4.8c1.4 0 2.3-1.3 3.1-2.5.7-1 1.2-2.2 1.5-3.4-.1-.1-2.7-1.1-2.7-4zM12 3.7c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.5-.6.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.4z"
      fill="#FFF"
    />
  </Svg>
);

const GoogleGlyph = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Path
      d="M19.6 10.2c0-.7-.1-1.4-.2-2H10v3.8h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"
      fill="#4285F4"
    />
    <Path
      d="M10 20c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H1.1v2.6C2.7 17.7 6.1 20 10 20z"
      fill="#34A853"
    />
    <Path
      d="M4.4 11.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V5.5H1.1C.4 6.9 0 8.4 0 10s.4 3.1 1.1 4.5l3.3-2.6z"
      fill="#FBBC05"
    />
    <Path
      d="M10 4c1.5 0 2.8.5 3.8 1.5l2.8-2.8C15 1 12.7 0 10 0 6.1 0 2.7 2.3 1.1 5.5l3.3 2.6C5.2 5.8 7.4 4 10 4z"
      fill="#EA4335"
    />
  </Svg>
);

export default function Auth() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const advanceOAuth = () => router.push('/onboarding/slides');
  const advanceEmail = () => router.push('/auth/email');
  const advancePhone = () => router.push('/auth/phone');

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Back */}
      <View style={{ position: 'absolute', top: insets.top + 16, left: 24, zIndex: 20 }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderWidth: 1,
            borderColor: C.n100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.Chevron size={18} dir="left" color={C.ink} />
        </Pressable>
      </View>

      {/* Heading */}
      <View style={{ position: 'absolute', top: insets.top + 86, left: 24, right: 24 }}>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 32,
            lineHeight: 36,
            letterSpacing: -0.64,
            color: C.ink,
          }}
        >
          Bienvenue sur{'\n'}MyStreet
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 12 }]}>
          Choisis comment tu veux continuer.
        </Text>
      </View>

      {/* Methods */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 264,
          left: 24,
          right: 24,
          gap: 10,
        }}
      >
        <AuthRow variant="primary" icon={<AppleGlyph />} label="Continuer avec Apple" onPress={advanceOAuth} />
        <AuthRow icon={<GoogleGlyph />} label="Continuer avec Google" onPress={advanceOAuth} />
        <AuthRow icon={<Icon.Mail size={18} color={C.ink} />} label="Continuer avec un e-mail" onPress={advanceEmail} />

        {/* Divider */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
          <Text style={[t('caption'), { color: C.n500 }]}>ou</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
        </View>

        <Pressable onPress={advancePhone} style={{ paddingVertical: 12, alignItems: 'center' }}>
          <Text style={[t('body'), { color: C.n600 }]}>Se connecter avec un numéro de téléphone</Text>
        </Pressable>
      </View>

      {/* Legalese */}
      <View
        style={{
          position: 'absolute',
          bottom: 24 + insets.bottom,
          left: 24,
          right: 24,
        }}
      >
        <Text style={[t('bodySm'), { color: C.n500, textAlign: 'center', lineHeight: 20 }]}>
          En continuant, tu acceptes les{' '}
          <Text style={{ color: C.ink, textDecorationLine: 'underline' }}>Conditions</Text> et la{' '}
          <Text style={{ color: C.ink, textDecorationLine: 'underline' }}>Politique de confidentialité</Text> de MyStreet.
        </Text>
      </View>
    </View>
  );
}
