import { Pressable, ScrollView, Text, View } from 'react-native';

import { useColors, radius as R, t } from '@/theme';
import { PageHeader } from '@/components';
import { useToast } from '@/lib/toast';

const LINKS = [
  { label: 'Conditions d\'utilisation', body: 'Ouvrir les CGU' },
  { label: 'Politique de confidentialité', body: 'Ouvrir la politique de confidentialité' },
  { label: 'Politique de cookies', body: 'Ouvrir la politique de cookies' },
  { label: 'Licences open-source', body: 'Ouvrir les licences' },
];

export default function About() {
  const C = useColors();
  const toast = useToast();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="À propos" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: 'center', paddingVertical: 22 }}>
          <Text style={{ fontFamily: 'InstrumentSerif-Italic', fontSize: 36, color: C.ink, letterSpacing: -0.6 }}>
            MyStreet
          </Text>
          <Text style={[t('caption'), { color: C.n500, marginTop: 4 }]}>
            v0.1.0 (build 2026.05.04)
          </Text>
        </View>

        <View style={{ backgroundColor: C.surface, borderRadius: R.lg, borderWidth: 1, borderColor: C.divider, overflow: 'hidden' }}>
          {LINKS.map((l, i) => (
            <Pressable
              key={l.label}
              onPress={() => toast.info(l.body)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: i < LINKS.length - 1 ? 1 : 0,
                borderBottomColor: C.divider,
              }}
            >
              <Text style={{ fontFamily: 'InstrumentSans-Medium', fontSize: 15, color: C.ink }}>{l.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[t('caption'), { color: C.n500, textAlign: 'center', marginTop: 22, lineHeight: 16 }]}>
          Fait à Lille · Marketplace hyperlocale.{'\n'}© 2026 MyStreet SAS
        </Text>
      </ScrollView>
    </View>
  );
}
