import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSButton } from '@/components';
import { StepHeader } from '@/components/sell/StepHeader';
import { useSellDraft } from '@/lib/sellDraft';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Phase 5 / Step 6 — Review + publish.
export default function SellReview() {
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const draft = useSellDraft();

  const publish = async () => {
    // TODO: replace with backend mutation. For now, clear any saved draft
    // (so the map's resume pill goes away) and dismiss the sell modal.
    await draft.clearSaved();
    router.dismissTo('/(tabs)/map');
  };

  const cover = draft.photos[0];

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StepHeader step={6} rightLabel={null} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 28,
              lineHeight: 33,
              letterSpacing: -0.56,
              color: C.ink,
            }}
          >
            Tout est bon ?
          </Text>
          <Text style={[t('body'), { color: C.n600, marginTop: 8 }]}>
            Voilà ce que tes voisins verront.
          </Text>
        </View>

        {/* Listing preview card */}
        <View
          style={[
            Sh.medium,
            {
              marginHorizontal: 20,
              marginBottom: 16,
              backgroundColor: C.surface,
              borderRadius: R.xl,
              borderWidth: 1,
              borderColor: C.divider,
              overflow: 'hidden',
            },
          ]}
        >
          <View style={{ height: 160 }}>
            {cover && (
              <Image
                source={{ uri: cover }}
                style={{ width: '100%', height: 160 }}
                contentFit="cover"
              />
            )}
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: R.sm,
                backgroundColor: 'rgba(31,36,33,0.75)',
              }}
            >
              <Text
                style={{
                  color: '#FFF',
                  fontSize: 11,
                  fontFamily: 'InstrumentSans-SemiBold',
                }}
              >
                {draft.photos.length} photos
              </Text>
            </View>
          </View>
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
              <Pill bg={C.primarySoft} fg={C.primaryInk} text="Vieux-Lille" />
              <Pill
                bg={C.accentSoft}
                fg="#2F4F45"
                text={
                  draft.condition === 'new'
                    ? 'Neuf'
                    : draft.condition === 'likenew'
                    ? 'Comme neuf'
                    : draft.condition === 'good'
                    ? 'Bon état'
                    : 'Correct'
                }
              />
            </View>
            <Text
              style={[
                t('h3'),
                { fontSize: 17, color: C.ink, marginBottom: 4 },
              ]}
            >
              {draft.title || 'Titre de ton annonce'}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <Text
                style={{
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 22,
                  color: C.ink,
                }}
              >
                €{draft.price ?? 0}
              </Text>
              <Text style={[t('caption'), { color: C.n500 }]}>· {draft.category}</Text>
            </View>
          </View>
        </View>

        {/* Edit summary */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            overflow: 'hidden',
          }}
        >
          <Row
            label="Photos"
            value={`${draft.photos.length} ajoutée${draft.photos.length === 1 ? '' : 's'}`}
            icon={<Icon.Camera size={14} color={C.n500} />}
            onEdit={() => router.push('/sell/photos')}
          />
          <Row
            label="Rencontre"
            value={`${pickupLabel(draft.pickupMethod)} · ${draft.availability.join(', ')}`}
            icon={<Icon.Pin size={14} color={C.n500} />}
            onEdit={() => router.push('/sell/pickup')}
          />
          <Row
            last
            label="Négociation"
            value={
              draft.acceptOffers ? `Offres à partir de €${draft.minOffer ?? 0}` : 'Prix fixe'
            }
            icon={
              <Text
                style={{
                  fontSize: 12,
                  color: C.n500,
                  fontFamily: 'InstrumentSans-Bold',
                }}
              >
                €
              </Text>
            }
            onEdit={() => router.push('/sell/price')}
          />
        </View>
      </ScrollView>

      {/* Publish */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 18 + insets.bottom,
          backgroundColor: isDark ? "rgba(24,21,18,0.95)" : "rgba(251,248,244,0.95)",
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <MSButton size="lg" fullWidth onPress={publish}>
          Publier dans ton quartier
        </MSButton>
        <Pressable
          onPress={() => router.dismissAll?.()}
          style={{ alignItems: 'center', marginTop: 10 }}
        >
          <Text
            style={[
              t('bodySm'),
              { color: C.n600, fontFamily: 'InstrumentSans-Medium', paddingVertical: 6 },
            ]}
          >
            Enregistrer comme brouillon
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Pill({ bg, fg, text }: { bg: string; fg: string; text: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: R.full,
        backgroundColor: bg,
      }}
    >
      <Text
        style={{
          color: fg,
          fontSize: 11,
          fontFamily: 'InstrumentSans-SemiBold',
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function Row({
  label,
  value,
  icon,
  onEdit,
  last,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  onEdit: () => void;
  last?: boolean;
}) {
  const C = useColors();
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.divider,
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: R.sm,
          backgroundColor: C.n50,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[t('caption'), { color: C.n500 }]}>{label}</Text>
        <Text
          numberOfLines={1}
          style={[t('bodySm'), { color: C.ink, fontFamily: 'InstrumentSans-Medium' }]}
        >
          {value}
        </Text>
      </View>
      <Pressable onPress={onEdit} hitSlop={8}>
        <Text
          style={[
            t('bodySm'),
            { color: C.n600, fontFamily: 'InstrumentSans-Medium' },
          ]}
        >
          Modifier
        </Text>
      </Pressable>
    </View>
  );
}

function pickupLabel(m: 'home' | 'meeting' | 'shipping') {
  if (m === 'home') return 'Chez moi';
  if (m === 'meeting') return 'Lieu public';
  return 'Livraison';
}
