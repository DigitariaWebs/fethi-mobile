import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSPill } from '@/components';
import { StepHeader } from '@/components/sell/StepHeader';
import { StepFooter } from '@/components/sell/StepFooter';
import { useSellDraft, type SellDraft } from '@/lib/sellDraft';

// Inline stroke glyphs for the pickup-method tiles. Emojis don't render
// reliably in the simulator (and shape badly across platforms), so we
// draw a small SVG per method.
type GlyphFn = (props: { color: string; size: number }) => React.ReactNode;

const HomeGlyph: GlyphFn = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 11 L12 4 L21 11 V20 H15 V14 H9 V20 H3 Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

const CafeGlyph: GlyphFn = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 11 H17 V15 A4 4 0 0 1 13 19 H8 A4 4 0 0 1 4 15 Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Path d="M17 12 a3 3 0 0 1 0 6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    <Path
      d="M8 4 c0 2 -1 2 -1 4 M12 4 c0 2 -1 2 -1 4"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

const PackageGlyph: GlyphFn = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7 L12 3 L21 7 L21 17 L12 21 L3 17 Z M3 7 L12 11 L21 7 M12 11 V21"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <Circle cx={7.5} cy={9} r={0.5} fill={color} />
  </Svg>
);

const METHODS: Array<{
  id: SellDraft['pickupMethod'];
  Glyph: GlyphFn;
  label: string;
  sub: string;
  disabled?: boolean;
}> = [
  { id: 'home',     Glyph: HomeGlyph,    label: 'Chez moi',              sub: 'Adresse partagée après acceptation' },
  { id: 'meeting',  Glyph: CafeGlyph,    label: 'Lieu public',           sub: 'Café, place, métro…' },
  { id: 'shipping', Glyph: PackageGlyph, label: 'Livraison',             sub: 'Pour les objets sous 50 €', disabled: true },
];

const SLOTS = ['En semaine', 'Soirées', 'Week-ends', 'Matins', 'Pause déjeuner'];

// Phase 5 / Step 5 — Pickup preferences.
export default function SellPickup() {
  const C = useColors();
  const router = useRouter();
  const draft = useSellDraft();

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StepHeader step={5} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
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
          Comment se passe la{' '}
          <Text
            style={{
              fontFamily: 'InstrumentSerif-Italic',
              fontWeight: '400',
            }}
          >
            rencontre
          </Text>
          {' '}?
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, marginBottom: 24 }]}>
          C'est visible sur l'annonce.
        </Text>

        {/* Method cards */}
        <View style={{ gap: 10, marginBottom: 22 }}>
          {METHODS.map((m) => {
            const sel = draft.pickupMethod === m.id;
            return (
              <Pressable
                key={m.id}
                disabled={m.disabled}
                onPress={() => draft.set({ pickupMethod: m.id })}
                style={[
                  sel ? Sh.subtle : null,
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: R.lg,
                    backgroundColor: C.surface,
                    borderWidth: sel ? 2 : 1,
                    borderColor: sel ? C.ink : C.divider,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    opacity: m.disabled ? 0.5 : 1,
                  },
                ]}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: R.md,
                    backgroundColor: sel ? C.primarySoft : C.n50,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <m.Glyph color={sel ? C.primary : C.ink} size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Text
                      style={[t('body'), { fontFamily: 'InstrumentSans-SemiBold', color: C.ink }]}
                    >
                      {m.label}
                    </Text>
                    {m.disabled && (
                      <View
                        style={{
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: R.full,
                          backgroundColor: C.n100,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: C.n500,
                            fontFamily: 'InstrumentSans-Medium',
                          }}
                        >
                          Bientôt
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>{m.sub}</Text>
                </View>
                {sel && (
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: C.ink,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon.Check size={12} color="#FFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Availability */}
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 12,
            color: C.n500,
            marginBottom: 10,
          }}
        >
          TES DISPONIBILITÉS HABITUELLES
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {SLOTS.map((s) => (
            <MSPill
              key={s}
              size="sm"
              selected={draft.availability.includes(s)}
              onPress={() => draft.toggleAvail(s)}
            >
              {s}
            </MSPill>
          ))}
        </View>

        {/* Privacy reassurance */}
        <View
          style={{
            marginTop: 22,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: R.md,
            backgroundColor: C.accentSoft,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1 }}>
            <Rect x={3} y={11} width={18} height={11} rx={2} stroke="#2F4F45" strokeWidth={2} />
            <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#2F4F45" strokeWidth={2} />
          </Svg>
          <Text style={[t('bodySm'), { color: '#2F4F45', lineHeight: 19, flex: 1 }]}>
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold' }}>
              Ton adresse exacte n'est jamais affichée.
            </Text>{' '}
            Les acheteurs voient seulement le nom de ta rue sur la carte.
          </Text>
        </View>
      </ScrollView>

      <StepFooter onCta={() => router.push('/sell/review')} />
    </View>
  );
}
