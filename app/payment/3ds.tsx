import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';

// 3DS challenge — visual mock of the WebView'd bank verification step.
// Native form fields, locked-down chrome.
export default function ThreeDSChallenge() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [step, setStep] = useState<'enter' | 'verifying'>('enter');
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);

  useEffect(() => {
    if (step !== 'verifying') return;
    const tid = setTimeout(() => router.replace(`/payment/success?orderId=${orderId}` as any), 1500);
    return () => clearTimeout(tid);
  }, [step, orderId, router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F12' }}>
      {/* Locked WebView chrome */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 12,
          paddingBottom: 8,
          backgroundColor: '#1B1B22',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.08)',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path d="M6 11 V 8 a 6 6 0 0 1 12 0 V 11" stroke="rgba(255,255,255,0.7)" strokeWidth={2} />
          <Path d="M5 11 H 19 V 21 H 5 Z" stroke="rgba(255,255,255,0.7)" strokeWidth={2} />
        </Svg>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'InstrumentSans-Medium' }}>
          secure-3ds.bnpparibas.fr
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF',
          padding: 24,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            backgroundColor: '#0E5C9C',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 24,
          }}
        >
          <Text style={{ color: '#FFF', fontFamily: 'InstrumentSans-Bold', fontSize: 14 }}>
            BNP
          </Text>
        </View>
        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 18, color: '#111', marginTop: 18 }}>
          Vérifier avec BNP Paribas
        </Text>
        {step === 'enter' ? (
          <>
            <Text style={[t('body'), { color: '#444', textAlign: 'center', marginTop: 8, maxWidth: 320 }]}>
              Un code à 6 chiffres a été envoyé par SMS au •• 12. Saisis-le pour confirmer l'achat.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 24 }}>
              {code.map((c, i) => (
                <View
                  key={i}
                  style={{
                    width: 38,
                    height: 46,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#CCC',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 18, color: '#111' }}>
                    {c}
                  </Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => {
                setCode(['1', '2', '3', '4', '5', '6']);
                setStep('verifying');
              }}
              style={{
                marginTop: 28,
                backgroundColor: '#0E5C9C',
                paddingHorizontal: 36,
                paddingVertical: 14,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFF', fontFamily: 'InstrumentSans-SemiBold', fontSize: 15 }}>
                Confirmer (démo)
              </Text>
            </Pressable>
            <Pressable onPress={() => router.replace('/payment/failure' as any)} style={{ marginTop: 12 }}>
              <Text style={{ color: '#0E5C9C', fontFamily: 'InstrumentSans-Medium', fontSize: 13 }}>
                Annuler la vérification
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 32 }}>
            <ActivityIndicator color="#0E5C9C" />
            <Text style={[t('body'), { color: '#444', marginTop: 12 }]}>Vérification…</Text>
          </View>
        )}
      </View>
    </View>
  );
}
