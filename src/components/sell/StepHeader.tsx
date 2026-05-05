import { Pressable, Text, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, t } from '@/theme';
import { Icon } from '@/components';
import { useSellDraft } from '@/lib/sellDraft';

type Props = {
  step: number;
  total?: number;
  showBack?: boolean;
  rightLabel?: string | null;
  onClose?: () => void;
};

export function StepHeader({
  step,
  total = 6,
  showBack = true,
  rightLabel = 'Enregistrer et quitter',
  onClose,
}: Props) {
  const C = useColors();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const saveAndExit = useSellDraft((s) => s.saveAndExit);

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: C.paper,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={() => (showBack ? router.back() : (onClose ?? router.back)())}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {showBack ? (
            <Icon.Chevron size={18} dir="left" color={C.ink} />
          ) : (
            <Icon.Close size={18} color={C.ink} />
          )}
        </Pressable>
        <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i < step ? C.ink : C.n200,
              }}
            />
          ))}
        </View>
        {rightLabel ? (
          <Pressable
            onPress={async () => {
              // Persist the draft so the map's "Resume draft" pill can
              // pick it up, then jump straight to the map. dismissTo
              // crosses navigator boundaries (collapses the inner sell
              // Stack AND the outer /sell modal in one shot).
              await saveAndExit(pathname);
              router.dismissTo('/(tabs)/map');
            }}
            hitSlop={8}
            style={{ paddingHorizontal: 8, paddingVertical: 6 }}
          >
            <Text
              style={[
                t('bodySm'),
                { color: C.n600, fontFamily: 'InstrumentSans-Medium' },
              ]}
            >
              {rightLabel}
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 8 }} />
        )}
      </View>
      <Text
        style={[
          t('caption'),
          {
            color: C.n500,
            paddingHorizontal: 8,
            paddingTop: 12,
            fontFamily: 'InstrumentSans-Medium',
          },
        ]}
      >
        Étape {step} sur {total}
      </Text>
    </View>
  );
}
