import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useColors, radius as R, t } from '@/theme';
import { Icon, MSButton } from '@/components';
import {
  CommunityIllustration,
  MapIllustration,
  SellIllustration,
} from '@/components/onboarding/illustrations';

// Phase 1 / Screens 4-5-6 — value-prop slides as a single horizontally
// swipeable pager. Illustration + copy swipe together; the Skip link, page
// dots, and Next CTA stay pinned. Both swipe and the Next button advance.
const SLIDES = [
  {
    illustration: <MapIllustration />,
    headline: "Vois ce qui se vend dans ta rue",
    sub: "Une carte en direct des objets à vendre à deux pas de chez toi — découvre ce dont tes voisins n'ont plus besoin.",
  },
  {
    illustration: <SellIllustration />,
    headline: "Vends ce dont tu n'as plus besoin",
    sub: 'Une photo, un prix, c\'est fait. Pas de frais de livraison, pas de carton — juste à remettre en main propre.',
  },
  {
    illustration: <CommunityIllustration />,
    headline: 'Rencontre tes voisins',
    sub: "De vraies personnes, de vraies rencontres. Le meilleur dans l'achat local, ce n'est pas la bonne affaire — c'est ce qu'elle ouvre.",
  },
];

const NEXT_DESTINATION = '/onboarding/address';

export default function Slides() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const screenW = Dimensions.get('window').width;
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  // Tracks the current scroll offset in *pages* (e.g. 0.42 between page 0
  // and page 1). Drives the active-dot pill width animation.
  const progress = useSharedValue(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    progress.value = e.nativeEvent.contentOffset.x / screenW;
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / screenW);
    setIndex(i);
  };

  const advance = () => {
    if (index < SLIDES.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      router.replace(NEXT_DESTINATION);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Skip — always visible, top-right */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 8,
          right: 24,
          zIndex: 20,
        }}
      >
        <Pressable
          onPress={() => router.replace(NEXT_DESTINATION)}
          hitSlop={8}
          style={{ padding: 8 }}
        >
          <Text style={[t('body'), { color: C.n600, fontFamily: 'InstrumentSans-Medium' }]}>
            Passer
          </Text>
        </Pressable>
      </View>

      {/* Pager */}
      <FlatList
        ref={ref}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, i) => ({ length: screenW, offset: screenW * i, index: i })}
        renderItem={({ item }) => (
          <View
            style={{
              width: screenW,
              paddingTop: insets.top + 56,
              paddingHorizontal: 24,
              paddingBottom: 160 + insets.bottom,
            }}
          >
            <View
              style={{
                height: 380,
                borderRadius: R.xl2,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: C.divider,
              }}
            >
              {item.illustration}
            </View>
            <View style={{ marginTop: 32 }}>
              <Text
                style={{
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 28,
                  lineHeight: 32,
                  letterSpacing: -0.56,
                  color: C.ink,
                }}
              >
                {item.headline}
              </Text>
              <Text style={[t('body'), { color: C.n600, marginTop: 8 }]}>
                {item.sub}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Bottom chrome — dots + Next */}
      <View
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: 24 + insets.bottom,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SLIDES.map((_, i) => (
            <Dot key={i} i={i} progress={progress} />
          ))}
        </View>
        <MSButton
          iconRight={<Icon.Chevron size={16} color="#FFF" />}
          onPress={advance}
        >
          {index === SLIDES.length - 1 ? 'Continuer' : 'Suivant'}
        </MSButton>
      </View>
    </View>
  );
}

// Dot grows into a pill as the page approaches it, and shrinks as it leaves.
// Color also blends from neutral to brand around that page's center.
function Dot({
  i,
  progress,
}: {
  i: number;
  progress: ReturnType<typeof useSharedValue<number>>;
}) {
  const C = useColors();
  const style = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - i);
    return {
      width: interpolate(distance, [0, 1], [24, 8], Extrapolation.CLAMP),
      backgroundColor:
        distance < 0.5
          ? C.primary
          : C.n200,
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
        },
        style,
      ]}
    />
  );
}
