import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useOrders, formatEuros } from '@/lib/orders';
import { useToast } from '@/lib/toast';
import { confirm } from '@/lib/confirm';

const ITEMS = [
  { id: 'returned', label: 'L\'objet a été rendu dans le même état.' },
  { id: 'no-damage', label: 'Il n\'y a aucun nouveau dégât.' },
  { id: 'all-parts', label: 'Tous les accessoires sont présents.' },
];

export default function ReleaseDeposit() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const release = useOrders((s) => s.releaseDeposit);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allChecked = ITEMS.every((it) => checked[it.id]);

  if (!order || !order.depositCents) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <PageHeader title="Caution" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Rendre la caution" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[t('body'), { color: C.n600, marginBottom: 18, lineHeight: 22 }]}>
          Confirme que l'objet revient dans le même état qu'au départ. Une fois libérée, Stripe rend la caution au loueur.
        </Text>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            paddingVertical: 6,
          }}
        >
          {ITEMS.map((it) => (
            <Pressable
              key={it.id}
              onPress={() => setChecked((s) => ({ ...s, [it.id]: !s[it.id] }))}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: checked[it.id] ? C.ink : C.n300,
                  backgroundColor: checked[it.id] ? C.ink : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {checked[it.id] ? (
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path d="M5 12 L 10 17 L 19 7" stroke="#FFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                ) : null}
              </View>
              <Text style={[t('bodySm'), { color: C.ink, flex: 1, lineHeight: 20 }]}>{it.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 16 + insets.bottom,
          backgroundColor: C.paper,
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <MSButton
          size="lg"
          fullWidth
          state={allChecked ? undefined : 'disabled'}
          onPress={async () => {
            if (
              await confirm({
                title: 'Rendre la caution ?',
                message: `${formatEuros(order.depositCents!)} sera remboursé au loueur immédiatement.`,
                confirmLabel: 'Rendre',
              })
            ) {
              release(order.id);
              toast.success('Caution rendue.');
              router.back();
            }
          }}
        >
          {`Rendre ${formatEuros(order.depositCents!)}`}
        </MSButton>
      </View>
    </View>
  );
}
