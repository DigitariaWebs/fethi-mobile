import { View, Text } from 'react-native';
import { useColors } from '@/theme';
import { MSLogo } from './MSLogo';

type Props = { size?: number; color?: string };

export function MSWordmark({ size = 28, color }: Props) {
  const C = useColors();
  const textColor = color ?? C.ink;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <MSLogo size={size} />
      <Text
        style={{
          fontFamily: 'InstrumentSerif-Italic',
          fontSize: size * 1.05,
          color: textColor,
          letterSpacing: -size * 0.02,
          lineHeight: size * 1.05,
          fontWeight: '400',
        }}
      >
        MyStreet
      </Text>
    </View>
  );
}
