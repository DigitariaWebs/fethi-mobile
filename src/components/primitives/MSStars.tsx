import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors, t } from '@/theme';

type Props = {
  value?: number;
  count?: number;
  size?: number;
  showValue?: boolean;
  starColor?: string;
};

const STAR_PATH = 'M8 1.5 L10 6 L14.5 6.5 L11.2 9.7 L12.1 14.2 L8 12 L3.9 14.2 L4.8 9.7 L1.5 6.5 L6 6 Z';

export function MSStars({
  value = 4.8,
  count,
  size = 14,
  showValue = true,
  starColor = '#D9A21B',
}: Props) {
  const C = useColors();
  const stars = Array.from({ length: 5 }, (_, i) => {
    const C = useColors();
    const fill = Math.max(0, Math.min(1, value - i));
    return (
      <View key={i} style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size} viewBox="0 0 16 16" style={{ position: 'absolute' }}>
          <Path d={STAR_PATH} fill={C.n200} />
        </Svg>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size * fill,
            height: size,
            overflow: 'hidden',
          }}
        >
          <Svg width={size} height={size} viewBox="0 0 16 16">
            <Path d={STAR_PATH} fill={starColor} />
          </Svg>
        </View>
      </View>
    );
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 1 }}>{stars}</View>
      {showValue && (
        <Text style={[t('bodySm'), { color: C.n700, fontFamily: 'InstrumentSans-SemiBold' }]}>
          {value.toFixed(1)}
          {count != null && (
            <Text style={{ color: C.n500, fontFamily: 'InstrumentSans' }}> · {count}</Text>
          )}
        </Text>
      )}
    </View>
  );
}
