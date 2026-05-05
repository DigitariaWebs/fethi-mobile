import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';

import { useColors, t } from '@/theme';
import { Icon } from '@/components';
import { useToast } from '@/lib/toast';

// Mock card-scan screen. Real wiring would launch a Vision-backed
// frame analyzer; for now we render a viewfinder with a sweeping line
// and bail back to the form after a fake "captured" toast.
export default function ScanCard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const sweep = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true,
    );
  }, [sweep]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sweep.value * 130 }],
    opacity: 0.8 - sweep.value * 0.4,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={6}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.18)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.Close size={18} color="#FFF" />
        </Pressable>
        <Text style={{ color: '#FFF', fontFamily: 'InstrumentSans-SemiBold', fontSize: 16 }}>
          Scanner la carte
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 320,
            height: 200,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.55)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Corner brackets */}
          <Svg
            width={320}
            height={200}
            viewBox="0 0 320 200"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <Line x1={6} y1={6} x2={36} y2={6} stroke="#FFC107" strokeWidth={3} strokeLinecap="round" />
            <Line x1={6} y1={6} x2={6} y2={36} stroke="#FFC107" strokeWidth={3} strokeLinecap="round" />
            <Line x1={284} y1={6} x2={314} y2={6} stroke="#FFC107" strokeWidth={3} strokeLinecap="round" />
            <Line x1={314} y1={6} x2={314} y2={36} stroke="#FFC107" strokeWidth={3} strokeLinecap="round" />
            <Line x1={6} y1={194} x2={6} y2={164} stroke="#FFC107" strokeWidth={3} strokeLinecap="round" />
            <Line x1={6} y1={194} x2={36} y2={194} stroke="#FFC107" strokeWidth={3} strokeLinecap="round" />
            <Line x1={284} y1={194} x2={314} y2={194} stroke="#FFC107" strokeWidth={3} strokeLinecap="round" />
            <Line x1={314} y1={194} x2={314} y2={164} stroke="#FFC107" strokeWidth={3} strokeLinecap="round" />
          </Svg>
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 30,
                left: 12,
                right: 12,
                height: 2,
                backgroundColor: '#FFC107',
              },
              sweepStyle,
            ]}
          />
        </View>
        <Text style={[t('body'), { color: 'rgba(255,255,255,0.8)', marginTop: 18, textAlign: 'center', maxWidth: 280 }]}>
          Place ta carte à plat dans le cadre.
        </Text>
        <Pressable
          onPress={() => {
            toast.success('Carte capturée · 4242 4242 4242 4242');
            router.back();
          }}
          style={{
            marginTop: 32,
            paddingHorizontal: 18,
            paddingVertical: 11,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.18)',
          }}
        >
          <Text style={{ color: '#FFF', fontFamily: 'InstrumentSans-SemiBold', fontSize: 13 }}>
            Utiliser une carte exemple (démo)
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
