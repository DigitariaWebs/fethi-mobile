import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { Icon } from '@/components';
import { CategoryGlyph } from '@/components/sell/CategoryGlyph';
import { CATEGORY_SECTIONS, CATEGORIES_FLAT } from '@/lib/categories';
import { useSellDraft } from '@/lib/sellDraft';

// Category picker for the sell flow. Surfaced from the title step's
// "Pick a different category" link. Tap a row to set the draft's category
// and pop back to the title step.
export default function CategoryPicker() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const draft = useSellDraft();
  const [query, setQuery] = useState('');

  const norm = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // Search across the flat list. When non-empty, render a single result
  // group; otherwise fall back to the section layout.
  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return null;
    return CATEGORIES_FLAT.filter(
      (c) => norm(c.label).includes(q) || (c.subtitle && norm(c.subtitle).includes(q)),
    );
  }, [query]);

  const select = (label: string) => {
    draft.set({ category: label });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: C.divider,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.divider,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.Chevron size={16} color={C.ink} dir="left" />
        </Pressable>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 18,
            color: C.ink,
          }}
        >
          Choisis une catégorie
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: C.surface,
            borderRadius: R.full,
            borderWidth: 1,
            borderColor: C.divider,
            paddingHorizontal: 14,
            height: 44,
          }}
        >
          <Icon.Search size={16} color={C.n500} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une catégorie"
            placeholderTextColor={C.n500}
            style={{
              flex: 1,
              fontFamily: 'InstrumentSans-Medium',
              fontSize: 15,
              color: C.ink,
              paddingVertical: 0,
            }}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Icon.Close size={14} color={C.n500} />
            </Pressable>
          )}
        </View>
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {results ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            {results.length === 0 ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Text style={[t('body'), { color: C.n500 }]}>Aucune catégorie ne correspond à « {query} ».</Text>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: C.surface,
                  borderRadius: R.lg,
                  borderWidth: 1,
                  borderColor: C.divider,
                  overflow: 'hidden',
                }}
              >
                {results.map((c, i) => (
                  <Row
                    key={c.id}
                    label={c.label}
                    subtitle={c.subtitle}
                    glyph={c.glyph}
                    selected={draft.category === c.label}
                    onPress={() => select(c.label)}
                    last={i === results.length - 1}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          CATEGORY_SECTIONS.map((section) => (
            <View key={section.title} style={{ paddingHorizontal: 16, marginTop: 18 }}>
              <Text
                style={{
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 12,
                  color: C.n500,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                {section.title}
              </Text>
              <View
                style={{
                  backgroundColor: C.surface,
                  borderRadius: R.lg,
                  borderWidth: 1,
                  borderColor: C.divider,
                  overflow: 'hidden',
                }}
              >
                {section.items.map((c, i) => (
                  <Row
                    key={c.id}
                    label={c.label}
                    subtitle={c.subtitle}
                    glyph={c.glyph}
                    selected={draft.category === c.label}
                    onPress={() => select(c.label)}
                    last={i === section.items.length - 1}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  subtitle,
  glyph,
  selected,
  onPress,
  last,
}: {
  label: string;
  subtitle?: string;
  glyph: Parameters<typeof CategoryGlyph>[0]['name'];
  selected: boolean;
  onPress: () => void;
  last?: boolean;
}) {
  const C = useColors();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: C.inkOverlay05 }}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.divider,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: selected ? C.primarySoft : C.n50,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CategoryGlyph name={glyph} size={20} color={selected ? C.primary : C.ink} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 15,
              color: C.ink,
            }}
          >
            {label}
          </Text>
          {subtitle ? (
            <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {selected ? (
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: C.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.Check size={12} color="#FFF" />
          </View>
        ) : (
          <Icon.Chevron size={14} color={C.n400} />
        )}
      </View>
    </Pressable>
  );
}
