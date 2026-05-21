// useMyListings — the listings owned by the current user.
//
// Wraps `GET /listings?ownerId=<me>` in a React Query keyed off `me.id`,
// so the query auto-runs once we know who's logged in and auto-invalidates
// when the user signs out (queryKey changes -> different cache entry).
//
// Display lifecycle:
//   - me undefined (auth still loading)   -> hook is disabled, `data` is undefined
//   - me defined, listings loading        -> isLoading true, data undefined
//   - me defined, listings empty          -> data.content is []
//   - me defined, listings present        -> data.content is the array
//
// Filtering: we ask the backend for *all* statuses (DRAFT, ACTIVE, PAUSED,
// SOLD, ARCHIVED) so the profile tab can show the user paused/sold items
// too. UI filters by `status` client-side.

import { useQuery } from '@tanstack/react-query';

import {
  listingsApi,
  type Listing,
  type PageResponse,
} from '@/lib/api';
import { useMe } from './useMe';

export function useMyListings() {
  const me = useMe();
  const ownerId = me.data?.id;

  return useQuery<PageResponse<Listing>>({
    queryKey: ['my-listings', ownerId],
    queryFn: () => listingsApi.list({ ownerId, size: 100 }),
    enabled: !!ownerId,
    staleTime: 60 * 1000,
  });
}
