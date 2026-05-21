// useFavorites — gestion des annonces favorites de l'user.
//
// On expose:
//   - `useFavoriteIds()` : Set<string> de tous les listingIds en favori
//     (utilise pour afficher le coeur plein/vide sur les cartes du feed)
//   - `useFavorites()`   : page complete des Listings favoris (pour /favorites)
//   - `useToggleFavorite(listingId)` : mutation optimistic (UI repond en 0ms)
//
// Strategie cache :
//   - Query key 'favorites:ids' garde le Set en cache 5 min
//   - Le toggle invalide a la fois 'favorites:ids' ET la page 'favorites:list'
//     pour que l'ecran "Mes favoris" recharge sans flash.
//   - L'animation du coeur joue avant la reponse backend grace au pattern
//     onMutate (rollback si la requete plante).

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { favoritesApi } from '@/lib/api';

export const FAVORITE_IDS_KEY = ['favorites', 'ids'] as const;
export const FAVORITES_LIST_KEY = ['favorites', 'list'] as const;

/**
 * Hook leger pour les cartes du feed : retourne un Set immutable des
 * listingIds favoris. Une seule requete pour toute la session.
 */
export function useFavoriteIds() {
  const query = useQuery({
    queryKey: FAVORITE_IDS_KEY,
    queryFn: async () => {
      const res = await favoritesApi.ids();
      return new Set(res.ids);
    },
    staleTime: 5 * 60 * 1000,
    retry: 0, // si 401 (deconnecte), pas de retry
  });
  return query.data ?? new Set<string>();
}

/** Liste paginee des Listings favoris (ecran /favorites). */
export function useFavoritesList() {
  return useQuery({
    queryKey: FAVORITES_LIST_KEY,
    queryFn: () => favoritesApi.list(0, 50),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook pour le coeur sur une card. {@code isFavorite} est lu dans le cache
 * partage, {@code toggle()} fait du *optimistic* update (le cache change avant
 * la requete) pour une UX sans latence.
 */
export function useToggleFavorite(listingId: string) {
  const queryClient = useQueryClient();
  const ids = useFavoriteIds();
  const isFavorite = ids.has(listingId);

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      if (next) {
        await favoritesApi.add(listingId);
      } else {
        await favoritesApi.remove(listingId);
      }
    },
    onMutate: async (next: boolean) => {
      await queryClient.cancelQueries({ queryKey: FAVORITE_IDS_KEY });
      const prev = queryClient.getQueryData<Set<string>>(FAVORITE_IDS_KEY);
      const nextSet = new Set(prev ?? []);
      if (next) nextSet.add(listingId);
      else nextSet.delete(listingId);
      queryClient.setQueryData(FAVORITE_IDS_KEY, nextSet);
      return { prev };
    },
    onError: (_err, _next, ctx) => {
      // Rollback si l'API a plante
      if (ctx?.prev) queryClient.setQueryData(FAVORITE_IDS_KEY, ctx.prev);
    },
    onSettled: () => {
      // On invalide la liste paginee — la sidebar peut etre obsolete
      queryClient.invalidateQueries({ queryKey: FAVORITES_LIST_KEY });
    },
  });

  const toggle = useCallback(() => {
    mutation.mutate(!isFavorite);
  }, [mutation, isFavorite]);

  return { isFavorite, toggle, pending: mutation.isPending };
}
