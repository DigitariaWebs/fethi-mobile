import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useColors } from '@/theme';
import { PageHeader } from '@/components';
import { SettingsGroup, SettingsRow } from '@/components/settings/SettingsRow';
import { useSession } from '@/lib/session';
import { confirm } from '@/lib/confirm';

export default function Account() {
  const C = useColors();
  const router = useRouter();
  const session = useSession();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Mon compte" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <SettingsGroup title="Connexion">
          <SettingsRow kind="value" label="E-mail" value="fadiprogix@gmail.com" onPress={() => router.push('/settings/account/email' as any)} />
          <SettingsRow kind="value" label="Téléphone" value="+33 6 ••• 12" onPress={() => router.push('/settings/account/phone' as any)} />
          <SettingsRow kind="link" label="Mot de passe" onPress={() => router.push('/settings/account/password' as any)} last />
        </SettingsGroup>
        <SettingsGroup title="Région">
          <SettingsRow kind="value" label="Langue" value="Anglais" onPress={() => router.push('/settings/preferences' as any)} />
          <SettingsRow kind="value" label="Région" value={session.address || 'Lille'} last />
        </SettingsGroup>
        <SettingsGroup>
          <SettingsRow
            kind="link"
            label="Supprimer le compte"
            tint={C.danger}
            onPress={async () => {
              if (
                await confirm({
                  title: 'Supprimer ton compte ?',
                  message: "C'est définitif — tes annonces, messages et commandes seront effacés. Nous pouvons t'envoyer une copie de tes données par e-mail avant.",
                  tone: 'destructive',
                  confirmLabel: 'Continuer',
                })
              ) {
                router.push('/settings/account/delete' as any);
              }
            }}
            last
          />
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}
