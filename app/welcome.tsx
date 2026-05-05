import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, useIsDark, t } from '@/theme';
import { MSButton, MSWordmark, ThemeToggle } from '@/components';

const HERO_VIDEO = require('../assets/video/hero-mobile.mp4');

// Phase 1 / Screen 2 — Welcome.
// Hero video header (matches web's hero-mobile.mp4) + bottom copy + two CTAs.
export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const isDark = useIsDark();

  const player = useVideoPlayer(HERO_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => () => player.release(), [player]);

  // Cream → paper gradient over the bottom of the video so text reads cleanly
  // on either theme. We feed the active paper color in, so the seam between
  // video and content disappears in dark mode too.
  const fadeMid = isDark ? 'rgba(24,21,18,0)' : 'rgba(251,248,244,0)';

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 480 }}>
        <VideoView
          player={player}
          style={{ width: '100%', height: 480 }}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.18)', fadeMid, C.paper]}
          locations={[0, 0.5, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View
          style={{
            position: 'absolute',
            top: insets.top + 16,
            left: 24,
            right: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <MSWordmark size={22} color="#FFF" />
          <ThemeToggle size="sm" onDarkSurface />
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: 40 + insets.bottom,
          gap: 24,
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 38,
              lineHeight: 40,
              letterSpacing: -0.95,
              color: C.ink,
            }}
          >
            Découvre ce que tes{' '}
            <Text
              style={{
                fontFamily: 'InstrumentSerif-Italic',
                color: C.primary,
                fontWeight: '400',
              }}
            >
              voisins
            </Text>{' '}
            vendent.
          </Text>
          <Text style={[t('bodyLg'), { color: C.n600, marginTop: 16 }]}>
            Un marché pour ta rue. Achète et vends à deux pas de chez toi — pas de livraison, de vrais
            voisins.
          </Text>
        </View>
        <View style={{ gap: 10 }}>
          <MSButton size="lg" fullWidth onPress={() => router.push('/auth')}>
            Commencer
          </MSButton>
          <MSButton size="lg" variant="ghost" fullWidth onPress={() => router.push('/auth')}>
            J'ai déjà un compte
          </MSButton>
        </View>
      </View>
    </View>
  );
}
