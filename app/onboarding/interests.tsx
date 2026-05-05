import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, t } from '@/theme';
import { MSButton } from '@/components';
import { CategoryGlyph } from '@/components/sell/CategoryGlyph';
import { CATEGORIES_FLAT, RENTAL_CATEGORIES, SERVICE_CATEGORIES } from '@/lib/categories';

const POOL = [
  ...CATEGORIES_FLAT.slice(0, 14),
  ...RENTAL_CATEGORIES,
  ...SERVICE_CATEGORIES.slice(0, 4),
];

export default function Interests() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setPicked((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: insets.top + 32, paddingBottom: 24 }}>
        <Text style={{ fontFamily: 'InstrumentSerif-Italic', fontSize: 36, color: C.ink, lineHeight: 40, letterSpacing: -0.6 }}>
          Qu'est-ce qui te plaît ?
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 12, marginBottom: 24, lineHeight: 22 }]}>
          Choisis-en quelques-uns — on adaptera la carte et la recherche pour te montrer ce qui t'intéresse vraiment.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {POOL.map((c) => {
            const sel = picked.has(c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() => toggle(c.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: sel ? C.ink : C.surface,
                  borderWidth: 1,
                  borderColor: sel ? C.ink : C.divider,
                }}
              >
                <CategoryGlyph name={c.glyph} size={16} color={sel ? '#FFF' : C.ink} />
                <Text
                  style={{
                    color: sel ? '#FFF' : C.ink,
                    fontFamily: 'InstrumentSans-Medium',
                    fontSize: 14,
                  }}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 + insets.bottom, backgroundColor: C.paper, borderTopWidth: 1, borderTopColor: C.divider }}>
        <MSButton size="lg" fullWidth onPress={() => router.push('/onboarding/welcome-tutorial' as any)}>
          {picked.size > 0 ? `Continuer · ${picked.size} sélectionné${picked.size > 1 ? 's' : ''}` : 'Passer'}
        </MSButton>
      </View>
    </View>
  );
}
