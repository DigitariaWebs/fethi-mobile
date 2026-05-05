import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';

// Awaiting seller acceptance. Real backend would push a state change in;
// for the mock we count down a 30s "auto-cancel" window so the screen
// feels alive.
export default function BookingAwaiting() {
  const C = useColors();
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(30);
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + pulse.value * 0.5,
    transform: [{ scale: 1 + pulse.value * 0.15 }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Réservation envoyée" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: C.primarySoft,
              },
              ringStyle,
            ]}
          />
          <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} stroke={C.primary} strokeWidth={2} />
            <Path d="M12 6 V 12 L 16 14" stroke={C.primary} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 22,
            color: C.ink,
            textAlign: 'center',
          }}
        >
          En attente de l'hôte…
        </Text>
        <Text
          style={[t('body'), { color: C.n600, textAlign: 'center', marginTop: 8, maxWidth: 320, lineHeight: 22 }]}
        >
          Nous avons envoyé ta demande. Tu seras prévenu(e) dès qu'elle est acceptée.
        </Text>
        <Text
          style={[t('caption'), { color: C.n500, marginTop: 18 }]}
        >
          {secondsLeft > 0
            ? `Annulation automatique dans ${secondsLeft} s sans réponse.`
            : 'Toujours en attente — n\'hésite pas à leur écrire.'}
        </Text>
        <View style={{ marginTop: 32, gap: 8, width: '100%', maxWidth: 320 }}>
          <MSButton size="md" fullWidth onPress={() => router.back()}>
            Annuler la demande
          </MSButton>
          <MSButton size="md" fullWidth variant="secondary" onPress={() => router.replace('/(tabs)/messages' as any)}>
            Envoyer un message
          </MSButton>
        </View>
      </View>
    </View>
  );
}
