import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useColors, t } from '@/theme';
import { PageHeader } from '@/components';
import { SettingsGroup, SettingsRow } from '@/components/settings/SettingsRow';
import { useSession } from '@/lib/session';
import { confirm } from '@/lib/confirm';

export default function SettingsHub() {
  const C = useColors();
  const router = useRouter();
  const reset = useSession((s) => s.reset);
  const replayTutorial = useSession((s) => s.replayTutorial);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Paramètres" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <SettingsGroup title="Compte">
          <SettingsRow kind="link" label="Mon compte" hint="E-mail, téléphone, mot de passe" onPress={() => router.push('/settings/account' as any)} />
          <SettingsRow kind="link" label="Vérification" hint="Pièce d'identité, adresse" onPress={() => router.push('/kyc' as any)} />
          <SettingsRow kind="link" label="Langue" hint="Anglais (FR à venir)" onPress={() => router.push('/settings/preferences' as any)} last />
        </SettingsGroup>

        <SettingsGroup title="Argent">
          <SettingsRow kind="link" label="Moyens de paiement" onPress={() => router.push('/payment/methods' as any)} />
          <SettingsRow kind="link" label="Revenus et versements" onPress={() => router.push('/payouts' as any)} />
          <SettingsRow kind="link" label="Commandes" onPress={() => router.push('/orders' as any)} last />
        </SettingsGroup>

        <SettingsGroup title="Mes contenus">
          <SettingsRow kind="link" label="Mes favoris" hint="Annonces sauvegardées" onPress={() => router.push('/favorites' as any)} />
          <SettingsRow kind="link" label="Recherches sauvegardées" hint="Filtres + alertes" onPress={() => router.push('/saved-searches' as any)} />
          <SettingsRow kind="link" label="Mes annonces" onPress={() => router.push('/my-listings' as any)} last />
        </SettingsGroup>

        <SettingsGroup title="Préférences">
          <SettingsRow kind="link" label="Notifications" onPress={() => router.push('/settings/notifications' as any)} />
          <SettingsRow kind="link" label="Apparence" hint="Mode sombre, taille du texte" onPress={() => router.push('/settings/appearance' as any)} />
          <SettingsRow kind="link" label="Confidentialité et sécurité" onPress={() => router.push('/settings/privacy' as any)} />
          <SettingsRow kind="link" label="Utilisateurs bloqués" onPress={() => router.push('/settings/blocked' as any)} />
          <SettingsRow kind="link" label="Préférences de recherche" onPress={() => router.push('/settings/preferences' as any)} last />
        </SettingsGroup>

        <SettingsGroup title="Aide et infos">
          <SettingsRow kind="link" label="Centre d'aide" onPress={() => router.push('/settings/help' as any)} />
          <SettingsRow kind="link" label="Centre de sécurité" onPress={() => router.push('/safety' as any)} />
          <SettingsRow
            kind="link"
            label="Rejouer le tutoriel"
            hint="Revoir la visite guidée de l'application."
            onPress={async () => {
              await replayTutorial();
              router.replace('/(tabs)/map' as any);
            }}
          />
          <SettingsRow kind="link" label="À propos" onPress={() => router.push('/settings/about' as any)} last />
        </SettingsGroup>

        <SettingsGroup title="QA / Démo">
          <SettingsRow
            kind="link"
            label="Scénarios"
            hint="Scripts de démo qui parcourent chaque flux de l'application."
            onPress={() => router.push('/scenarios' as any)}
            last
          />
        </SettingsGroup>

        <SettingsGroup>
          <Pressable
            onPress={async () => {
              if (await confirm({ title: 'Se déconnecter ?', tone: 'destructive', confirmLabel: 'Se déconnecter' })) {
                await reset();
                router.replace('/welcome' as any);
              }
            }}
            style={{ paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 15,
                color: C.danger,
              }}
            >
              Se déconnecter
            </Text>
          </Pressable>
        </SettingsGroup>

        <Text style={[t('caption'), { color: C.n400, textAlign: 'center', marginTop: 22 }]}>
          MyStreet · v0.1.0
        </Text>
      </ScrollView>
    </View>
  );
}
