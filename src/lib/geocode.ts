// Address autocomplete restricted to Lille, France.
//
// Uses Photon (https://photon.komoot.io) — a free, no-API-key OSM-backed
// geocoder optimised for typeahead search. Photon biases by lat/lon but
// doesn't strictly bbox, so we filter the response client-side to results
// whose `city` is "Lille". For a wider Lille-métropole launch later, swap
// the city filter for a postcode-prefix check (`p.postcode?.startsWith('59')`)
// or an explicit list of communes.
//
// Photon's usage policy is "be reasonable, no commercial spam." For
// MyStreet's beta this is fine; if we exceed soft limits we can swap to a
// self-hosted Photon instance or MapBox/Google Places without changing
// callers (they consume `GeocodeResult` only).

export type GeocodeResult = {
  id: string;
  label: string;        // "12 rue de la Monnaie, 59800 Lille"
  street?: string;
  housenumber?: string;
  city: string;
  postcode?: string;
  lat: number;
  lng: number;
};

const PHOTON = 'https://photon.komoot.io/api/';

// Lille city center — bias point for the search.
const LILLE = { lat: 50.6292, lng: 3.0573 };

export async function searchAddressesInLille(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL(PHOTON);
  url.searchParams.set('q', q);
  url.searchParams.set('lat', String(LILLE.lat));
  url.searchParams.set('lon', String(LILLE.lng));
  url.searchParams.set('zoom', '14');
  url.searchParams.set('limit', '15');
  url.searchParams.set('lang', 'fr');

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    throw new Error(`Geocode failed: ${res.status}`);
  }

  const data: PhotonResponse = await res.json();
  const features = data.features ?? [];

  return features
    .map((f): GeocodeResult | null => {
      const p = f.properties ?? ({} as PhotonProperties);
      const coords = f.geometry?.coordinates;
      if (!coords || coords.length < 2) return null;
      const [lng, lat] = coords;
      if (typeof lat !== 'number' || typeof lng !== 'number') return null;
      // Lille only.
      if (p.city !== 'Lille') return null;
      // Skip results without a street — they're cities/regions, not addresses.
      if (!p.street && !p.name) return null;

      const street = [p.housenumber, p.street].filter(Boolean).join(' ');
      const cityLine = [p.postcode, p.city].filter(Boolean).join(' ');
      const label = [street || p.name, cityLine].filter(Boolean).join(', ');

      const id =
        p.osm_id != null && p.osm_type
          ? `${p.osm_type}:${p.osm_id}`
          : `${lat.toFixed(6)},${lng.toFixed(6)}`;

      return {
        id,
        label,
        street: p.street,
        housenumber: p.housenumber,
        city: p.city,
        postcode: p.postcode,
        lat,
        lng,
      };
    })
    .filter((x): x is GeocodeResult => x != null)
    .slice(0, 8);
}

type PhotonResponse = {
  features?: Array<{
    geometry?: { coordinates?: [number, number] };
    properties?: PhotonProperties;
  }>;
};

type PhotonProperties = {
  osm_id?: number;
  osm_type?: string;
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  postcode?: string;
  country?: string;
};
