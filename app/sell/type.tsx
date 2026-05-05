import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t, type Palette } from '@/theme';
import { Icon } from '@/components';
import { useSellDraft } from '@/lib/sellDraft';

// Phase 5 / Step 0 — pick a listing type. Drives the rest of the sell
// flow: 'sale' goes through the canonical photos → title → … path,
// 'rental' adds the rental-specific pricing + availability steps,
// 'service' branches into a fully different details + pricing flow.
type TypeSpec = {
  id: 'sale' | 'rental' | 'service';
  title: string;
  blurb: string;
  glyph: React.ReactNode;
  next: string;
};

// Built per render so the SVG strokes pick up the current theme's tokens.
function buildTypes(C: Palette): TypeSpec[] {
  return [
    {
      id: 'sale',
      title: 'Vendre un objet',
      blurb: "Un objet ponctuel dont tu n'as plus besoin.",
      next: '/sell',
      glyph: (
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 7 L12 3 L21 7 L21 17 L12 21 L3 17 Z M3 7 L12 11 L21 7 M12 11 V21"
            stroke={C.primary}
            strokeWidth={1.7}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
      ),
    },
    {
      id: 'rental',
      title: 'Louer un objet',
      blurb: "Outils, matériel, tout à la journée.",
      next: '/sell',
      glyph: (
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
          <Circle cx={9} cy={9} r={4} stroke={C.accent} strokeWidth={1.7} />
          <Path
            d="M12.5 12.5 L21 21 M17 17 L19 15"
            stroke={C.accent}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </Svg>
      ),
    },
    {
      id: 'service',
      title: 'Proposer un service',
      blurb: 'Cours, réparations, soins, beauté…',
      next: '/sell/service/details',
      glyph: (
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
          <Path
            d="M14 6 a4 4 0 0 1 4 4 L20.5 12.5 L17 16 L14 13 a4 4 0 0 1 0-7 Z M14 13 L4 21 L3 20 L11 12"
            stroke={C.warning}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
        </Svg>
      ),
    },
  ];
}

export default function SellType() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setDraft = useSellDraft((s) => s.set);
  const types = buildTypes(C);

  const pick = (spec: TypeSpec) => {
    setDraft({ listingType: spec.id });
    router.push(spec.next as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon.Close size={18} color={C.ink} />
        </Pressable>
        <Text style={[t('caption'), { color: C.n500 }]}>Étape 1 sur 6</Text>
      </View>
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
          Que veux-tu{' '}
          <Text style={{ fontFamily: 'InstrumentSerif-Italic' }}>publier</Text>
          {' '}?
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, marginBottom: 24 }]}>
          On adapte le reste du formulaire à ton choix.
        </Text>

        <View style={{ gap: 10 }}>
          {types.map((spec) => (
            <Pressable
              key={spec.id}
              onPress={() => pick(spec)}
              style={[
                Sh.subtle,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: 18,
                  borderRadius: R.lg,
                  backgroundColor: C.surface,
                  borderWidth: 1,
                  borderColor: C.divider,
                },
              ]}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor:
                    spec.id === 'sale'
                      ? C.primarySoft
                      : spec.id === 'rental'
                        ? C.accentSoft
                        : C.warningSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {spec.glyph}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 17,
                    color: C.ink,
                  }}
                >
                  {spec.title}
                </Text>
                <Text style={[t('bodySm'), { color: C.n500, marginTop: 2 }]}>
                  {spec.blurb}
                </Text>
              </View>
              <Icon.Chevron size={16} color={C.n400} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
