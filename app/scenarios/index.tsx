import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useColors, radius as R, shadow as Sh, t, type Palette } from '@/theme';
import { Icon, MSPill, PageHeader } from '@/components';
import {
  appendNotification,
  SCENARIOS,
  type Scenario,
  type ScenarioCategory,
} from '@/lib/scenarios';
import { useToast } from '@/lib/toast';
import { useSubscription } from '@/lib/subscription';

const CATEGORIES: ScenarioCategory[] = [
  'Posting',
  'Buyer',
  'Seller',
  'Subscription',
  'Account',
  'Edge cases',
];

const CATEGORY_LABELS: Record<ScenarioCategory | 'All', string> = {
  All: 'Tout',
  Posting: 'Publication',
  Buyer: 'Acheteur',
  Seller: 'Vendeur',
  Subscription: 'Abonnement',
  Account: 'Compte',
  'Edge cases': 'Cas limites',
};

// QA / demo screen. Browse a categorised list of end-to-end scenarios;
// tapping one runs its `run(api)` driver — usually a sequence of
// navigations, toasts, fixture mutations, and pushed notifications.
//
// Linked from the bottom of /settings.
export default function ScenariosScreen() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const tier = useSubscription((s) => s.tier);
  const [running, setRunning] = useState<string | null>(null);
  const [filter, setFilter] = useState<ScenarioCategory | 'All'>('All');

  const visible = useMemo(
    () => (filter === 'All' ? SCENARIOS : SCENARIOS.filter((s) => s.category === filter)),
    [filter],
  );

  const fire = async (s: Scenario) => {
    setRunning(s.id);
    try {
      await s.run({
        router: router as any,
        toast,
        pushNotification: appendNotification,
        wait: (ms) => new Promise((r) => setTimeout(r, ms)),
      });
    } catch (e) {
      toast.error('Le scénario a échoué.');
      if (__DEV__) console.error(e);
    } finally {
      setRunning(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader
        title="Scénarios"
        subtitle={`Niveau · ${tier === 'plus' ? 'MyStreet+' : 'gratuit'}`}
      />
      <View
        style={{
          flexDirection: 'row',
          gap: 6,
          paddingHorizontal: 16,
          paddingVertical: 10,
          flexWrap: 'wrap',
        }}
      >
        {(['All', ...CATEGORIES] as const).map((c) => (
          <MSPill key={c} size="sm" selected={filter === c} onPress={() => setFilter(c)}>
            {CATEGORY_LABELS[c]}
          </MSPill>
        ))}
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {visible.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => fire(s)}
            disabled={running != null}
            style={[
              Sh.subtle,
              {
                padding: 14,
                backgroundColor: C.surface,
                borderRadius: R.lg,
                borderWidth: 1,
                borderColor: C.divider,
                opacity: running != null && running !== s.id ? 0.6 : 1,
                flexDirection: 'row',
                gap: 12,
                alignItems: 'flex-start',
              },
            ]}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: tintFor(s.category, C),
                marginTop: 7,
              }}
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text
                  style={{
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 15,
                    color: C.ink,
                    flex: 1,
                  }}
                >
                  {s.title}
                </Text>
                <Text
                  style={[t('caption'), { color: tintFor(s.category, C), fontFamily: 'InstrumentSans-SemiBold' }]}
                >
                  {CATEGORY_LABELS[s.category].toUpperCase()}
                </Text>
              </View>
              <Text style={[t('bodySm'), { color: C.n600, marginTop: 4, lineHeight: 19 }]}>
                {s.blurb}
              </Text>
              {running === s.id ? (
                <View
                  style={{
                    marginTop: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: C.primary,
                    }}
                  />
                  <Text
                    style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 11, color: C.primary, letterSpacing: 0.4, textTransform: 'uppercase' }}
                  >
                    En cours…
                  </Text>
                </View>
              ) : null}
            </View>
            <Icon.Chevron size={14} color={C.n400} />
          </Pressable>
        ))}
        <Text style={[t('caption'), { color: C.n400, textAlign: 'center', marginTop: 16 }]}>
          {`${SCENARIOS.length} scénarios · mode QA`}
        </Text>
      </ScrollView>
    </View>
  );
}

function tintFor(c: ScenarioCategory, C: Palette): string {
  switch (c) {
    case 'Posting':
      return C.primary;
    case 'Buyer':
      return C.accent;
    case 'Seller':
      return '#7A4F0E';
    case 'Subscription':
      return C.warning;
    case 'Account':
      return C.danger;
    default:
      return C.n500;
  }
}
