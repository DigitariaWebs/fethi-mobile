// Mes annonces — dashboard du vendeur.
//
// Toutes les annonces du user (toutes statuts confondus) viennent de
// useMyListings(), puis on les filtre client-side par onglet. Les compteurs
// affiches sur les pills sont calcules en live depuis la meme source.
//
// Onglets:
//   - active   : ListingStatus.ACTIVE
//   - drafts   : ListingStatus.DRAFT
//   - paused   : ListingStatus.PAUSED
//   - sold     : ListingStatus.SOLD + ARCHIVED (le user voit tout son historique)

import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { EmptyState, Icon, MSPill, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';
import { useMyListings } from '@/hooks/useMyListings';
import {
  formatListingPrice,
  listingMainPhoto,
  type Listing,
  type ListingStatus,
  type ListingType,
} from '@/lib/api';

type Tab = 'active' | 'drafts' | 'paused' | 'sold';

const STATUS_FILTER: Record<Tab, (s: ListingStatus) => boolean> = {
  active: (s) => s === 'ACTIVE',
  drafts: (s) => s === 'DRAFT',
  paused: (s) => s === 'PAUSED',
  sold: (s) => s === 'SOLD' || s === 'ARCHIVED',
};

function typeTagColor(type: ListingType, C: ReturnType<typeof useColors>): string {
  if (type === 'LOCATION') return '#2F6B5E';
  if (type === 'SERVICE') return C.warning;
  return C.ink;
}
function typeLabel(type: ListingType): string {
  return type === 'VENTE' ? 'Vente' : type === 'LOCATION' ? 'Location' : 'Service';
}

export default function MyListings() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const myListings = useMyListings();
  const [tab, setTab] = useState<Tab>('active');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const allListings = myListings.data?.content ?? [];

  // Filtre selon l'onglet — `useMemo` evite de recomputer a chaque render.
  const visible = useMemo(
    () => allListings.filter((l) => STATUS_FILTER[tab](l.status)),
    [allListings, tab],
  );

  // Compteurs pour les pills (calcules en une passe)
  const counts = useMemo(() => {
    const c = { active: 0, drafts: 0, paused: 0, sold: 0 };
    for (const l of allListings) {
      if (STATUS_FILTER.active(l.status)) c.active++;
      else if (STATUS_FILTER.drafts(l.status)) c.drafts++;
      else if (STATUS_FILTER.paused(l.status)) c.paused++;
      else if (STATUS_FILTER.sold(l.status)) c.sold++;
    }
    return c;
  }, [allListings]);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader
        title="Tes annonces"
        trailing={
          <Pressable
            onPress={() => router.push('/sell/type' as any)}
            hitSlop={6}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: C.primary,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon.Plus size={18} color="#FFF" />
          </Pressable>
        }
      />

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row', gap: 8,
          paddingHorizontal: 20, paddingVertical: 12,
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

      {/* Loading skeleton (cold start) */}
      {myListings.isLoading && allListings.length === 0 ? (
        <View style={{ padding: 16, gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View
              key={`sk-${i}`}
              style={{
                height: 104, borderRadius: R.lg,
                backgroundColor: C.n50, borderWidth: 1, borderColor: C.divider,
              }}
            />
          ))}
        </View>
      ) : null}

      {!myListings.isLoading && visible.length === 0 ? (
        <EmptyState
          title={emptyCopyFor(tab).title}
          description={emptyCopyFor(tab).body}
          cta={
            tab === 'drafts'
              ? undefined
              : { label: 'Publier une annonce', onPress: () => router.push('/sell/type' as any), icon: <Icon.Plus size={18} color="#FFF" /> }
          }
        />
      ) : null}

      {visible.length > 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
          }
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {visible.map((l: Listing) => (
            <Pressable
              key={l.id}
              onPress={() => router.push(`/seller/${l.id}` as any)}
              style={[
                Sh.subtle,
                {
                  flexDirection: 'row', gap: 12, padding: 12,
                  backgroundColor: C.surface, borderRadius: R.lg,
                  borderWidth: 1, borderColor: C.divider,
                },
              ]}
            >
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: listingMainPhoto(l) }}
                  style={{ width: 80, height: 80, borderRadius: R.md }}
                  contentFit="cover"
                />
                <View
                  style={{
                    position: 'absolute', bottom: -6, left: -6,
                    paddingHorizontal: 7, paddingVertical: 2,
                    borderRadius: 999,
                    backgroundColor: typeTagColor(l.listingType, C),
                  }}
                >
                  <Text
                    style={{
                      color: '#FFF', fontSize: 9,
                      fontFamily: 'InstrumentSans-Bold',
                      letterSpacing: 0.4, textTransform: 'uppercase',
                    }}
                  >
                    {typeLabel(l.listingType)}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={2}
                  style={[t('body'), { fontFamily: 'InstrumentSans-SemiBold', color: C.ink, lineHeight: 19 }]}
                >
                  {l.title}
                </Text>
                <Text style={[t('caption'), { color: C.n500, marginTop: 4 }]}>
                  {formatListingPrice(l)}
                  {l.status === 'SOLD' || l.status === 'ARCHIVED' ? ' · vendu' : ''}
                  {l.status === 'PAUSED' ? ' · en pause' : ''}
                  {l.status === 'DRAFT' ? ' · brouillon' : ''}
                </Text>
                {l.status === 'ACTIVE' ? (
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                    <Stat icon={<Icon.Eye size={11} color={C.n500} />} label={String(l.viewCount ?? 0)} />
                    <Stat icon={<Icon.Star size={10} color={C.n500} />} label={String(l.favoritesCount ?? 0)} />
                  </View>
                ) : null}
              </View>
              <Pressable
                onPress={() => toast.info('Actions rapides bientôt — appui long sur une ligne.')}
                hitSlop={6}
                style={{ paddingHorizontal: 6, justifyContent: 'center' }}
              >
                <Icon.Dots size={16} color={C.n500} />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
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
