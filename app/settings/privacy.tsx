import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useColors } from '@/theme';
import { PageHeader } from '@/components';
import { SettingsGroup, SettingsRow } from '@/components/settings/SettingsRow';

export default function PrivacySettings() {
  const C = useColors();
  const [vis, setVis] = useState({ profile: true, lastName: false, exact: false });
  const [who, setWho] = useState<'anyone' | 'verified' | 'no-one'>('anyone');

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Confidentialité et sécurité" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <SettingsGroup title="Profil">
          <SettingsRow
            kind="toggle"
            label="Profil public"
            hint="Désactivé : ton profil n'est visible que par les personnes avec qui tu as échangé."
            value={vis.profile}
            onChange={(v) => setVis((s) => ({ ...s, profile: v }))}
          />
          <SettingsRow
            kind="toggle"
            label="Masquer le nom de famille"
            hint="Les acheteurs ne voient que ton prénom."
            value={vis.lastName}
            onChange={(v) => setVis((s) => ({ ...s, lastName: v }))}
            last
          />
        </SettingsGroup>

        <SettingsGroup title="Localisation">
          <SettingsRow
            kind="toggle"
            label="Afficher la distance exacte"
            hint="Désactivé : affiche un rayon approximatif (~200 m)."
            value={vis.exact}
            onChange={(v) => setVis((s) => ({ ...s, exact: v }))}
            last
          />
        </SettingsGroup>

        <SettingsGroup title="Qui peut m'écrire">
          <SettingsRow kind="value" label="Tout le monde" value={who === 'anyone' ? '✓' : ''} onPress={() => setWho('anyone')} />
          <SettingsRow kind="value" label="Voisins vérifiés uniquement" value={who === 'verified' ? '✓' : ''} onPress={() => setWho('verified')} />
          <SettingsRow kind="value" label="Personne (verrouillé)" value={who === 'no-one' ? '✓' : ''} onPress={() => setWho('no-one')} last />
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}
