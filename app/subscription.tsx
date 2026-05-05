import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSButton } from '@/components';
import { useSubscription } from '@/lib/subscription';
import { useToast } from '@/lib/toast';

// Subscription paywall — surfaced when the user taps "Custom…" in the
// filters distance section. The free tier locks the search to the
// neighborhood (≤2km) preset distances; MyStreet+ at €1.99/mo unlocks
// arbitrary radius, plus the other perks listed below.
//
// This screen is presented as a modal (`presentation: 'modal'`) — the X in
// the top-right pops it off the stack.
export default function Subscription() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const upgrade = useSubscription((s) => s.upgrade);
  const tier = useSubscription((s) => s.tier);
  const toast = useToast();

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Close affordance */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        style={{
          position: 'absolute',
          top: insets.top + 8,
          right: 16,
          zIndex: 10,
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
        <Icon.Close size={18} color={C.ink} />
      </Pressable>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 32,
          paddingBottom: 200,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand crest */}
        <View
          style={[
            Sh.primaryGlow,
            {
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: C.primarySoft,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: 18,
            },
          ]}
        >
          <Icon.Star size={12} color={C.primary} />
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 12,
              color: C.primary,
              letterSpacing: 0.4,
            }}
          >
            MYSTREET+
          </Text>
        </View>

        <Text
          style={{
            fontFamily: 'InstrumentSerif',
            fontSize: 40,
            lineHeight: 44,
            letterSpacing: -0.8,
            color: C.ink,
          }}
        >
          Cherche au-delà de ton quartier.
        </Text>

        <Text
          style={[
            t('body'),
            { color: C.n600, marginTop: 12, marginBottom: 28, lineHeight: 22 },
          ]}
        >
          Distances personnalisées, filtres avancés et recherches sauvegardées —
          pour moins qu'un café.
        </Text>

        {/* Perk list */}
        <View style={{ gap: 14, marginBottom: 28 }}>
          <Perk
            title="Rayon personnalisé"
            body="Définis n'importe quelle distance, de 100 m à toute la ville."
          />
          <Perk
            title="Recherches sauvegardées et alertes"
            body="Sois notifié(e) dès qu'une nouvelle annonce correspond à tes filtres."
          />
          <Perk
            title="Accès prioritaire aux nouveautés"
            body="Vois les nouvelles annonces quelques minutes avant tout le monde."
          />
          <Perk
            title="Aucune publicité"
            body="Carte plus claire, fil plus net."
          />
        </View>

        {/* Plan card */}
        <View
          style={[
            Sh.medium,
            {
              borderRadius: R.xl,
              padding: 20,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.divider,
              marginBottom: 12,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text
              style={{
                fontFamily: 'InstrumentSans-Bold',
                fontSize: 36,
                color: C.ink,
                letterSpacing: -1,
              }}
            >
              1,99 €
            </Text>
            <Text style={[t('body'), { color: C.n500 }]}>/ mois</Text>
          </View>
          <Text style={[t('bodySm'), { color: C.n600, marginTop: 4 }]}>
            Résiliable à tout moment. Renouvellement mensuel.
          </Text>
        </View>

        <Text style={[t('caption'), { color: C.n500, lineHeight: 16 }]}>
          En continuant, tu acceptes les conditions MyStreet+. Le paiement sera
          débité sur ton compte Apple ID à la confirmation. L'abonnement se
          renouvelle automatiquement sauf résiliation au moins 24 heures avant la fin de la période.
        </Text>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          Sh.sheet,
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 24 + insets.bottom,
            backgroundColor: C.paper,
            borderTopWidth: 1,
            borderTopColor: C.divider,
          },
        ]}
      >
        <MSButton
          size="lg"
          fullWidth
          onPress={async () => {
            // Mock the StoreKit dance: 600ms processing + flip the
            // tier flag + bounce a success toast. Real wiring replaces
            // this with `requestPurchase` and webhooks.
            if (tier === 'plus') {
              router.back();
              return;
            }
            toast.info('Sécurisation du paiement avec Stripe…');
            await new Promise((r) => setTimeout(r, 600));
            await upgrade();
            toast.success('Bienvenue dans MyStreet+ — fonctionnalités débloquées.');
            router.back();
          }}
        >
          {tier === 'plus' ? 'Déjà abonné(e)' : 'Démarrer MyStreet+ — 1,99 €/mois'}
        </MSButton>
        <Pressable
          onPress={() => router.back()}
          style={{ paddingVertical: 12, alignItems: 'center', marginTop: 4 }}
        >
          <Text style={[t('bodySm'), { color: C.n500 }]}>Plus tard</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Perk({ title, body }: { title: string; body: string }) {
  const C = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: C.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
        }}
      >
        <Icon.Check size={14} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 15,
            color: C.ink,
          }}
        >
          {title}
        </Text>
        <Text style={[t('bodySm'), { color: C.n600, marginTop: 2 }]}>{body}</Text>
      </View>
    </View>
  );
}
