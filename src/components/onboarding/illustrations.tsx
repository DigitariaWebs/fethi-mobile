import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { MSAvatar, MSMapPin } from '@/components';
import { MapBackground } from '@/components/map/MapBackground';
import { LISTINGS } from '@/lib/fixtures';

// Slide 1 — map of pins centered on user
export function MapIllustration() {
  const C = useColors();
  return (
    <View style={{ flex: 1 }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <MapBackground />
      </View>
      <View style={{ position: 'absolute', top: '20%', left: '15%' }}>
        <MSMapPin variant="thumb" label="€120" thumb={LISTINGS[0].thumb} />
      </View>
      <View style={{ position: 'absolute', top: '40%', right: '20%' }}>
        <MSMapPin label="€45" />
      </View>
      <View style={{ position: 'absolute', bottom: '30%', left: '30%' }}>
        <MSMapPin variant="selected" label="€180" thumb={LISTINGS[3].thumb} />
      </View>
      <View style={{ position: 'absolute', top: '15%', right: '12%' }}>
        <MSMapPin variant="cluster" label="6" />
      </View>
      <View style={{ position: 'absolute', bottom: '20%', right: '15%' }}>
        <MSMapPin label="€90" />
      </View>
      {/* User dot */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: '52%',
          left: '52%',
          marginLeft: -40,
          marginTop: -40,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: 'rgba(200,85,61,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Circle cx={9} cy={9} r={9} fill={C.primary} stroke="#FFF" strokeWidth={3} />
        </Svg>
      </View>
    </View>
  );
}

// Slide 2 — Mini phone showing a listing being created
export function SellIllustration() {
  const C = useColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={[
          Sh.strong,
          {
            width: 200,
            height: 360,
            backgroundColor: C.surface,
            borderRadius: 28,
            padding: 16,
            gap: 12,
            overflow: 'hidden',
          },
        ]}
      >
        <View
          style={{
            height: 160,
            borderRadius: R.md,
            overflow: 'hidden',
          }}
        >
          <Image
            source={{ uri: LISTINGS[0].photo }}
            style={{ width: '100%', height: 160 }}
            contentFit="cover"
          />
        </View>
        <Text style={[t('caption'), { color: C.n500 }]}>Title</Text>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 15,
            color: C.ink,
            lineHeight: 18,
          }}
        >
          Vélo Peugeot années 80
        </Text>
        <Text style={[t('caption'), { color: C.n500 }]}>Price</Text>
        <Text style={[t('h3'), { color: C.ink }]}>€120</Text>
        <View style={{ flex: 1 }} />
        <View
          style={{
            height: 36,
            borderRadius: R.full,
            backgroundColor: C.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFF', fontFamily: 'InstrumentSans-SemiBold', fontSize: 13 }}>
            Publish
          </Text>
        </View>
      </View>
    </View>
  );
}

// Slide 3 — Avatars + chat bubbles representing community
export function CommunityIllustration() {
  const C = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: C.accentSoft, position: 'relative' }}>
      <View style={{ position: 'absolute', top: '20%', left: '15%' }}>
        <MSAvatar name="Marie" size={64} />
        <View
          style={[
            Sh.subtle,
            {
              marginTop: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: C.surface,
              borderRadius: 14,
              borderTopLeftRadius: 4,
              maxWidth: 160,
            },
          ]}
        >
          <Text style={[t('bodySm'), { color: C.ink }]}>On se voit ce soir ?</Text>
        </View>
      </View>
      <View style={{ position: 'absolute', top: '30%', right: '12%' }}>
        <MSAvatar name="Karim" size={48} verified />
      </View>
      <View style={{ position: 'absolute', bottom: '20%', left: '30%' }}>
        <MSAvatar name="Léa" size={56} status="online" />
      </View>
      <View style={{ position: 'absolute', bottom: '28%', right: '20%', alignItems: 'flex-end' }}>
        <View
          style={[
            Sh.subtle,
            {
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: C.primary,
              borderRadius: 14,
              borderTopRightRadius: 4,
            },
          ]}
        >
          <Text style={[t('bodySm'), { color: '#FFF' }]}>Parfait, à 18h ✌️</Text>
        </View>
        <View style={{ marginTop: 8 }}>
          <MSAvatar name="Tom" size={48} />
        </View>
      </View>
    </View>
  );
}
