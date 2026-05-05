import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useColors, radius as R, type Palette } from '@/theme';

type Tone = 'neutral' | 'primary' | 'success' | 'warning';
type Size = 'sm' | 'md';

type Props = {
  children: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  size?: Size;
  tone?: Tone;
};

function buildTones(C: Palette) {
  // `ink` flips with theme (dark ink in light, cream ink in dark), so its
  // pair color is `paper` (the inverse). That gives high-contrast
  // selected pills in both modes — dark-on-cream / cream-on-dark.
  return {
    neutral: { bg: C.surface,      fg: C.ink,        border: C.n200,        selBg: C.ink,     selFg: C.paper },
    primary: { bg: C.primarySoft,  fg: C.primaryInk, border: 'transparent', selBg: C.primary, selFg: '#FFFFFF' },
    success: { bg: C.successSoft,  fg: C.success,    border: 'transparent', selBg: C.success, selFg: '#FFFFFF' },
    warning: { bg: C.warningSoft,  fg: C.warning,    border: 'transparent', selBg: C.warning, selFg: '#FFFFFF' },
  } as const;
}

const HEIGHTS = { sm: 28, md: 34 } as const;

export function MSPill({
  children,
  selected = false,
  onPress,
  icon,
  size = 'md',
  tone = 'neutral',
}: Props) {
  const C = useColors();
  const tn = buildTones(C)[tone];
  const bg = selected ? tn.selBg : tn.bg;
  const fg = selected ? tn.selFg : tn.fg;
  const borderColor = selected ? 'transparent' : tn.border;

  return (
    <Pressable
      onPress={onPress}
      style={{
        height: HEIGHTS[size],
        paddingHorizontal: size === 'sm' ? 12 : 14,
        backgroundColor: bg,
        borderRadius: R.full,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor,
      }}
    >
      {icon && <View>{icon}</View>}
      <Text
        style={{
          fontFamily: 'InstrumentSans-Medium',
          fontSize: size === 'sm' ? 12 : 13,
          color: fg,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
