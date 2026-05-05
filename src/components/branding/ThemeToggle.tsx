import { Pressable, View } from 'react-native';

import { useColors, useIsDark, useThemeStore } from '@/theme';
import { IconMoon, IconSun } from '../icons/Icon';

type Size = 'sm' | 'md';
const sizes: Record<Size, number> = { sm: 32, md: 40 };

type Props = {
  size?: Size;
  /** When `true`, render on a translucent surface (e.g. over the welcome video). */
  onDarkSurface?: boolean;
};

// Pill toggle that flips light ↔ dark. Mirrors web's ThemeToggle visually:
// glass-ish circle, sun/moon crossfade.
export function ThemeToggle({ size = 'md', onDarkSurface = false }: Props) {
  const C = useColors();
  const isDark = useIsDark();
  const toggle = useThemeStore((s) => s.toggle);
  const dim = sizes[size];

  const tint = onDarkSurface ? 'rgba(255,255,255,0.18)' : C.surface;
  const border = onDarkSurface ? 'rgba(255,255,255,0.28)' : C.divider;
  const iconColor = onDarkSurface ? '#FFFFFF' : C.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      onPress={() => void toggle()}
      style={({ pressed }) => ({
        width: dim,
        height: dim,
        borderRadius: dim / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tint,
        borderWidth: 1,
        borderColor: border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ position: 'absolute' }}>
        {isDark ? (
          <IconSun size={dim * 0.5} color={iconColor} />
        ) : (
          <IconMoon size={dim * 0.5} color={iconColor} />
        )}
      </View>
    </Pressable>
  );
}
