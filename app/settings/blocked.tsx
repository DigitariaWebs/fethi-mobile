import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useColors, t } from '@/theme';
import { EmptyState, MSAvatar, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';
import { confirm } from '@/lib/confirm';

const SEED = [
  { id: 'b1', name: 'Patrick L.', when: 'il y a 2 semaines' },
];

export default function Blocked() {
  const C = useColors();
  const toast = useToast();
  const [list, setList] = useState(SEED);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Bloqué(e)s" />
      {list.length === 0 ? (
        <EmptyState
          title="Personne n'est bloqué."
          description="Quand tu bloques quelqu'un, il apparaît ici au cas où tu changes d'avis."
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {list.map((b) => (
            <View
              key={b.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                backgroundColor: C.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: C.divider,
              }}
            >
              <MSAvatar name={b.name} size={40} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 14, color: C.ink }}>{b.name}</Text>
                <Text style={[t('caption'), { color: C.n500 }]}>Bloqué(e) {b.when}</Text>
              </View>
              <Pressable
                onPress={async () => {
                  if (
                    await confirm({
                      title: `Débloquer ${b.name} ?`,
                      confirmLabel: 'Débloquer',
                    })
                  ) {
                    setList((l) => l.filter((x) => x.id !== b.id));
                    toast.success(`${b.name} débloqué(e).`);
                  }
                }}
                style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: C.n50, borderWidth: 1, borderColor: C.divider }}
              >
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 12, color: C.ink }}>
                  Débloquer
                </Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
