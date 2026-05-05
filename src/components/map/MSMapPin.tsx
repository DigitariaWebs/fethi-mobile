import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Path } from 'react-native-svg';
import { useColors, useIsDark, radius as R, shadow as Sh } from '@/theme';
import { MSGlass } from '../surfaces/MSGlass';

export type PinVariant = 'default' | 'thumb' | 'selected' | 'cluster';
// Type marker overlaid on the bubble's leading edge so users can scan
// the map and immediately tell rentals/services from sale listings.
export type PinKind = 'sale' | 'rental' | 'service';

type Props = {
  variant?: PinVariant;
  label?: string;
  thumb?: string;
  kind?: PinKind;
};

export function MSMapPin({ variant = 'default', label = '€120', thumb, kind = 'sale' }: Props) {
  const C = useColors();
  const isDark = useIsDark();
  if (variant === 'cluster') {
    return (
      <View style={[Sh.pin, { width: 44, height: 44, borderRadius: 22 }]}>
        <MSGlass
          tone="cluster"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 14,
              color: C.paper,
            }}
          >
            {label}
          </Text>
        </MSGlass>
      </View>
    );
  }

  const selected = variant === 'selected';
  const hasThumb = variant === 'thumb' || selected;
  const tone = selected ? 'pinSelected' : 'pin';
  // Selected pin uses an inverted tone; plain pin uses the warm-paper glass.
  // Tail color/stroke must mirror the theme so it doesn't pop bright in dark.
  const fg = selected ? C.paper : C.ink;
  const tailColor = selected
    ? (isDark ? 'rgba(245,241,235,0.85)' : 'rgba(31,36,33,0.85)')
    : (isDark ? 'rgba(33,28,24,0.92)' : 'rgba(255,252,248,0.92)');
  const tailStroke = selected
    ? 'rgba(255,255,255,0.18)'
    : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.6)');

  return (
    <View style={[selected ? Sh.pinSelected : Sh.pin, { alignItems: 'center' }]}>
      <MSGlass
        tone={tone}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: hasThumb ? 6 : 0,
          paddingLeft: hasThumb ? 4 : 14,
          paddingRight: 12,
          paddingVertical: hasThumb ? 4 : 7,
          borderRadius: R.full,
        }}
      >
        {hasThumb && (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: selected ? C.surface : C.n100,
              overflow: 'hidden',
              backgroundColor: C.primarySoft,
            }}
          >
            {thumb && (
              <Image source={{ uri: thumb }} style={{ width: 21, height: 21 }} contentFit="cover" />
            )}
          </View>
        )}
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: selected ? 14 : 13,
            color: fg,
          }}
        >
          {label}
        </Text>
        {kind !== 'sale' ? (
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: kind === 'rental' ? '#2F6B5E' : C.warning,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 4,
            }}
          >
            {kind === 'rental' ? (
              <Svg width={9} height={9} viewBox="0 0 24 24" fill="none">
                <Circle cx={8} cy={8} r={4} stroke="#FFF" strokeWidth={2.4} />
                <Path d="M11 11 L20 20 M16 16 L18 14" stroke="#FFF" strokeWidth={2.4} strokeLinecap="round" />
              </Svg>
            ) : (
              <Svg width={9} height={9} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M14 6 a4 4 0 0 1 4 4 L20.5 12.5 L17 16 L14 13 a4 4 0 0 1 0-7 Z M14 13 L4 21 L3 20 L11 12"
                  stroke="#FFF"
                  strokeWidth={2.4}
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </View>
        ) : null}
      </MSGlass>
      {/* tail */}
      <Svg width={10} height={6} viewBox="0 0 10 6" style={{ marginTop: -0.5 }}>
        <Path
          d="M0 0 L5 6 L10 0 Z"
          fill={tailColor}
          stroke={tailStroke}
          strokeWidth={0.5}
        />
      </Svg>
    </View>
  );
}
