import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { MSButton } from '@/components';
import { MapBackground } from '@/components/map/MapBackground';

// Three coach marks over a stylized map background. Bottom CTA cycles
// through them, last one drops the user on the real map.
const STEPS = [
  {
    title: 'Trouve ce qui est près de toi',
    body: 'Fais glisser la carte. Appuie sur un prix pour voir l\'annonce.',
    pos: { top: 90, left: 110 },
  },
  {
    title: 'Cherche ce que tu veux',
    body: 'Utilise la barre en haut pour rechercher « vélo », « Le Creuset » ou autre chose.',
    pos: { top: 60, left: 30 },
  },
  {
    title: 'Vends, loue ou propose un service',
    body: 'Le bouton + orange te permet de publier en moins d\'une minute.',
    pos: { bottom: 120, right: 24 },
  },
];

export default function WelcomeTutorial() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);

  const next = () => {
    if (i < STEPS.length - 1) setI(i + 1);
    else router.replace('/(tabs)/map' as any);
  };

  const step = STEPS[i];

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <MapBackground />
      </View>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(31,36,33,0.45)' }} />

      {/* Coach mark */}
      <View
        style={[
          step.pos as any,
          {
            position: 'absolute',
            backgroundColor: C.surface,
            borderRadius: R.lg,
            padding: 16,
            maxWidth: 280,
          },
        ]}
      >
        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 16, color: C.ink }}>{step.title}</Text>
        <Text style={[t('bodySm'), { color: C.n600, marginTop: 6, lineHeight: 19 }]}>{step.body}</Text>
      </View>

      {/* Bottom CTA */}
      <View style={{ position: 'absolute', left: 20, right: 20, bottom: 16 + insets.bottom }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {STEPS.map((_, n) => (
            <View
              key={n}
              style={{
                width: n === i ? 22 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: n === i ? '#FFF' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </View>
        <MSButton size="lg" fullWidth onPress={next}>
          {i < STEPS.length - 1 ? 'Compris' : "C'est parti"}
        </MSButton>
        <Pressable onPress={() => router.replace('/(tabs)/map' as any)} hitSlop={6} style={{ paddingVertical: 10, alignItems: 'center', marginTop: 4 }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'InstrumentSans-Medium', fontSize: 13 }}>Passer le tutoriel</Text>
        </Pressable>
      </View>
    </View>
  );
}
