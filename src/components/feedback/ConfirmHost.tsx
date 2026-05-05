import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { MSButton } from '@/components';
import { useConfirmStore } from '@/lib/confirm';

// Confirmation prompt host. Mounted once at the root; renders the active
// prompt as a centered card with backdrop. Tapping the backdrop or the
// cancel button rejects with `false`; the confirm button resolves `true`.
export function ConfirmHost() {
  const C = useColors();
  const active = useConfirmStore((s) => s.active);
  const resolveActive = useConfirmStore((s) => s.resolveActive);
  const insets = useSafeAreaInsets();

  if (!active) return null;
  const destructive = active.tone === 'destructive';

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => resolveActive(false)}
      statusBarTranslucent
    >
      <Pressable
        onPress={() => resolveActive(false)}
        style={{
          flex: 1,
          backgroundColor: 'rgba(31,36,33,0.55)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {/* Stop propagation so taps inside the card don't dismiss. */}
        <Pressable
          onPress={() => {}}
          style={[
            Sh.strong,
            {
              width: '100%',
              maxWidth: 360,
              borderRadius: R.xl,
              backgroundColor: C.surface,
              padding: 22,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 18,
              color: C.ink,
              letterSpacing: -0.2,
            }}
          >
            {active.title}
          </Text>
          {active.message ? (
            <Text style={[t('body'), { color: C.n600, marginTop: 8, lineHeight: 22 }]}>
              {active.message}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
            <View style={{ flex: 1 }}>
              <MSButton
                variant="secondary"
                size="md"
                fullWidth
                onPress={() => resolveActive(false)}
              >
                {active.cancelLabel ?? 'Cancel'}
              </MSButton>
            </View>
            <View style={{ flex: 1 }}>
              <MSButton
                variant={destructive ? 'destructive' : 'primary'}
                size="md"
                fullWidth
                onPress={() => resolveActive(true)}
              >
                {active.confirmLabel ?? (destructive ? 'Delete' : 'Confirm')}
              </MSButton>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
