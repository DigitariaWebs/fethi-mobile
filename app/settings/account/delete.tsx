import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';
import { useSession } from '@/lib/session';

export default function DeleteAccount() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const reset = useSession((s) => s.reset);
  const [acks, setAcks] = useState({ erase: false, irreversible: false, listings: false });
  const ready = acks.erase && acks.irreversible && acks.listings;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Supprimer le compte" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[t('body'), { color: C.n600, marginBottom: 18, lineHeight: 22 }]}>
          Nous pouvons t'envoyer une copie de tes données par e-mail. Une fois supprimé, c'est définitif.
        </Text>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            paddingVertical: 6,
            marginBottom: 20,
          }}
        >
          {[
            { id: 'erase', label: 'Mes annonces, messages et commandes seront effacés définitivement.' },
            { id: 'irreversible', label: "Je comprends que c'est irréversible." },
            { id: 'listings', label: 'Mes ventes en cours sont réglées — aucun montant n\'est retenu.' },
          ].map((it) => (
            <Pressable
              key={it.id}
              onPress={() => setAcks((s) => ({ ...s, [it.id]: !s[it.id as keyof typeof s] }))}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 14, paddingVertical: 12 }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: acks[it.id as keyof typeof acks] ? C.danger : C.n300,
                  backgroundColor: acks[it.id as keyof typeof acks] ? C.danger : 'transparent',
                  marginTop: 1,
                }}
              />
              <Text style={[t('bodySm'), { color: C.ink, flex: 1, lineHeight: 19 }]}>{it.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => toast.info('Export demandé — envoyé sous 24 h.')}
          style={{
            paddingVertical: 14,
            backgroundColor: C.n50,
            borderRadius: R.md,
            borderWidth: 1,
            borderColor: C.n200,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: 'InstrumentSans-Medium', fontSize: 14, color: C.ink }}>
            Envoie-moi une copie de mes données
          </Text>
        </Pressable>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 + insets.bottom, backgroundColor: C.paper, borderTopWidth: 1, borderTopColor: C.divider }}>
        <MSButton
          size="lg"
          fullWidth
          variant="destructive"
          state={ready ? undefined : 'disabled'}
          onPress={async () => {
            await reset();
            toast.success('Compte supprimé.');
            router.replace('/welcome' as any);
          }}
        >
          Supprimer le compte
        </MSButton>
      </View>
    </View>
  );
}
