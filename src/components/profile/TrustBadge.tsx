import { Text, View } from 'react-native';
import Svg, {
  Polyline,
  Path,
  Circle,
} from 'react-native-svg';

import { useColors, useIsDark, radius as R } from '@/theme';

type Icon = 'check' | 'phone' | 'email' | 'address';

export function TrustBadge({ icon, label }: { icon: Icon; label: string }) {
  const C = useColors();
  const isDark = useIsDark();
  // The chip's background flips with theme via `accentSoft`; the foreground
  // (icon stroke + label) needs to flip too — the static deep teal vanishes
  // on the dark accentSoft surface.
  const fg = isDark ? C.n800 : '#1F4F44';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingLeft: 7,
        paddingRight: 9,
        paddingVertical: 4,
        borderRadius: R.full,
        backgroundColor: C.accentSoft,
      }}
    >
      <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
        {icon === 'check' && (
          <Polyline
            points="20 6 9 17 4 12"
            stroke={fg}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {icon === 'phone' && (
          <Path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            stroke={fg}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        )}
        {icon === 'email' && (
          <>
            <Path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke={fg}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            <Polyline
              points="22 6 12 13 2 6"
              stroke={fg}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          </>
        )}
        {icon === 'address' && (
          <>
            <Path
              d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
              stroke={fg}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            <Circle cx={12} cy={10} r={3} stroke={fg} strokeWidth={2.5} />
          </>
        )}
      </Svg>
      <Text
        style={{
          color: fg,
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 11,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
