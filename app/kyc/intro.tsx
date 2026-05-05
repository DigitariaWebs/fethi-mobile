import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';

const POINTS = [
  { title: 'Vérifie toi, pas seulement ta carte', body: 'Un socle de confiance pour tous les voisins.' },
  { title: 'Tes photos restent privées', body: 'Elles servent une fois et sont stockées de manière chiffrée.' },
  { title: 'Prend 2 à 3 minutes', body: 'Munis-toi de ta carte d\'identité et place-toi dans un endroit bien éclairé.' },
];

export default function KYCIntro() {
  const C = useColors();
  const router = useRouter();
  const { signup } = useLocalSearchParams<{ signup?: string }>();
  const isSignup = signup === '1';
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Vérifie ton identité" />
      <View style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontFamily: 'InstrumentSerif-Italic', fontSize: 32, color: C.ink, lineHeight: 36, letterSpacing: -0.6 }}>
          La confiance se gagne dans les deux sens.
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 12, lineHeight: 22 }]}>
          Nous vérifions tout le monde avant le premier versement — pour ta sécurité et celle de tes acheteurs.
        </Text>

        <View style={{ marginTop: 28, gap: 14 }}>
          {POINTS.map((p) => (
            <View key={p.title} style={{ flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: C.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12 L 10 17 L 19 7" stroke={C.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
                  {p.title}
                </Text>
                <Text style={[t('bodySm'), { color: C.n600, marginTop: 2, lineHeight: 20 }]}>{p.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 8 }}>
        <MSButton
          size="lg"
          fullWidth
          onPress={() =>
            router.push((isSignup ? '/kyc/identity?signup=1' : '/kyc/identity') as any)
          }
        >
          J'ai 3 minutes
        </MSButton>
        {isSignup ? (
          <Pressable
            onPress={() => router.replace('/onboarding/success' as any)}
            hitSlop={8}
            style={{ paddingVertical: 10, alignItems: 'center' }}
          >
            <Text style={[t('body'), { color: C.n600, fontFamily: 'InstrumentSans-Medium' }]}>
              Plus tard
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
