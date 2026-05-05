import { View } from 'react-native';
import { useColors } from '@/theme';

type Props = { x: number; y: number; radius?: number };

// User-location indicator with the dashed search-radius ring around it.
// Matches the design preview: terracotta ring tint with a centred dot.
export function UserDot({ x, y, radius = 90 }: Props) {
  const C = useColors();
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          backgroundColor: 'rgba(200,85,61,0.08)',
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: 'rgba(200,85,61,0.35)',
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: C.primary,
          borderWidth: 3,
          borderColor: '#FFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 4,
        }}
      />
    </View>
  );
}
