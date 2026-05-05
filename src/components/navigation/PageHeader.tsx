import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { useColors, t } from '@/theme';
import { Icon } from '@/components';

// Standard top bar for stack screens. Back chevron on the left, title in
// the middle, optional trailing slot on the right. If `closeMode` is set,
// the leading affordance becomes an X (used by modal entry screens).
type Props = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  closeMode?: boolean;
  onBack?: () => void;
};

export function PageHeader({ title, subtitle, trailing, closeMode, onBack }: Props) {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: C.divider,
        backgroundColor: C.paper,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Pressable
        onPress={() => (onBack ? onBack() : router.back())}
        hitSlop={10}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.divider,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {closeMode ? (
          <Icon.Close size={18} color={C.ink} />
        ) : (
          <Icon.Chevron size={16} dir="left" color={C.ink} />
        )}
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 18,
            color: C.ink,
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[t('caption'), { color: C.n500 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? <View style={{ width: 36 }} />}
    </View>
  );
}
