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
import Svg, { Path, Polyline } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { StepHeader } from '@/components/sell/StepHeader';
import { StepFooter } from '@/components/sell/StepFooter';
import { useSellDraft, type SellDraft } from '@/lib/sellDraft';
import { useSubscription } from '@/lib/subscription';

const CONDITIONS: Array<{ id: NonNullable<SellDraft['condition']>; label: string; sub: string }> = [
  { id: 'new', label: 'Neuf', sub: 'Jamais utilisé' },
  { id: 'likenew', label: 'Comme neuf', sub: 'Utilisé 1×' },
  { id: 'good', label: 'Bon état', sub: 'Légère usure' },
  { id: 'fair', label: 'Correct', sub: 'Visible' },
];

// Phase 5 / Step 3 — Description + condition.
export default function SellDescription() {
  const C = useColors();
  const router = useRouter();
  const draft = useSellDraft();
  const max = 600;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: C.paper }}
    >
      <StepHeader step={3} />
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
          Raconte son histoire.
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, marginBottom: 22 }]}>
          Quelques détails honnêtes inspirent confiance.
        </Text>

        {/* Condition segmented */}
        <Label>ÉTAT</Label>
        <View
          style={{
            backgroundColor: C.surface,
            padding: 4,
            borderRadius: R.md,
            borderWidth: 1,
            borderColor: C.n200,
            flexDirection: 'row',
            marginTop: 8,
            marginBottom: 22,
          }}
        >
          {CONDITIONS.map((c) => {
            const sel = draft.condition === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => draft.set({ condition: c.id })}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                  borderRadius: R.sm,
                  backgroundColor: sel ? C.ink : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 13,
                    color: sel ? '#FFF' : C.ink,
                  }}
                >
                  {c.label}
                </Text>
                <Text
                  style={{
                    fontFamily: 'InstrumentSans',
                    fontSize: 10,
                    color: sel ? 'rgba(255,255,255,0.8)' : C.n500,
                    marginTop: 1,
                  }}
                >
                  {c.sub}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Description */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Label>DESCRIPTION</Label>
          <HelpMeWrite />
        </View>
        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.md,
            borderWidth: 1,
            borderColor: C.n200,
            paddingHorizontal: 16,
            paddingVertical: 14,
            minHeight: 160,
          }}
        >
          <TextInput
            value={draft.description}
            onChangeText={(v) =>
              draft.set({ description: v.slice(0, max) })
            }
            placeholder="Décris son état, ce qui est inclus, pourquoi tu le vends…"
            placeholderTextColor={C.n400}
            multiline
            textAlignVertical="top"
            style={[
              t('body'),
              { color: C.ink, padding: 0, lineHeight: 22, minHeight: 132 },
            ]}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 4,
            marginTop: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Polyline points="20 6 9 17 4 12" stroke="#3FA66B" strokeWidth={2.5} />
            </Svg>
            <Text style={[t('caption'), { color: C.n500 }]} numberOfLines={1}>
              Une annonce honnête et précise reçoit de meilleures offres
            </Text>
          </View>
          <Text style={[t('caption'), { color: C.n500 }]}>
            {draft.description.length}/{max}
          </Text>
        </View>
      </ScrollView>

      <StepFooter
        ctaDisabled={draft.description.trim().length < 20 || !draft.condition}
        onCta={() => router.push('/sell/price')}
      />
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

// "Help me write" pill — gated behind MyStreet+. Free users tap → paywall.
// Paid users tap → the existing canned suggestion fills the description.
function HelpMeWrite() {
  const C = useColors();
  const router = useRouter();
  const draft = useSellDraft();
  const isPlus = useSubscription((s) => s.tier === 'plus');
  return (
    <Pressable
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
      onPress={() => {
        if (!isPlus) {
          router.push('/subscription' as any);
          return;
        }
        draft.set({
          description:
            "Vélo Peugeot des années 80, bien entretenu. Bon état général, légères marques d'usage sur le cadre. Pneus changés cette année, freins révisés.\n\nIdéal pour des trajets en ville. Selle confortable.",
        });
      }}
    >
      <Svg width={12} height={12} viewBox="0 0 16 16">
        <Path
          d="M8 1.2 L9.4 6 L14.2 7.4 L9.4 8.8 L8 13.6 L6.6 8.8 L1.8 7.4 L6.6 6 Z"
          fill={isPlus ? C.primary : C.n500}
        />
      </Svg>
      <Text
        style={{
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 11,
          color: isPlus ? C.primary : C.n600,
        }}
      >
        {isPlus ? 'Aide-moi à rédiger' : 'Aide-moi à rédiger · MyStreet+'}
      </Text>
    </Pressable>
  );
}
