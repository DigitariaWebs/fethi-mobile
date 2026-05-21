// Location utilities (Nextdoor-style principle).
//
// The whole MyStreet experience pivots on the user's GPS position: feed,
// listings, "à 500 m" labels, search radius. To keep that promise we need:
//
//   1. A reliable permission gate. We always go through `expo-location`'s
//      Foreground request — Nextdoor never asks for "Always" background
//      permission and neither do we, since we only consume location while
//      the user is interacting with the app.
//
//   2. A single getCurrentPosition() with a sensible accuracy preset. We
//      bias towards `Balanced` (~10-50 m on phones, fast TTFF) because we
//      don't need sub-metre precision to draw a 500 m search radius —
//      and battery cost matters for a marketplace people open dozens of
//      times a day.
//
//   3. Reverse geocoding to a *city + neighborhood* label. The display
//      string the user sees in the search bar ("Vieux-Lille") and the
//      filter rings we draw on the map both flow from this. We use Photon
//      (same provider as the address autocomplete in geocode.ts) so the
//      label style stays consistent across the app and we keep zero
//      dependencies on Google / Mapbox SDKs.
//
//   4. A "rough fallback" so the app is never blocked when the user
//      denies. We default to Lille's centroid — same coords already
//      used by the map screen as a baseline. The store layer is what
//      decides whether to surface a denial banner.

import * as Location from 'expo-location';

export type LocationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined';

export type Coords = {
  lat: number;
  lng: number;
};

export type ResolvedLocation = Coords & {
  /** Free-form label, e.g. "12 rue de la Monnaie, 59800 Lille". */
  addressLabel: string | null;
  /** City as returned by the reverse geocoder, e.g. "Lille". */
  city: string | null;
  /**
   * Neighborhood / district. Photon sometimes returns this in `district`
   * and sometimes in `locality`; we prefer the more specific one if both
   * are present (Vieux-Lille > Lille).
   */
  neighborhood: string | null;
  /** Postal code, if available. */
  postcode: string | null;
  /** When this fix was taken — used to decide if we should re-acquire. */
  capturedAt: number;
  /** Best-effort horizontal accuracy in metres (null if unknown). */
  accuracyM: number | null;
};

/** Lille centroid — the only city our beta serves. Used as a soft fallback. */
export const LILLE_FALLBACK: Coords = { lat: 50.6292, lng: 3.0573 };

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

/**
 * Returns the current permission status without triggering the OS prompt.
 * Use this for "we already asked — should we ask again, or send to settings?"
 * decisions.
 */
export async function getLocationPermissionStatus(): Promise<LocationPermissionStatus> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return normalise(status);
}

/**
 * Triggers the native foreground-location prompt. Returns the resulting
 * status so the caller can branch (request blocked vs. user-denied vs.
 * granted). Does NOT throw — every code path returns one of the three
 * statuses.
 */
export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return normalise(status);
}

function normalise(s: Location.PermissionStatus): LocationPermissionStatus {
  if (s === 'granted') return 'granted';
  if (s === 'denied') return 'denied';
  return 'undetermined';
}

// ---------------------------------------------------------------------------
// Current position
// ---------------------------------------------------------------------------

/**
 * Acquire a single GPS fix at "balanced" accuracy. Caller must have
 * already verified the permission is `granted` — we don't trigger a
 * prompt here so this can be safely called from background-ish flows
 * (foreground listener on app focus, etc.).
 *
 * `timeoutMs` is a soft cap: if the OS doesn't return a fix within that
 * window we resolve with `null` rather than spinning forever, so the
 * UI can fall back to Lille's centroid.
 */
export async function getCurrentCoords(
  timeoutMs = 8000,
): Promise<(Coords & { accuracyM: number | null }) | null> {
  try {
    const pos = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      timeoutMs,
    );
    if (!pos) return null;
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracyM: pos.coords.accuracy ?? null,
    };
  } catch (err) {
    console.warn('[location] getCurrentCoords failed', err);
    return null;
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      resolve(null);
    }, ms);
    p.then((v) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(v);
    }).catch(() => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(null);
    });
  });
}

// ---------------------------------------------------------------------------
// Reverse geocoding (Photon)
// ---------------------------------------------------------------------------
//
// Photon's `reverse` endpoint returns the nearest features to a given
// lat/lng, ordered by distance. We take the first result that has at
// least a city or a name — that's the human label we want to show.

const PHOTON_REVERSE = 'https://photon.komoot.io/reverse';

/**
 * Reverse-geocode a coordinate pair. Returns null if the network call
 * fails or the response has no usable feature — callers should fall back
 * to whatever city/neighborhood they had cached.
 */
export async function reverseGeocode(
  coords: Coords,
  signal?: AbortSignal,
): Promise<{
  addressLabel: string | null;
  city: string | null;
  neighborhood: string | null;
  postcode: string | null;
} | null> {
  try {
    const url = new URL(PHOTON_REVERSE);
    url.searchParams.set('lat', String(coords.lat));
    url.searchParams.set('lon', String(coords.lng));
    url.searchParams.set('lang', 'fr');
    url.searchParams.set('limit', '1');

    const res = await fetch(url.toString(), { signal });
    if (!res.ok) return null;
    const data: PhotonReverseResponse = await res.json();
    const f = data.features?.[0];
    if (!f) return null;
    const p = f.properties ?? {};

    const street = [p.housenumber, p.street].filter(Boolean).join(' ');
    const cityLine = [p.postcode, p.city].filter(Boolean).join(' ');
    const addressLabel =
      [street || p.name, cityLine].filter(Boolean).join(', ') || null;

    // Photon sometimes nests the neighborhood under `district` (Paris
    // arrondissements, Lille quartiers) and sometimes under `locality`
    // (smaller communes). Prefer the more specific one.
    const neighborhood = p.district ?? p.locality ?? p.suburb ?? null;

    return {
      addressLabel,
      city: p.city ?? null,
      neighborhood,
      postcode: p.postcode ?? null,
    };
  } catch (err) {
    console.warn('[location] reverseGeocode failed', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// One-shot resolve: permission → fix → reverse-geocode → ResolvedLocation
// ---------------------------------------------------------------------------

/**
 * High-level convenience: ask permission, take a fix, reverse-geocode it,
 * and return a fully-resolved location. The caller can decide what to do
 * with each failure mode based on the returned status.
 *
 *   - status === 'granted' + location != null → happy path
 *   - status === 'granted' + location == null → permission OK but GPS
 *     fix timed out (basement / airplane mode). Caller can re-try later.
 *   - status === 'denied' → user dismissed the prompt. Caller should
 *     show a "you can change this in Settings" banner.
 */
export async function resolveLocation(): Promise<{
  status: LocationPermissionStatus;
  location: ResolvedLocation | null;
}> {
  const status = await requestLocationPermission();
  if (status !== 'granted') {
    return { status, location: null };
  }
  const coords = await getCurrentCoords();
  if (!coords) {
    return { status, location: null };
  }
  const rg = await reverseGeocode(coords);
  return {
    status,
    location: {
      lat: coords.lat,
      lng: coords.lng,
      accuracyM: coords.accuracyM,
      addressLabel: rg?.addressLabel ?? null,
      city: rg?.city ?? null,
      neighborhood: rg?.neighborhood ?? null,
      postcode: rg?.postcode ?? null,
      capturedAt: Date.now(),
    },
  };
}

// ---------------------------------------------------------------------------
// Photon response shapes
// ---------------------------------------------------------------------------

type PhotonReverseResponse = {
  features?: Array<{
    geometry?: { coordinates?: [number, number] };
    properties?: PhotonReverseProperties;
  }>;
};

type PhotonReverseProperties = {
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  postcode?: string;
  country?: string;
  district?: string;
  locality?: string;
  suburb?: string;
};
