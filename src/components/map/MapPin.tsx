import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { MSMapPin, type PinKind, type PinVariant } from './MSMapPin';
import type { MapCamera } from './MapHost';

// A single map pin whose screen-space transform is driven by the live map
// camera on the UI thread. Storing the camera in a Reanimated shared value
// avoids a React reconciliation per camera tick — `useAnimatedStyle` reads
// the value directly inside a worklet and applies the new transform in the
// same frame that the native map repaints, eliminating the 1-frame swim
// you get when projecting via React state.
type Props = {
  lat: number;
  lng: number;
  variant: PinVariant;
  label: string;
  thumb?: string;
  kind?: PinKind;
  cameraSv: SharedValue<MapCamera>;
  sizeSv: SharedValue<{ width: number; height: number }>;
  onPress: () => void;
  zIndex?: number;
};

export function MapPin({
  lat,
  lng,
  variant,
  label,
  thumb,
  kind,
  cameraSv,
  sizeSv,
  onPress,
  zIndex = 10,
}: Props) {
  const animatedStyle = useAnimatedStyle(() => {
    const c = cameraSv.value;
    const s = sizeSv.value;
    if (!s.width || !s.height || !c.latitudeDelta || !c.longitudeDelta) {
      return { opacity: 0, transform: [{ translateX: -9999 }, { translateY: 0 }] };
    }
    const x = ((lng - c.longitude) / c.longitudeDelta) * s.width + s.width / 2;
    const y = ((c.latitude - lat) / c.latitudeDelta) * s.height + s.height / 2;
    // Off-screen cull — push far off-axis so the row doesn't paint at all.
    if (x < -120 || x > s.width + 120 || y < -160 || y > s.height + 60) {
      return { opacity: 0, transform: [{ translateX: -9999 }, { translateY: 0 }] };
    }
    // Pins are anchored at their bubble's tip (translateX: -50, -100 to
    // line up the tail with the coordinate point).
    return {
      opacity: 1,
      transform: [{ translateX: x - 50 }, { translateY: y - 100 }],
    };
  });

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: 0, top: 0, zIndex },
        animatedStyle,
      ]}
    >
      <Pressable onPress={onPress}>
        <MSMapPin variant={variant} label={label} thumb={thumb} kind={kind} />
      </Pressable>
    </Animated.View>
  );
}
