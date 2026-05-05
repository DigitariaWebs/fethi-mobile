import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { EmptyState, Icon, MSButton, PageHeader } from '@/components';
import { usePayments } from '@/lib/payments';
import { useToast } from '@/lib/toast';
import { confirm } from '@/lib/confirm';

export default function BankAccounts() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const banks = usePayments((s) => s.banks);
  const removeBank = usePayments((s) => s.removeBank);
  const setDefaultBank = usePayments((s) => s.setDefaultBank);
  const toast = useToast();

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Comptes bancaires" />
      {banks.length === 0 ? (
        <EmptyState
          title="Aucun compte bancaire enregistré."
          description="Ajoute un IBAN pour recevoir tes versements."
          cta={{
            label: 'Ajouter un IBAN',
            onPress: () => router.push('/payouts/bank/add' as any),
            icon: <Icon.Plus size={18} color="#FFF" />,
          }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ gap: 10 }}>
            {banks.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => {
                  if (b.isDefault) return;
                  setDefaultBank(b.id);
                  toast.success('Compte par défaut mis à jour.');
                }}
                onLongPress={async () => {
                  if (
                    await confirm({
                      title: 'Supprimer ce compte ?',
                      message: `${b.iban.slice(-7)} sera retiré de ton compte.`,
                      tone: 'destructive',
                      confirmLabel: 'Supprimer',
                    })
                  ) {
                    removeBank(b.id);
                    toast.success('Compte supprimé.');
                  }
                }}
                style={[
                  Sh.subtle,
                  {
                    padding: 16,
                    backgroundColor: C.surface,
                    borderRadius: R.lg,
                    borderWidth: b.isDefault ? 2 : 1,
                    borderColor: b.isDefault ? C.ink : C.divider,
                  },
                ]}
              >
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
                  {b.holder}
                </Text>
                <Text style={[t('bodySm'), { color: C.n600, marginTop: 4 }]}>
                  {b.iban}
                </Text>
                {b.bicHint ? (
                  <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>BIC: {b.bicHint}</Text>
                ) : null}
                {b.isDefault ? (
                  <View
                    style={{
                      marginTop: 8,
                      alignSelf: 'flex-start',
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
          onPress={() => router.push('/payouts/bank/add' as any)}
        >
          Ajouter un IBAN
        </MSButton>
      </View>
    </View>
  );
}
