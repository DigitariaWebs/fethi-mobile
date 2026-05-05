import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { Icon } from '@/components';

// First-launch tutorial. Five lightweight cards that walk a fresh user
// through the five surfaces of the app: Map, Search, Sell (+), Messages,
// Profil. Each step has its own illustration tinted with the brand
// terracotta. Skip dismisses immediately; "Suivant" advances; the final
// step's CTA calls onDone().
//
// Implemented as an absolutely-positioned full-screen View (NOT a RN
// Modal) so it always layers above the native map host and the floating
// tab bar without relying on platform modal-presentation behaviour.

type Step = {
  key: string;
  title: string;
  body: string;
  icon: 'map' | 'search' | 'plus' | 'mail' | 'user';
};

const STEPS: Step[] = [
  {
    key: 'map',
    title: 'Bienvenue sur MyStreet',
    body: "Découvre tout ce qui se vend, se loue ou se rend service autour de toi. Les épingles montrent les annonces dans ton quartier — tape-en une pour voir le détail.",
    icon: 'map',
  },
  {
    key: 'search',
    title: 'Trouve en quelques secondes',
    body: "Recherche par mot-clé, parcoure les catégories ou enregistre une recherche pour être alerté dès qu'une annonce correspond.",
    icon: 'search',
  },
  {
    key: 'sell',
    title: 'Vends en 2 minutes',
    body: "Tape sur le bouton + au centre de la barre pour publier une annonce. Photos, titre, prix — c'est tout.",
    icon: 'plus',
  },
  {
    key: 'messages',
    title: 'Échange & négocie',
    body: "Discute avec les acheteurs et vendeurs, fais une offre, propose un point de retrait — tout se passe dans Messages.",
    icon: 'mail',
  },
  {
    key: 'profile',
    title: 'Ton profil, tes annonces',
    body: "Retrouve tes annonces, tes ventes, tes paramètres et ton historique dans l'onglet Toi. Tu pourras rejouer ce tuto à tout moment depuis les réglages.",
    icon: 'user',
  },
];

export function TutorialOverlay({
  visible,
  onDone,
  onSkip,
}: {
  visible: boolean;
  onDone: () => void;
  onSkip: () => void;
}) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);

  // Two animations:
  //  - `enter` fades the whole overlay in/out so it doesn't pop in cold.
  //  - `stepFade` cross-fades the card between steps.
  const enter = useRef(new Animated.Value(0)).current;
  const stepFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setStepIndex(0);
      stepFade.setValue(1);
      Animated.timing(enter, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      enter.setValue(0);
    }
  }, [visible, enter, stepFade]);

  if (!visible) return null;

  const isLast = stepIndex === STEPS.length - 1;
  const step = STEPS[stepIndex];

  const goTo = (next: number) => {
    Animated.timing(stepFade, {
      toValue: 0,
      duration: 130,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setStepIndex(next);
      Animated.timing(stepFade, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (isLast) onDone();
    else goTo(stepIndex + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) goTo(stepIndex - 1);
  };

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: 'rgba(15, 18, 16, 0.62)',
          justifyContent: 'flex-end',
          opacity: enter,
          zIndex: 9999,
          elevation: 9999,
        },
      ]}
    >
      {/* Top bar — Skip button */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 8,
          right: 12,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Passer le tutoriel"
          onPress={onSkip}
          hitSlop={10}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: R.full,
            backgroundColor: 'rgba(255,255,255,0.18)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text
            style={{
              color: '#FFF',
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 13,
            }}
          >
            Passer
          </Text>
          <Icon.Close size={12} color="#FFF" />
        </Pressable>
      </View>

      {/* Card */}
      <Animated.View
        style={{
          opacity: stepFade,
          backgroundColor: C.paper,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: Math.max(insets.bottom + 20, 28),
        }}
      >
        {/* Illustration */}
        <View
          style={{
            alignSelf: 'center',
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: C.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 22,
          }}
        >
          <StepIcon name={step.icon} />
        </View>

        {/* Step indicator */}
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            gap: 6,
            marginBottom: 16,
          }}
        >
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === stepIndex ? 22 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === stepIndex ? C.primary : C.n200,
              }}
            />
          ))}
        </View>

        <Text
          style={{
            fontFamily: 'InstrumentSerif-Italic',
            fontSize: 28,
            lineHeight: 32,
            color: C.ink,
            textAlign: 'center',
            letterSpacing: -0.3,
          }}
        >
          {step.title}
        </Text>

        <Text
          style={[
            t('body'),
            {
              color: C.n600,
              marginTop: 12,
              textAlign: 'center',
              lineHeight: 22,
              paddingHorizontal: 4,
            },
          ]}
        >
          {step.body}
        </Text>

        {/* Controls */}
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 26,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Étape précédente"
            accessibilityState={{ disabled: stepIndex === 0 }}
            onPress={handleBack}
            disabled={stepIndex === 0}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              borderWidth: 1.5,
              borderColor: stepIndex === 0 ? C.n200 : C.ink,
              backgroundColor: C.surface,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: stepIndex === 0 ? 0.4 : 1,
            }}
          >
            <Icon.Chevron size={16} dir="left" color={C.ink} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLast ? 'Terminer le tutoriel' : 'Étape suivante'}
            onPress={handleNext}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 26,
              backgroundColor: C.ink,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Text
              style={{
                color: C.paper,
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 15,
              }}
            >
              {isLast ? "C'est parti" : 'Suivant'}
            </Text>
            {!isLast && <Icon.Chevron size={14} color={C.paper} />}
            {isLast && <Icon.Check size={14} color={C.paper} />}
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function StepIcon({ name }: { name: Step['icon'] }) {
  const C = useColors();
  const size = 40;
  const col = C.primary;
  switch (name) {
    case 'map':
      return <Icon.Map size={size} color={col} />;
    case 'search':
      return <Icon.Search size={size} color={col} />;
    case 'plus':
      return <Icon.Plus size={size} color={col} />;
    case 'mail':
      return <Icon.Mail size={size} color={col} />;
    case 'user':
      return <Icon.User size={size} color={col} />;
  }
}
