import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useColors, t } from '@/theme';
import { PageHeader } from '@/components';
import { SettingsGroup, SettingsRow } from '@/components/settings/SettingsRow';

const ROWS = [
  { id: 'messages', label: 'Nouveaux messages', hint: 'Push, e-mail, in-app.' },
  { id: 'offers',   label: 'Offres',       hint: 'Quand quelqu\'un fait une offre sur ton annonce.' },
  { id: 'bookings', label: 'Demandes de réservation', hint: 'Locations + services en attente de réponse.' },
  { id: 'sold',     label: 'Annonce vendue',     hint: 'Avec confettis.' },
  { id: 'marketing', label: 'Marketing',       hint: 'Nouveautés, promotions.' },
  { id: 'digest',   label: 'Récap\' hebdomadaire',    hint: 'Résumé de l\'activité dans ton quartier.' },
] as const;

type Channel = 'push' | 'email' | 'inapp';
type State = Record<string, Record<Channel, boolean>>;

const DEFAULT: State = ROWS.reduce<State>((acc, r) => {
  const C = useColors();
  acc[r.id] = { push: true, email: r.id !== 'marketing', inapp: true };
  return acc;
}, {});

export default function NotificationSettings() {
  const C = useColors();
  const [state, setState] = useState<State>(DEFAULT);
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Notifications" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={[t('caption'), { color: C.n500, paddingHorizontal: 6, marginBottom: 6 }]}>
          PUSH · E-MAIL · IN-APP
        </Text>
        {ROWS.map((r) => (
          <SettingsGroup key={r.id} title={r.label}>
            <SettingsRow
              kind="toggle"
              label="Push"
              hint={r.hint}
              value={state[r.id].push}
              onChange={(v) => setState((s) => ({ ...s, [r.id]: { ...s[r.id], push: v } }))}
            />
            <SettingsRow
              kind="toggle"
              label="E-mail"
              value={state[r.id].email}
              onChange={(v) => setState((s) => ({ ...s, [r.id]: { ...s[r.id], email: v } }))}
            />
            <SettingsRow
              kind="toggle"
              label="In-app"
              value={state[r.id].inapp}
              onChange={(v) => setState((s) => ({ ...s, [r.id]: { ...s[r.id], inapp: v } }))}
              last
            />
          </SettingsGroup>
        ))}
      </ScrollView>
    </View>
  );
}
