import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { EmptyState, Icon, MSPill, PageHeader } from '@/components';
import { LISTINGS } from '@/lib/fixtures';
import { useToast } from '@/lib/toast';

// Aggregate dashboard for everything the user is selling, renting, or
// offering. Tabs sub-filter by status; each row exposes quick actions.
type Tab = 'active' | 'drafts' | 'paused' | 'sold';

// Mock distribution across statuses — backend would return real flags.
const STATUS_BY_ID: Record<string, 'active' | 'paused' | 'sold' | 'drafts'> = {
  '1': 'active',
  'r1': 'active',
  's1': 'active',
  '4': 'paused',
  '6': 'sold',
};

export default function MyListings() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('active');
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  // Filter from the global LISTINGS by mock status. Drafts come from the
  // saved sell-draft store separately (none here — would be wired in
  // when the backend ships drafts).
  const visible = useMemo(() => {
    if (tab === 'drafts') return [] as typeof LISTINGS;
    return LISTINGS.filter((l) => (STATUS_BY_ID[l.id] ?? 'active') === tab);
  }, [tab]);

  const counts = useMemo(
    () => ({
      active: LISTINGS.filter((l) => (STATUS_BY_ID[l.id] ?? 'active') === 'active').length,
      drafts: 0,
      paused: LISTINGS.filter((l) => STATUS_BY_ID[l.id] === 'paused').length,
      sold: LISTINGS.filter((l) => STATUS_BY_ID[l.id] === 'sold').length,
    }),
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader
        title="Tes annonces"
        trailing={
          <Pressable
            onPress={() => router.push('/sell/type' as any)}
            hitSlop={6}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: C.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.Plus size={18} color="#FFF" />
          </Pressable>
        }
      />

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        {(['active', 'drafts', 'paused', 'sold'] as const).map((id) => (
          <MSPill
            key={id}
            size="sm"
            selected={tab === id}
            onPress={() => setTab(id)}
          >
            {`${labelFor(id)} · ${counts[id]}`}
          </MSPill>
        ))}
      </View>

      {visible.length === 0 ? (
        <EmptyState
          title={emptyCopyFor(tab).title}
          description={emptyCopyFor(tab).body}
          cta={
            tab === 'drafts'
              ? undefined
              : { label: 'Publier une annonce', onPress: () => router.push('/sell/type' as any), icon: <Icon.Plus size={18} color="#FFF" /> }
          }
        />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
          }
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {visible.map((l) => {
            const status = STATUS_BY_ID[l.id] ?? 'active';
            return (
              <Pressable
                key={l.id}
                onPress={() => router.push(`/seller/${l.id}` as any)}
                style={[
                  Sh.subtle,
                  {
                    flexDirection: 'row',
                    gap: 12,
                    padding: 12,
                    backgroundColor: C.surface,
                    borderRadius: R.lg,
                    borderWidth: 1,
                    borderColor: C.divider,
                  },
                ]}
              >
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: l.thumb }}
                    style={{ width: 80, height: 80, borderRadius: R.md }}
                    contentFit="cover"
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -6,
                      left: -6,
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 999,
                      backgroundColor:
                        l.listingType === 'rental'
                          ? '#2F6B5E'
                          : l.listingType === 'service'
                            ? C.warning
                            : C.ink,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFF',
                        fontSize: 9,
                        fontFamily: 'InstrumentSans-Bold',
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                      }}
                    >
                      {l.listingType === 'sale' ? 'Vente' : l.listingType === 'rental' ? 'Location' : 'Service'}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={2}
                    style={[
                      t('body'),
                      { fontFamily: 'InstrumentSans-SemiBold', color: C.ink, lineHeight: 19 },
                    ]}
                  >
                    {l.title}
                  </Text>
                  <Text style={[t('caption'), { color: C.n500, marginTop: 4 }]}>
                    {l.priceLabel}
                    {status === 'sold' ? ' · vendu à l\'acheteur' : ''}
                    {status === 'paused' ? ' · en pause' : ''}
                  </Text>
                  {status === 'active' ? (
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                      <Stat icon={<Icon.Eye size={11} color={C.n500} />} label="127" />
                      <Stat icon={<Icon.Star size={10} color={C.n500} />} label="14" />
                      <Stat icon={<Icon.Chat size={11} color={C.n500} />} label="4" />
                    </View>
                  ) : null}
                </View>
                <Pressable
                  onPress={() =>
                    toast.info('Actions rapides bientôt — appui long sur une ligne.')
                  }
                  hitSlop={6}
                  style={{ paddingHorizontal: 6, justifyContent: 'center' }}
                >
                  <Icon.Dots size={16} color={C.n500} />
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  const C = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {icon}
      <Text style={[t('caption'), { color: C.n500 }]}>{label}</Text>
    </View>
  );
}

function labelFor(t: Tab) {
  return t === 'active' ? 'Actives' : t === 'drafts' ? 'Brouillons' : t === 'paused' ? 'En pause' : 'Vendues';
}

function emptyCopyFor(t: Tab) {
  if (t === 'drafts') return { title: 'Aucun brouillon.', body: 'Tout ce que tu commences depuis l\'écran de publication sera enregistré ici quand tu appuies sur « Enregistrer et quitter ».' };
  if (t === 'paused') return { title: 'Rien en pause.', body: 'Les annonces que tu mets en pause apparaissent ici pour que tu puisses les reprendre plus tard.' };
  if (t === 'sold') return { title: 'Rien de vendu pour le moment.', body: 'Quand quelque chose se vend, ça apparaît ici avec les détails de la transaction.' };
  return { title: 'Aucune annonce active.', body: 'Publie ton premier objet, location ou service pour rencontrer tes voisins.' };
}
