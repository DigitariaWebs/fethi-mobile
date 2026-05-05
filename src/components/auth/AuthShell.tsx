import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, useIsDark, t } from '@/theme';
import { Icon, MSButton } from '@/components';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  ctaLabel: string;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  onCta: () => void;
  footer?: ReactNode;
};

// Shared chrome for the email / phone / OTP screens — back button,
// title, optional subtitle, scrollable body, sticky CTA at bottom.
export function AuthShell({
  title,
  subtitle,
  children,
  ctaLabel,
  ctaDisabled,
  ctaLoading,
  onCta,
  footer,
}: Props) {
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Translucent paper for the sticky CTA bar so the body fades into it on
  // either theme. We can't apply opacity to a hex token cheanly in RN, so
  // hand-pick the rgba that matches each palette's `paper`.
  const ctaBarBg = isDark ? 'rgba(24,21,18,0.95)' : 'rgba(251,248,244,0.95)';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: C.paper }}
    >
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          paddingBottom: 16,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.n100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.Chevron size={18} dir="left" color={C.ink} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 32,
            lineHeight: 36,
            letterSpacing: -0.64,
            color: C.ink,
            marginTop: 24,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={[t('body'), { color: C.n600, marginTop: 12 }]}>{subtitle}</Text>
        )}
        <View style={{ marginTop: 32 }}>{children}</View>
        {footer && <View style={{ marginTop: 18 }}>{footer}</View>}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 24 + insets.bottom,
          backgroundColor: ctaBarBg,
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <MSButton
          size="lg"
          fullWidth
          state={ctaLoading ? 'loading' : ctaDisabled ? 'disabled' : 'default'}
          onPress={onCta}
        >
          {ctaLabel}
        </MSButton>
      </View>
    </KeyboardAvoidingView>
  );
}
