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
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { Icon, MSPill } from '@/components';
import { CategoryGlyph } from '@/components/sell/CategoryGlyph';
import { StepHeader } from '@/components/sell/StepHeader';
import { StepFooter } from '@/components/sell/StepFooter';
import { findCategoryByLabel } from '@/lib/categories';
import { useSellDraft } from '@/lib/sellDraft';
import { useSubscription } from '@/lib/subscription';

const TAGS = ['Vintage', 'Adulte', 'Femme', 'Homme', 'Enfant', 'Course', 'Électrique'];

// Phase 5 / Step 2 — Title + Category + Tags.
export default function SellTitle() {
  const C = useColors();
  const router = useRouter();
  const draft = useSellDraft();

  const valid = draft.title.trim().length >= 5;
  const isPlus = useSubscription((s) => s.tier === 'plus');

  // Match the picked category against the catalog to render its glyph and
  // subtitle. Falls back to the bike sketch / placeholder if the category
  // isn't in the catalog (e.g. a freshly-reset draft default).
  const categoryEntry = findCategoryByLabel(draft.category);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: C.paper }}
    >
      <StepHeader step={2} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 28,
            lineHeight: 33,
            letterSpacing: -0.56,
            color: C.ink,
          }}
        >
          Qu'est-ce que c'est ?
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, marginBottom: 24 }]}>
          Un titre clair aide tes voisins à le trouver.
        </Text>

        {/* Title */}
        <Label>TITRE</Label>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.md,
            borderWidth: 1.5,
            borderColor: valid ? C.ink : C.n200,
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <TextInput
            value={draft.title}
            onChangeText={(v) => draft.set({ title: v })}
            placeholder="ex. Vélo de ville Peugeot années 80"
            placeholderTextColor={C.n400}
            maxLength={60}
            style={[
              t('bodyLg'),
              { color: C.ink, padding: 0, fontFamily: 'InstrumentSans-Medium' },
            ]}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 4,
            marginTop: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
            {valid && <Icon.Check size={12} color="#3FA66B" />}
            <Text style={[t('caption'), { color: C.n500 }]}>
              {valid ? 'Parfait' : 'Au moins 5 caractères'}
            </Text>
          </View>
          <Text style={[t('caption'), { color: C.n500 }]}>
            {draft.title.length}/60
          </Text>
        </View>

        {/* Category */}
        <View style={{ marginTop: 22 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
            }}
          >
            <Label>CATÉGORIE</Label>
            <Pressable
              onPress={() => {
                if (!isPlus) router.push('/subscription' as any);
              }}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: R.full,
                backgroundColor: isPlus ? C.primarySoft : C.n100,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Svg width={10} height={10} viewBox="0 0 16 16">
                <Path
                  d="M8 1.2 L9.4 6 L14.2 7.4 L9.4 8.8 L8 13.6 L6.6 8.8 L1.8 7.4 L6.6 6 Z"
                  fill={isPlus ? C.primary : C.n500}
                />
              </Svg>
              <Text
                style={{
                  color: isPlus ? C.primary : C.n600,
                  fontFamily: 'InstrumentSans-Bold',
                  fontSize: 10,
                  letterSpacing: 0.4,
                }}
              >
                {isPlus ? 'IA suggérée' : 'IA · MyStreet+'}
              </Text>
            </Pressable>
          </View>
          <View
            style={{
              backgroundColor: C.surface,
              borderRadius: R.md,
              borderWidth: 1,
              borderColor: C.n200,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: R.sm,
                backgroundColor: C.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CategoryGlyph
                name={categoryEntry?.glyph ?? 'other'}
                size={20}
                color={C.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[t('body'), { fontFamily: 'InstrumentSans-SemiBold', color: C.ink }]}
              >
                {draft.category}
              </Text>
              {categoryEntry?.subtitle ? (
                <Text style={[t('caption'), { color: C.n500 }]}>
                  {categoryEntry.subtitle}
                </Text>
              ) : null}
            </View>
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
          </View>
          <Pressable
            onPress={() => router.push('/sell/category' as any)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 }}
          >
            <Text
              style={[
                t('bodySm'),
                { color: C.n600, fontFamily: 'InstrumentSans-Medium' },
              ]}
            >
              Choisir une autre catégorie
            </Text>
            <Icon.Chevron size={14} color={C.n600} />
          </Pressable>
        </View>

        {/* Tags */}
        <View style={{ marginTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              marginBottom: 10,
            }}
          >
            <Label>AJOUTER DES TAGS</Label>
            <Text style={[t('caption'), { color: C.n400 }]}>· optionnel</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {TAGS.map((tag) => (
              <MSPill
                key={tag}
                size="sm"
                selected={draft.tags.includes(tag)}
                onPress={() => draft.toggleTag(tag)}
              >
                {tag}
              </MSPill>
            ))}
          </View>
        </View>
      </ScrollView>

      <StepFooter ctaDisabled={!valid} onCta={() => router.push('/sell/description')} />
    </KeyboardAvoidingView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  const C = useColors();
  return (
    <Text
      style={{
        fontFamily: 'InstrumentSans-SemiBold',
        fontSize: 12,
        color: C.n500,
        letterSpacing: 0,
      }}
    >
      {children}
    </Text>
  );
}
