import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '@/theme';

type Props = {
  src?: string;
  name?: string;
  size?: number;
  status?: 'online' | 'offline';
  verified?: boolean;
  ring?: boolean;
};

export function MSAvatar({
  src,
  name = 'M',
  size = 40,
  status,
  verified = false,
  ring = false,
}: Props) {
  const C = useColors();
  // Brand-leaning palette used for the deterministic per-name initial tint.
  const tints = [C.primary, C.accent, '#A8632B', '#7B6A3F', '#5E5247'];
  const initial = name[0]?.toUpperCase() || '?';
  const tint = tints[name.charCodeAt(0) % tints.length];

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: src ? C.n100 : tint,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          ...(ring && {
            borderWidth: 2,
            borderColor: C.surface,
            shadowColor: C.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 4,
          }),
        }}
      >
        {src ? (
          <Image source={{ uri: src }} style={{ width: size, height: size }} contentFit="cover" />
        ) : (
          <Text
            style={{
              color: '#FFF',
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: size * 0.42,
            }}
          >
            {initial}
          </Text>
        )}
      </View>
      {status && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: (size * 0.28) / 2,
            backgroundColor: status === 'online' ? C.success : C.n400,
            borderWidth: 2,
            borderColor: C.surface,
          }}
        />
      )}
      {verified && (
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: (size * 0.4) / 2,
            backgroundColor: C.primary,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: C.surface,
          }}
        >
          <Svg width={size * 0.22} height={size * 0.22} viewBox="0 0 12 12" fill="none">
            <Path
              d="M2.5 6 L5 8.5 L9.5 3.5"
              stroke="#FFF"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )}
    </View>
  );
}
