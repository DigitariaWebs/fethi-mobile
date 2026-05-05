import { useEffect } from 'react';
import { type DimensionValue, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useColors, radius as R } from '@/theme';

// Generic shimmer block. Reanimated drives an opacity loop so all
// skeletons in a tree pulse in sync (no per-component clocks).
//
// Compose into per-content patterns: SkeletonLine for text rows,
// SkeletonAvatar for user thumbs, SkeletonListingCard / SkeletonRow for
// list views.
type BlockProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width, height = 14, radius = 6, style }: BlockProps) {
  const C = useColors();
  const opacity = useSharedValue(0.55);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: C.n100,
        },
        animated,
        style,
      ]}
    />
  );
}

export function SkeletonLine({
  width = '100%',
  height = 12,
}: {
  width?: DimensionValue;
  height?: number;
}) {
  return <Skeleton width={width} height={height} radius={6} />;
}

export function SkeletonAvatar({ size = 48 }: { size?: number }) {
  return <Skeleton width={size} height={size} radius={size / 2} />;
}

// A listing card skeleton — matches the shape of `MSListingCard` so it
// drops in cleanly while a feed is loading.
export function SkeletonListingCard() {
  const C = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
        padding: 10,
        backgroundColor: C.surface,
        borderRadius: R.lg,
        borderWidth: 1,
        borderColor: C.divider,
      }}
    >
      <Skeleton width={80} height={80} radius={R.md} />
      <View style={{ flex: 1, justifyContent: 'space-around', paddingVertical: 4 }}>
        <SkeletonLine width="50%" height={10} />
        <SkeletonLine width="80%" height={14} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <SkeletonLine width={60} height={16} />
          <SkeletonLine width={70} height={10} />
        </View>
      </View>
    </View>
  );
}

// Generic horizontal row used in inboxes / lists.
export function SkeletonRow() {
  const C = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: C.divider,
      }}
    >
      <SkeletonAvatar size={48} />
      <View style={{ flex: 1, justifyContent: 'space-around', paddingVertical: 2 }}>
        <SkeletonLine width="50%" height={12} />
        <SkeletonLine width="80%" height={11} />
        <SkeletonLine width="60%" height={11} />
      </View>
    </View>
  );
}

// Profile header skeleton — avatar + name + stat row.
export function SkeletonProfileHeader() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 24, gap: 10 }}>
      <SkeletonAvatar size={84} />
      <SkeletonLine width={140} height={16} />
      <SkeletonLine width={200} height={11} />
      <View style={{ flexDirection: 'row', gap: 18, marginTop: 6 }}>
        <SkeletonLine width={50} height={12} />
        <SkeletonLine width={50} height={12} />
        <SkeletonLine width={50} height={12} />
      </View>
    </View>
  );
}
