// useMe — single source of truth for the logged-in user.
//
// Wraps `GET /me` in a React Query so:
//   - Every screen that needs the current user shares one network call.
//   - The cache survives navigation between tabs (no flash of "Julie M.").
//   - Mutations elsewhere can invalidate the cache and trigger a fresh
//     fetch (e.g. profile update, avatar upload).
//
// Why not just read from the Zustand session store? Because `useSession`
// holds *onboarding* data that the user typed locally (address picker,
// chosen display name). `/me` is the backend's truth — it includes status,
// KYC, server-side rating, and the canonical lat/lng/neighborhood. Two
// different concerns: onboarding intent vs. backend identity.
//
// Display fallback chain (least → most authoritative):
//   1. Fixture "Julie M." (legacy — should never surface for a logged-in
//      user; only matters during the very first paint pre-hydration).
//   2. Zustand session (`displayName`, `address`) — local onboarding choices.
//   3. /me (`displayName`, `addressLabel`, `city`, `neighborhood`) — what
//      the backend stored. This is what we surface anywhere we can.

import { useQuery } from '@tanstack/react-query';

import { meApi, type MeResponse } from '@/lib/api';

export const ME_QUERY_KEY = ['me'] as const;

/**
 * Fetch /me. Returns `undefined` while loading or if the user is signed
 * out — components can check `isLoading` and fall back to a placeholder.
 *
 * `enabled` defaults to `true`; pass `false` from screens where we know
 * the user is signed-out (e.g. auth flows) to avoid a 401 round-trip.
 */
export function useMe(options?: { enabled?: boolean }) {
  return useQuery<MeResponse>({
    queryKey: ME_QUERY_KEY,
    queryFn: () => meApi.get(),
    staleTime: 5 * 60 * 1000, // 5 min — /me changes infrequently
    retry: (failureCount, err: unknown) => {
      // 401 = signed out, don't retry. Everything else gets one retry.
      const status = (err as { status?: number } | null)?.status;
      if (status === 401) return false;
      return failureCount < 1;
    },
    enabled: options?.enabled ?? true,
  });
}

/**
 * First-name display helper. Splits at the first space, falls back to
 * the full display name, then "Toi" — never returns an empty string.
 */
export function meFirstName(me: MeResponse | undefined): string {
  if (!me?.displayName) return 'Toi';
  return me.displayName.split(' ')[0] || me.displayName;
}

/**
 * The most specific location label we have for the user. Prefers
 * neighborhood > city > addressLabel > a generic "Près de toi".
 */
export function meLocationLabel(me: MeResponse | undefined): string {
  if (!me) return 'Près de toi';
  return me.neighborhood ?? me.city ?? me.addressLabel ?? 'Près de toi';
}
