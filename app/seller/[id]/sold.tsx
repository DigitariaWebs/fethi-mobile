import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polyline } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { Icon, MSAvatar } from '@/components';
import { MY_LISTING } from '@/lib/myListings';

type StepKey = 'offer' | 'meet' | 'handover' | 'done';

// Phase 6 / Screen 48 — Sold / handover.
export default function SellerSold() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [confirmed, setConfirmed] = useState<Record<StepKey, boolean>>({
    offer: true,
    meet: true,
    handover: false,
    done: false,
  });

  const confirmStep = (key: StepKey, label: string) => {
    Alert.alert(`Confirmer · ${label} ?`, undefined, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer',
        style: 'default',
        onPress: () => setConfirmed((prev) => ({ ...prev, [key]: true })),
      },
    ]);
  };

  const steps: {
    key: StepKey;
    label: string;
    sub: string;
    requires?: StepKey;
  }[] = [
    { key: 'offer', label: 'Offre acceptée', sub: "Aujourd'hui, 14:32" },
    { key: 'meet', label: 'Rendez-vous fixé', sub: "Aujourd'hui, 19:00 · 42 rue Royale" },
    {
      key: 'handover',
      label: 'Remettre le vélo',
      sub: "À l'arrivée d'Amélie",
      requires: 'meet',
    },
    {
      key: 'done',
      label: 'Marquer comme terminé',
      sub: 'Confirmez tous les deux pour débloquer la note',
      requires: 'handover',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.Chevron size={18} dir="left" color={C.ink} />
        </Pressable>
        <Text
          style={[
            t('h3'),
            { fontSize: 17, color: C.ink, fontFamily: 'InstrumentSans-SemiBold' },
          ]}
        >
          Vente
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View
          style={{
            borderRadius: R.xl,
            overflow: 'hidden',
            marginTop: 6,
            marginBottom: 14,
          }}
        >
          <LinearGradient
            colors={['#2F6B5E', '#1F4F44']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 18,
              paddingTop: 20,
              paddingBottom: 22,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <Polyline points="20 6 9 17 4 12" stroke="#FFF" strokeWidth={2.5} />
              </Svg>
              <Text
                style={{
                  color: '#FFF',
                  opacity: 0.7,
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 11,
                  letterSpacing: 0.88,
                }}
              >
VENDU À AMÉLIE
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'InstrumentSerif-Italic',
                fontSize: 36,
                color: '#FFF',
                lineHeight: 36,
                marginTop: 12,
                letterSpacing: -0.36,
              }}
            >
              €115
            </Text>
            <Text
              style={[
                t('bodySm'),
                { color: '#FFF', opacity: 0.85, marginTop: 4 },
              ]}
            >
              {MY_LISTING.base.title}
            </Text>

            <View
              style={{
                marginTop: 16,
                paddingHorizontal: 8,
                paddingRight: 12,
                paddingVertical: 8,
                borderRadius: R.full,
                backgroundColor: 'rgba(255,255,255,0.14)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                alignSelf: 'flex-start',
              }}
            >
              <View style={{ width: 26, height: 26, borderRadius: 13, overflow: 'hidden' }}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80',
                  }}
                  style={{ width: 26, height: 26 }}
                  contentFit="cover"
                />
              </View>
              <Text
                style={[
                  t('bodySm'),
                  { color: '#FFF', fontFamily: 'InstrumentSans-Medium' },
                ]}
              >
Amélie · à 350 m
              </Text>
            </View>
          </LinearGradient>
        </View>

        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 12,
            color: C.n500,
            marginBottom: 10,
          }}
        >
PROCHAINES ÉTAPES
        </Text>

        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            overflow: 'hidden',
            marginBottom: 14,
          }}
        >
          {steps.map((s, i, arr) => {
            const done = confirmed[s.key];
            const prerequisiteMet = !s.requires || confirmed[s.requires];
            const active = !done && prerequisiteMet;
            const tappable = active;

            const inner = (
              <>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: done ? C.success : active ? C.primary : C.surface,
                    borderWidth: done || active ? 0 : 1.5,
                    borderColor: C.n300,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {done && <Icon.Check size={11} color="#FFF" />}
                  {active && (
                    <View
                      style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }}
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      t('bodySm'),
                      {
                        fontFamily: 'InstrumentSans-SemiBold',
                        color: done ? C.n500 : active ? C.primaryInk : C.ink,
                        textDecorationLine: done ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {s.label}
                  </Text>
                  <Text
                    style={[
                      t('caption'),
                      { color: active ? C.primary : C.n500, marginTop: 1 },
                    ]}
                  >
                    {s.sub}
                  </Text>
                </View>
                {tappable && (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: R.full,
                      backgroundColor: C.primary,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFF',
                        fontFamily: 'InstrumentSans-SemiBold',
                        fontSize: 11,
                      }}
                    >
                      Confirmer
                    </Text>
                  </View>
                )}
              </>
            );

            const containerStyle = {
              paddingHorizontal: 14,
              paddingVertical: 12,
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              gap: 12,
              borderBottomWidth: i < arr.length - 1 ? 1 : 0,
              borderBottomColor: C.divider,
              backgroundColor: active ? C.primarySoft : 'transparent',
            };

            return tappable ? (
              <Pressable
                key={s.key}
                onPress={() => confirmStep(s.key, s.label)}
                style={containerStyle}
              >
                {inner}
              </Pressable>
            ) : (
              <View key={s.key} style={containerStyle}>
                {inner}
              </View>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => router.push('/(tabs)/messages/karim')}
            style={{
              flex: 1.8,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: R.full,
              backgroundColor: C.ink,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icon.Mail size={14} color="#FFF" />
            <Text
              numberOfLines={1}
              style={{
                color: C.paper,
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 13,
                flexShrink: 1,
              }}
            >
              Envoyer un message à Amélie
            </Text>
          </Pressable>
          <Pressable
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: R.full,
              backgroundColor: C.surface,
              borderWidth: 1.5,
              borderColor: C.n200,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icon.Pin size={13} color={C.ink} />
            <Text
              numberOfLines={1}
              style={{
                color: C.ink,
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 13,
                flexShrink: 1,
              }}
            >
              Itinéraire
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            marginTop: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: R.md,
            backgroundColor: C.n50,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text
              style={[t('caption'), { color: C.n500, fontFamily: 'InstrumentSans-Medium' }]}
            >
Tu vas recevoir
            </Text>
            <Text
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 22,
                color: C.ink,
                marginTop: 1,
              }}
            >
              €115
            </Text>
          </View>
          <Text
            style={[
              t('caption'),
              { color: C.n500, textAlign: 'right', maxWidth: 160 },
            ]}
          >
Espèces à la remise.{'\n'}Aucuns frais de plateforme en bêta.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
