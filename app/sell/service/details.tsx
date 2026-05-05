import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useColors, radius as R, t } from '@/theme';
import { CategoryGlyph } from '@/components/sell/CategoryGlyph';
import { StepHeader } from '@/components/sell/StepHeader';
import { StepFooter } from '@/components/sell/StepFooter';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { useSellDraft } from '@/lib/sellDraft';

// Service-flow step 2 — title + service category + description.
// Replaces the sale path's title/category/description triplet because
// services don't carry condition or tags.
export default function ServiceDetails() {
  const C = useColors();
  const router = useRouter();
  const draft = useSellDraft();
  const [title, setTitle] = useState(draft.title);
  const [category, setCategory] = useState(draft.category);
  const [description, setDescription] = useState(draft.description);

  const valid = title.trim().length >= 6 && category && description.trim().length >= 12;
  const inputStyle = {
    backgroundColor: C.surface,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.divider,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'InstrumentSans-Medium',
    fontSize: 16,
    color: C.ink,
  } as const;

  const next = () => {
    draft.set({ title: title.trim(), category, description: description.trim() });
    router.push('/sell/service/pricing' as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: C.paper }}
    >
      <StepHeader step={2} total={5} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 28,
            lineHeight: 33,
            letterSpacing: -0.56,
            color: C.ink,
          }}
        >
          Quel est ton{' '}
          <Text style={{ fontFamily: 'InstrumentSerif-Italic' }}>service</Text>
          {' '}?
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, marginBottom: 24 }]}>
          Sois précis(e) — tes voisins doivent comprendre tout de suite si tu peux les aider.
        </Text>

        <Label>TITRE</Label>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="ex. Cours de guitare pour débutants"
          placeholderTextColor={C.n400}
          style={inputStyle}
        />

        <Label style={{ marginTop: 24 }}>CATÉGORIE</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {SERVICE_CATEGORIES.map((c) => {
            const sel = c.label === category;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategory(c.label)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  borderRadius: 999,
                  backgroundColor: sel ? C.ink : C.surface,
                  borderWidth: 1,
                  borderColor: sel ? C.ink : C.divider,
                }}
              >
                <CategoryGlyph name={c.glyph} size={14} color={sel ? '#FFF' : C.ink} />
                <Text
                  style={{
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 13,
                    color: sel ? '#FFF' : C.ink,
                  }}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Label style={{ marginTop: 24 }}>DESCRIPTION</Label>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Ce que tu proposes, à qui ça s'adresse, tes qualifications…"
          placeholderTextColor={C.n400}
          multiline
          textAlignVertical="top"
          style={[inputStyle, { minHeight: 140 }]}
        />
      </ScrollView>
      <StepFooter ctaDisabled={!valid} onCta={next} />
    </KeyboardAvoidingView>
  );
}

function Label({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const C = useColors();
  return (
    <Text
      style={[
        {
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 11,
          color: C.n500,
          letterSpacing: 0.6,
          marginBottom: 8,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
