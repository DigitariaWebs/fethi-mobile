import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';

const TIPS = [
  { title: 'Retrouvez-vous en public', body: 'Un café, un marché, un lieu fréquenté. Évitez les bâtiments vides.' },
  { title: 'Venez accompagné(e)', body: 'Un proche — surtout pour les objets de valeur.' },
  { title: "En journée d'abord", body: "Pour une première rencontre, la journée détend tout le monde." },
  { title: 'Restez sur le chat', body: "Si un acheteur/vendeur veut sortir de la plateforme, c'est un signal — reste sur MyStreet." },
];

export default function SafetyHome() {
  const C = useColors();
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Centre de sécurité" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontFamily: 'InstrumentSerif-Italic', fontSize: 32, color: C.ink, lineHeight: 36, letterSpacing: -0.6 }}>
          Rencontrez-vous intelligemment.
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, lineHeight: 22 }]}>
          Quelques habitudes qui rendent notre communauté bienveillante.
        </Text>

        <View style={{ marginTop: 24, gap: 14 }}>
          {TIPS.map((tip) => (
            <View
              key={tip.title}
              style={{
                backgroundColor: C.surface,
                borderRadius: R.lg,
                borderWidth: 1,
                borderColor: C.divider,
                padding: 16,
              }}
            >
              <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
                {tip.title}
              </Text>
              <Text style={[t('bodySm'), { color: C.n600, marginTop: 4, lineHeight: 20 }]}>
                {tip.body}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 24, gap: 8 }}>
          <MSButton size="lg" fullWidth onPress={() => router.push('/safety/verified-meeting-points' as any)}>
            Trouver un point de rencontre vérifié
          </MSButton>
          <MSButton size="md" fullWidth variant="destructive" onPress={() => router.push('/safety/emergency' as any)}>
            Je ne me sens pas en sécurité
          </MSButton>
        </View>
      </ScrollView>
    </View>
  );
}
