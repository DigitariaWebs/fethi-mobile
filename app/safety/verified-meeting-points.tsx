import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { Icon, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';

const POINTS = [
  { id: 'p1', name: 'Police municipale de Lille',  kind: 'police',   addr: '1 Place Augustin Laurent', dist: '900 m' },
  { id: 'p2', name: 'Mairie de Lille',          kind: 'town-hall', addr: 'Place Roger Salengro',     dist: '1,2 km' },
  { id: 'p3', name: 'Café Méert (Vieux-Lille)',  kind: 'cafe',     addr: '27 Rue Esquermoise',       dist: '320 m' },
  { id: 'p4', name: 'Cafés des Postes',          kind: 'cafe',     addr: '24 Rue de Paris',          dist: '600 m' },
];

export default function VerifiedMeetingPoints() {
  const C = useColors();
  const toast = useToast();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Points de rencontre" />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
        <Text style={[t('body'), { color: C.n600, marginBottom: 8, lineHeight: 22 }]}>
          Lieux publics recommandés par MyStreet à Lille. Appuie pour le proposer dans ton chat.
        </Text>
        {POINTS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => toast.success(`${p.name} envoyé dans le chat (mock).`)}
            style={{
              flexDirection: 'row',
              gap: 12,
              padding: 14,
              backgroundColor: C.surface,
              borderRadius: R.lg,
              borderWidth: 1,
              borderColor: C.divider,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor:
                  p.kind === 'police' ? C.dangerSoft : p.kind === 'town-hall' ? C.accentSoft : C.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {p.kind === 'police' ? (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 3 L21 7 V13 c0 5 -4 8 -9 8 c-5 0 -9 -3 -9 -8 V7 Z" stroke={C.danger} strokeWidth={2} strokeLinejoin="round" />
                </Svg>
              ) : (
                <Icon.Pin size={18} color={p.kind === 'town-hall' ? '#2F4F45' : C.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
                {p.name}
              </Text>
              <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
                {`${p.addr} · ${p.dist}`}
              </Text>
            </View>
            <Icon.Chevron size={14} color={C.n400} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
