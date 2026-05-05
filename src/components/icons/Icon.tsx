import Svg, { Circle, Path, Rect, G } from 'react-native-svg';

type IconProps = { size?: number; color?: string };

export const IconSearch = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={2} />
    <Path d="M20 20 L16 16" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const IconFilter = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 6 H 20 M7 12 H 17 M10 18 H 14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconHeart = ({
  size = 18,
  color = '#000',
  filled = false,
}: IconProps & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path
      d="M12 21 C 6 16.5 3 13 3 8.5 C 3 6 5 4 7.5 4 C 9.5 4 11 5 12 6.5 C 13 5 14.5 4 16.5 4 C 19 4 21 6 21 8.5 C 21 13 18 16.5 12 21 Z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconPlus = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5 V 19 M5 12 H 19"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconMap = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 4 L3 6 L3 20 L9 18 L15 20 L21 18 L21 4 L15 6 Z M9 4 L9 18 M15 6 L15 20"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconUser = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} />
    <Path
      d="M4 21 C 4 16 8 14 12 14 C 16 14 20 16 20 21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconPin = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2 C 8 2 5 5 5 9 C 5 14 12 22 12 22 C 12 22 19 14 19 9 C 19 5 16 2 12 2 Z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={2} />
  </Svg>
);

export const IconCamera = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 8 L3 19 L21 19 L21 8 L17 8 L15 5 L9 5 L7 8 Z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={13} r={3.5} stroke={color} strokeWidth={2} />
  </Svg>
);

export const IconMail = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={5} width={18} height={14} rx={2} stroke={color} strokeWidth={2} strokeLinejoin="round" />
    <Path d="M3 7 L12 13 L21 7" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </Svg>
);

export const IconCheck = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12 L10 17 L19 7"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconChevron = ({
  size = 18,
  color = '#000',
  dir = 'right',
}: IconProps & { dir?: 'left' | 'right' | 'up' | 'down' }) => {
  const rot = { right: 0, left: 180, down: 90, up: -90 }[dir];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: [{ rotate: `${rot}deg` }] }}
    >
      <Path
        d="M9 5 L16 12 L9 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const IconClose = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 6 L18 18 M18 6 L6 18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconLocate = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
    <Path
      d="M12 2 V 5 M12 19 V 22 M22 12 H 19 M5 12 H 2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconUserPlus = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 21 V 19 C 16 16.8 14.2 15 12 15 H 6 C 3.8 15 2 16.8 2 19 V 21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={2} />
    <Path d="M22 11 H 16 M19 8 V 14" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const IconStar = ({
  size = 14,
  color = '#D9A21B',
  outline,
}: IconProps & { outline?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Path
      d="M8 1.5 L10 6 L14.5 6.5 L11.2 9.7 L12.1 14.2 L8 12 L3.9 14.2 L4.8 9.7 L1.5 6.5 L6 6 Z"
      fill={color}
      stroke={outline}
      strokeWidth={outline ? 0.5 : 0}
    />
  </Svg>
);

export const IconEye = ({ size = 12, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M1.5 8 C 3 4 5.5 2.5 8 2.5 C 10.5 2.5 13 4 14.5 8 C 13 12 10.5 13.5 8 13.5 C 5.5 13.5 3 12 1.5 8 Z"
      stroke={color}
      strokeWidth={1.5}
    />
    <Circle cx={8} cy={8} r={2.2} stroke={color} strokeWidth={1.5} />
  </Svg>
);

export const IconChat = ({ size = 12, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M2 4 L2 11 L5 11 L5 13.5 L8 11 L14 11 L14 4 Z" stroke={color} strokeWidth={1.5} />
  </Svg>
);

export const IconDots = ({ size = 16, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <G fill={color}>
      <Circle cx={3} cy={8} r={1.5} />
      <Circle cx={8} cy={8} r={1.5} />
      <Circle cx={13} cy={8} r={1.5} />
    </G>
  </Svg>
);

export const IconSun = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={2} />
    <Path
      d="M12 2 V 4 M12 20 V 22 M2 12 H 4 M20 12 H 22 M4.93 4.93 L 6.34 6.34 M17.66 17.66 L 19.07 19.07 M4.93 19.07 L 6.34 17.66 M17.66 6.34 L 19.07 4.93"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconMoon = ({ size = 18, color = '#000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.8 A 9 9 0 1 1 11.2 3 A 7 7 0 0 0 21 12.8 Z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

export const Icon = {
  Search: IconSearch,
  Filter: IconFilter,
  Heart: IconHeart,
  Plus: IconPlus,
  Map: IconMap,
  User: IconUser,
  Pin: IconPin,
  Camera: IconCamera,
  Mail: IconMail,
  Check: IconCheck,
  Chevron: IconChevron,
  Close: IconClose,
  Locate: IconLocate,
  UserPlus: IconUserPlus,
  Star: IconStar,
  Eye: IconEye,
  Chat: IconChat,
  Dots: IconDots,
  Sun: IconSun,
  Moon: IconMoon,
};
