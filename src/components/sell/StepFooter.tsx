import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, useIsDark, t } from '@/theme';
import { MSButton } from '@/components';

type Props = {
  ctaLabel?: string;
  ctaDisabled?: boolean;
  secondaryLabel?: string;
  onCta?: () => void;
  onSecondary?: () => void;
};

export function StepFooter({
  ctaLabel = 'Continuer',
  ctaDisabled = false,
  secondaryLabel,
  onCta,
  onSecondary,
}: Props) {
  const C = useColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 18 + insets.bottom,
        backgroundColor: isDark ? "rgba(24,21,18,0.95)" : "rgba(251,248,244,0.95)",
        borderTopWidth: 1,
        borderTopColor: C.divider,
      }}
    >
      <MSButton
        size="lg"
        fullWidth
        state={ctaDisabled ? 'disabled' : 'default'}
        onPress={onCta}
      >
        {ctaLabel}
      </MSButton>
      {secondaryLabel && (
        <Pressable onPress={onSecondary} style={{ alignItems: 'center', marginTop: 10 }}>
          <Text
            style={[
              t('bodySm'),
              { color: C.n600, fontFamily: 'InstrumentSans-Medium', paddingVertical: 6 },
            ]}
          >
            {secondaryLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
