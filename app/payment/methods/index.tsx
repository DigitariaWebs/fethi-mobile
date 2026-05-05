import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { EmptyState, Icon, MSButton, PageHeader } from '@/components';
import { CardBrandGlyph } from '@/components/payments/CardBrandGlyph';
import { usePayments } from '@/lib/payments';
import { useToast } from '@/lib/toast';
import { confirm } from '@/lib/confirm';

export default function PaymentMethods() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cards = usePayments((s) => s.cards);
  const removeCard = usePayments((s) => s.removeCard);
  const setDefaultCard = usePayments((s) => s.setDefaultCard);
  const toast = useToast();

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Moyens de paiement" />
      {cards.length === 0 ? (
        <EmptyState
          title="Aucun moyen de paiement."
          description="Ajoute une carte pour payer plus rapidement et recevoir tes versements."
          cta={{
            label: 'Ajouter une carte',
            onPress: () => router.push('/payment/methods/add' as any),
            icon: <Icon.Plus size={18} color="#FFF" />,
          }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 + insets.bottom }}>
          <View style={{ gap: 10 }}>
            {cards.map((c) => (
              <Pressable
                key={c.id}
                onLongPress={async () => {
                  if (
                    await confirm({
                      title: 'Supprimer cette carte ?',
                      message: `${c.brand.toUpperCase()} terminant par ${c.last4} sera retirée de ton compte.`,
                      tone: 'destructive',
                      confirmLabel: 'Supprimer',
                    })
                  ) {
                    removeCard(c.id);
                    toast.success('Carte supprimée.');
                  }
                }}
                onPress={() => {
                  if (c.isDefault) return;
                  setDefaultCard(c.id);
                  toast.success('Carte par défaut mise à jour.');
                }}
                style={[
                  Sh.subtle,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    backgroundColor: C.surface,
                    borderRadius: R.lg,
                    borderWidth: c.isDefault ? 2 : 1,
                    borderColor: c.isDefault ? C.ink : C.divider,
                  },
                ]}
              >
                <CardBrandGlyph brand={c.brand} size="md" />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
                    {`${c.brand[0].toUpperCase() + c.brand.slice(1)} •••• ${c.last4}`}
                  </Text>
                  <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
                    {`Expire ${String(c.expMonth).padStart(2, '0')}/${String(c.expYear).slice(-2)}`}
                    {c.nickname ? ` · ${c.nickname}` : ''}
                  </Text>
                </View>
                {c.isDefault ? (
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 999,
                      backgroundColor: C.n100,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontFamily: 'InstrumentSans-Bold', color: C.n600, letterSpacing: 0.4 }}>
                      PAR DÉFAUT
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
          <Text style={[t('caption'), { color: C.n500, marginTop: 12, textAlign: 'center' }]}>
            Appuie pour la définir par défaut. Reste appuyé pour la supprimer.
          </Text>
        </ScrollView>
      )}
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
          icon={<Icon.Plus size={18} color="#FFF" />}
          onPress={() => router.push('/payment/methods/add' as any)}
        >
          Ajouter une carte
        </MSButton>
      </View>
    </View>
  );
}
