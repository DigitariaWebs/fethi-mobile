import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useColors, t } from '@/theme';
import { MSButton } from '@/components';

type Props = {
  // Optional illustration / icon slot. Sized 96x96 by convention.
  illustration?: ReactNode;
  title: string;
  description?: string;
  // Primary CTA. Omit when the empty state is purely informational.
  cta?: { label: string; onPress: () => void; icon?: ReactNode };
  // Secondary muted action under the CTA.
  secondary?: { label: string; onPress: () => void };
};

// Reusable empty-list / empty-section state. Centered column with
// illustration / title / description / optional CTA. Use this anywhere a
// list might render no rows so the screen never feels broken.
export function EmptyState({ illustration, title, description, cta, secondary }: Props) {
  const C = useColors();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
      }}
    >
      {illustration ? (
        <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          {illustration}
        </View>
      ) : null}
      <Text
        style={{
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 20,
          color: C.ink,
          textAlign: 'center',
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text
          style={[
            t('body'),
            {
              color: C.n600,
              textAlign: 'center',
              marginTop: 8,
              maxWidth: 320,
              lineHeight: 22,
            },
          ]}
        >
          {description}
        </Text>
      ) : null}
      {cta ? (
        <View style={{ marginTop: 22 }}>
          <MSButton size="lg" icon={cta.icon} onPress={cta.onPress}>
            {cta.label}
          </MSButton>
        </View>
      ) : null}
      {secondary ? (
        <Text
          onPress={secondary.onPress}
          style={[
            t('bodySm'),
            {
              color: C.n500,
              fontFamily: 'InstrumentSans-Medium',
              marginTop: 12,
              textDecorationLine: 'underline',
            },
          ]}
        >
          {secondary.label}
        </Text>
      ) : null}
    </View>
  );
}
