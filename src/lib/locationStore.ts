// Persistent location store (Nextdoor-style).
//
// Why a store at all, instead of just calling expo-location everywhere?
//   - Every screen that filters by proximity (map, search, feed) needs
//     the same coords. Doing a GPS fix on every mount is slow (~1-2s)
//     and drains battery.
//   - We want the user's last-known city/neighborhood to survive a
//     cold start so the search bar can show "Vieux-Lille" *before*
//     the GPS even fires.
//   - When the user denies permission we still need *some* coords for
//     the map; the store holds the Lille fallback in that case so
//     downstream code doesn't have to branch.
//
// Persistence is AsyncStorage-backed (same pattern as `sellDraft.ts`).
// We don't persist the *raw* permission status — that's a property of
// the OS, not our app, and we re-check it on every mount via
// `getLocationPermissionStatus()`.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import {
  LILLE_FALLBACK,
  type LocationPermissionStatus,
  type ResolvedLocation,
} from './location';

const STORAGE_KEY = 'mystreet:userLocation:v1';

type State = {
  /** Last known location. `null` until the user grants permission once. */
  location: ResolvedLocation | null;
  /**
   * Cached permission status from the last check. UI uses this to decide
   * whether to show a "go to Settings" banner. We refresh it on every
   * `refreshPermission()` call (typically at app focus).
   */
  permission: LocationPermissionStatus;
  /** True while a `resolve()` is in flight — disables CTA buttons. */
  resolving: boolean;
  /** Has the persisted state finished hydrating from AsyncStorage? */
  hydrated: boolean;

  // ---- actions ----------------------------------------------------------
  /** Replace the cached location (after a successful GPS+reverse-geocode). */
  setLocation: (loc: ResolvedLocation) => void;
  /** Forget the cached location (e.g. user signed out). */
  clearLocation: () => void;
  /** Update just the permission status (after the user toggled it in Settings). */
  setPermission: (s: LocationPermissionStatus) => void;
  /** Toggle the "resolving" flag during async work. */
  setResolving: (b: boolean) => void;
};

export const useLocationStore = create<State>((set, get) => ({
  location: null,
  permission: 'undetermined',
  resolving: false,
  hydrated: false,

  setLocation: (loc) => {
    set({ location: loc });
    persist({ location: loc });
  },
  clearLocation: () => {
    set({ location: null });
    persist({ location: null });
  },
  setPermission: (s) => {
    set({ permission: s });
  },
  setResolving: (b) => set({ resolving: b }),
}));

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

/**
 * Coords the rest of the app should use. Falls back to Lille's centroid
 * if we never got a real fix — that way the map always has *something*
 * to centre on, even before onboarding.
 */
export function useEffectiveCoords(): { lat: number; lng: number; isReal: boolean } {
  const loc = useLocationStore((s) => s.location);
  if (loc) return { lat: loc.lat, lng: loc.lng, isReal: true };
  return { ...LILLE_FALLBACK, isReal: false };
}

/**
 * Human label for the search bar ("Vieux-Lille" / "Lille" / "Près de toi").
 * Prefers neighborhood > city > "Près de toi".
 */
export function useLocationLabel(): string {
  const loc = useLocationStore((s) => s.location);
  if (!loc) return 'Près de toi';
  return loc.neighborhood ?? loc.city ?? 'Près de toi';
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------
//
// We persist *only* the `location` field. Permission status is an OS-level
// concern and we re-derive it on every mount; `resolving` is transient.

type Persisted = {
  location: ResolvedLocation | null;
};

async function persist(snapshot: Persisted) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn('[locationStore] persist failed', err);
  }
}

/**
 * Hydrate the store from AsyncStorage. Call this once at app boot
 * (e.g. from `_layout.tsx`). Safe to call multiple times — it no-ops
 * once `hydrated` is true.
 */
export async function hydrateLocationStore(): Promise<void> {
  if (useLocationStore.getState().hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted;
      if (parsed.location) {
        useLocationStore.setState({ location: parsed.location });
      }
    }
  } catch (err) {
    console.warn('[locationStore] hydrate failed', err);
  } finally {
    useLocationStore.setState({ hydrated: true });
  }
}
