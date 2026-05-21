/**
 * Client API mobile pour le backend MyStreet (Spring Boot).
 *
 * Particularités mobile :
 *  - URL de base auto-résolue (emulateur, device, web) via Expo Constants
 *  - Access token en mémoire + AsyncStorage (lectures rapides)
 *  - Refresh token en SecureStore (chiffré matériel iOS/Android)
 *  - Parse les erreurs typées du backend (ApiError)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Secure storage cross-platform
// ---------------------------------------------------------------------------
//
// expo-secure-store n'existe pas sur web : SecureStore.setItemAsync /
// getItemAsync rejettent avec une erreur "not supported on this platform".
// Sur web on retombe sur localStorage (suffisant pour dev — en prod un
// vrai cookie httpOnly serait plus sur).

const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return typeof window !== 'undefined'
          ? window.localStorage.getItem(key)
          : null;
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      } catch {}
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      } catch {}
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------

/**
 * Backend disponible sur :8080 du **host de dev**.
 *
 * Stratégie :
 *  1. EXPO_PUBLIC_API_URL si défini (override explicite)
 *  2. Expo Go / device physique : on récupère l'IP LAN de Metro
 *     (hostUri = "192.168.1.42:8081") → backend = "http://192.168.1.42:8080"
 *  3. Android emulator : hostUri = "10.0.2.2:8081"
 *  4. iOS simulator / web : hostUri = "localhost:8081"
 */
function resolveApiBase(): string {
  // CAS WEB : on est servi depuis le meme PC que le backend.
  // On utilise le meme hostname que la page courante (localhost en dev),
  // ce qui evite de devoir mettre a jour le .env a chaque changement WiFi.
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:8080`;
  }

  // CAS NATIVE (iOS / Android) : besoin de l'IP LAN du PC, pas localhost
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  const hostUri =
    (Constants as any).expoConfig?.hostUri ??
    (Constants as any).manifest?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri && typeof hostUri === 'string') {
    const host = hostUri.split(':')[0];
    return `http://${host}:8080`;
  }

  // Dernier recours
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
  return 'http://localhost:8080';
}

export const API_BASE = resolveApiBase();

if (__DEV__) {
  // Aide au debug réseau : visible dans la console Expo
  // eslint-disable-next-line no-console
  console.log('[api] API_BASE =', API_BASE);
}

// ---------------------------------------------------------------------------
// Token store
// ---------------------------------------------------------------------------

const ACCESS_KEY = 'ms.accessToken';
const ACCESS_EXP_KEY = 'ms.accessTokenExp';
const USER_KEY = 'ms.userId';
const REFRESH_KEY = 'ms.refreshToken';

let accessTokenCache: string | null = null;

// ---------------------------------------------------------------------------
// Event bus pour signaler une session devenue obsolete (STALE_SESSION)
// ---------------------------------------------------------------------------
// L'api.ts ne peut pas naviguer (pas de router). On expose un listener
// que le root layout peut brancher pour rediriger vers /auth/email.
type StaleSessionListener = () => void;
const staleSessionListeners = new Set<StaleSessionListener>();

export function onStaleSession(fn: StaleSessionListener): () => void {
  staleSessionListeners.add(fn);
  return () => {
    staleSessionListeners.delete(fn);
  };
}

function emitStaleSession() {
  staleSessionListeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

export const tokenStore = {
  async getAccess(): Promise<string | null> {
    if (accessTokenCache) return accessTokenCache;
    const v = await AsyncStorage.getItem(ACCESS_KEY);
    accessTokenCache = v;
    return v;
  },
  async getUserId(): Promise<string | null> {
    return AsyncStorage.getItem(USER_KEY);
  },
  async getRefresh(): Promise<string | null> {
    return secureStorage.getItem(REFRESH_KEY);
  },
  async set(tokens: AuthTokensResponse): Promise<void> {
    accessTokenCache = tokens.accessToken;
    const expEpoch = Date.now() + tokens.accessTokenExpiresIn * 1000;
    await Promise.all([
      AsyncStorage.setItem(ACCESS_KEY, tokens.accessToken),
      AsyncStorage.setItem(ACCESS_EXP_KEY, String(expEpoch)),
      AsyncStorage.setItem(USER_KEY, tokens.userId),
      secureStorage.setItem(REFRESH_KEY, tokens.refreshToken),
    ]);
  },
  async clear(): Promise<void> {
    accessTokenCache = null;
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_KEY),
      AsyncStorage.removeItem(ACCESS_EXP_KEY),
      AsyncStorage.removeItem(USER_KEY),
      secureStorage.deleteItem(REFRESH_KEY).catch(() => {}),
    ]);
  },
};

// ---------------------------------------------------------------------------
// Erreurs typées
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types communs
// ---------------------------------------------------------------------------

/** Univers metier (correspond a OtpChannel coté listings, categories, etc.). */
export type ListingType = 'VENTE' | 'LOCATION' | 'SERVICE';

/** Reponse paginee standard (matche common/web/PageResponse cote backend). */
export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors?: { field: string; message: string }[];

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors?: { field: string; message: string }[],
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

// ---------------------------------------------------------------------------
// Fetch wrapper
// ---------------------------------------------------------------------------

// Pour eviter plusieurs refresh en parallele si plusieurs requetes 401 arrivent
// en meme temps : on partage une seule Promise de refresh.
let refreshPromise: Promise<AuthTokensResponse> | null = null;

async function refreshOnce(): Promise<AuthTokensResponse> {
  if (!refreshPromise) {
    refreshPromise = authApi.refresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean; _retry?: boolean } = { auth: true },
): Promise<T> {
  const headers = new Headers(init.headers);
  if (
    !headers.has('Content-Type') &&
    init.body &&
    !(init.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false) {
    const token = await tokenStore.getAccess();
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(
        `[api] ${init.method ?? 'GET'} ${path} - token =`,
        token ? `${token.slice(0, 25)}...` : 'NULL (pas connecte)',
      );
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  // Token expire OU compte fantome (STALE_SESSION) : on tente un refresh
  // + rejoue la requete une fois. Si refresh fail -> clear + throw 401
  // SANS retry pour ne pas boucler.
  if (
    (res.status === 401 || res.status === 403) &&
    options.auth !== false &&
    !options._retry
  ) {
    let staleSession = false;
    try {
      // Si le backend a explicitement dit que la session est obsolete
      // (STALE_SESSION), on saute le refresh (qui echouera aussi).
      const cloned = res.clone();
      const body = await cloned.json().catch(() => null);
      if (body?.code === 'STALE_SESSION' || body?.code === 'NO_REFRESH') {
        staleSession = true;
      }
    } catch {
      // ignore
    }

    if (!staleSession) {
      try {
        await refreshOnce();
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.info('[api] token rafraichi, rejeu de', path);
        }
        return request<T>(path, init, { ...options, _retry: true });
      } catch (refreshErr) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[api] refresh failed pour', path, refreshErr);
        }
        staleSession = true;
      }
    }

    if (staleSession) {
      // Session obsolete : clear tout + emit event pour forcer la redirection
      // depuis le root layout. Important : on NE rejoue PAS la requete,
      // sinon boucle infinie.
      await tokenStore.clear();
      emitStaleSession();
    }
  }

  if (__DEV__ && !res.ok) {
    // eslint-disable-next-line no-console
    console.warn(`[api] ${init.method ?? 'GET'} ${path} -> ${res.status}`);
  }

  if (!res.ok) await throwApiError(res);
  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return (await res.text()) as unknown as T;
}

async function throwApiError(res: Response): Promise<never> {
  let body: any = {};
  try {
    body = await res.json();
  } catch {
    // pas de JSON
  }
  throw new ApiError(
    res.status,
    body?.code ?? 'UNKNOWN',
    body?.message ?? `HTTP ${res.status}`,
    body?.fieldErrors,
  );
}

// ---------------------------------------------------------------------------
// Types backend
// ---------------------------------------------------------------------------

export type OtpChannel = 'EMAIL' | 'SMS';
export type OtpPurpose =
  | 'SIGNUP'
  | 'LOGIN'
  | 'CHANGE_EMAIL'
  | 'CHANGE_PHONE'
  | 'RESET_PASSWORD';

export type AuthTokensResponse = {
  userId: string;
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
};

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const authApi = {
  /** Envoie un code OTP (par e-mail ou SMS). */
  requestOtp: (params: {
    channel: OtpChannel;
    target: string;
    purpose?: OtpPurpose;
  }) =>
    request<{ status: string }>(
      '/auth/otp',
      {
        method: 'POST',
        body: JSON.stringify({
          channel: params.channel,
          target: params.target,
          purpose: params.purpose ?? 'LOGIN',
        }),
      },
      { auth: false },
    ),

  /** Vérifie le code et reçoit les tokens. Le purpose côté backend gère login OU signup. */
  async verifyOtp(params: {
    channel: OtpChannel;
    target: string;
    code: string;
    purpose?: OtpPurpose;
  }): Promise<AuthTokensResponse> {
    const tokens = await request<AuthTokensResponse>(
      '/auth/verify',
      {
        method: 'POST',
        body: JSON.stringify({
          channel: params.channel,
          target: params.target,
          code: params.code,
          purpose: params.purpose ?? 'LOGIN',
        }),
      },
      { auth: false },
    );
    await tokenStore.set(tokens);
    return tokens;
  },

  /** Rafraîchit l'access token. À appeler sur 401. */
  async refresh(): Promise<AuthTokensResponse> {
    const refresh = await tokenStore.getRefresh();
    if (!refresh) {
      throw new ApiError(401, 'NO_REFRESH', 'Pas de refresh token');
    }
    const tokens = await request<AuthTokensResponse>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refresh }),
      },
      { auth: false },
    );
    await tokenStore.set(tokens);
    return tokens;
  },

  /** Révoque la session côté serveur + clear local. */
  async logout(): Promise<void> {
    const refresh = await tokenStore.getRefresh();
    if (refresh) {
      try {
        await request<void>(
          '/auth/logout',
          {
            method: 'POST',
            body: JSON.stringify({ refreshToken: refresh }),
          },
          { auth: false },
        );
      } catch {
        // on ignore — le token peut déjà être expiré côté serveur
      }
    }
    await tokenStore.clear();
  },
};

// ---------------------------------------------------------------------------
// Me API (user connecté)
// ---------------------------------------------------------------------------

export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BANNED';
export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type MeResponse = {
  id: string;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  kycStatus: KycStatus;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  createdAt: string;
  // Profile (peut être null si jamais renseigné)
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  age: number | null;
  profession: string | null;
  addressLabel: string | null;
  lat: number | null;
  lng: number | null;
  neighborhood: string | null;
  city: string | null;
  // Stats publiques (rating + counters venus du backend)
  rating: number | null;
  reviewsCount: number | null;
  listingsCount: number | null;
  salesCount: number | null;
  gmvCents: number | null;
};

export type UpdateProfileRequest = {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  age?: number;
  profession?: string;
  addressLabel?: string;
  lat?: number;
  lng?: number;
  neighborhood?: string;
  city?: string;
};

export const meApi = {
  get: () => request<MeResponse>('/me'),
  updateProfile: (req: UpdateProfileRequest) =>
    request<MeResponse>('/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(req),
    }),

  /**
   * Upload d'avatar. Accepte un URI local (ImagePicker sur mobile = file://...)
   * ou une URL data:image (web = blob:...).
   * Renvoie l'URL servie par le backend (genre /uploads/avatars/xxx.jpg).
   */
  async uploadAvatar(localUri: string): Promise<string> {
    const blobRes = await fetch(localUri);
    const blob = await blobRes.blob();
    const form = new FormData();
    const mime = blob.type || 'image/jpeg';
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    form.append('file', blob as any, `avatar.${ext}`);
    const res = await request<{ avatarUrl: string }>(
      '/me/avatar',
      { method: 'POST', body: form },
    );
    return res.avatarUrl;
  },
};

// ---------------------------------------------------------------------------
// Listings (annonces)
// ---------------------------------------------------------------------------

export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'SOLD' | 'ARCHIVED';

export type OwnerInfo = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  rating: number | null;
  reviewsCount: number | null;
  neighborhood: string | null;
};

export type Listing = {
  id: string;
  ownerId: string;
  listingType: ListingType;
  title: string;
  description: string | null;
  priceCents: number | null;
  condition: string | null;
  categoryId: string | null;
  categoryLabel: string | null;
  lat: number | null;
  lng: number | null;
  neighborhood: string | null;
  photos: string[];
  status: ListingStatus;
  pricePerDayCents: number | null;
  pricePerWeekCents: number | null;
  depositCents: number | null;
  hourlyRateCents: number | null;
  flatRateCents: number | null;
  serviceRadiusKm: number | null;
  viewCount: number;
  favoritesCount: number;
  createdAt: string;
  /** Distance metres depuis lat/lng fournis dans la query. Null si pas de geo. */
  distanceMeters: number | null;
  owner: OwnerInfo | null;
};

export type ListingFilters = {
  q?: string;
  listingType?: ListingType;
  status?: ListingStatus;
  categoryId?: string;
  ownerId?: string;
  neighborhood?: string;
  /** Etat — applicable surtout aux VENTE. 'new'|'likenew'|'good'|'fair'. */
  condition?: 'new' | 'likenew' | 'good' | 'fair';
  minPriceCents?: number;
  maxPriceCents?: number;
  /** Centre du rayon de recherche (degres decimaux). */
  lat?: number;
  lng?: number;
  /** Rayon en metres (defaut backend = 500). */
  radiusMeters?: number;
  page?: number;
  size?: number;
  sort?: string;
};

/** Format affiche de la distance : "à 180 m", "à 1,2 km". */
export function formatDistance(meters: number | null | undefined): string {
  if (meters == null) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

export type CreateListingRequest = {
  listingType: ListingType;
  title: string;
  description?: string;
  priceCents?: number;
  condition?: string;
  categoryId?: string;
  categoryLabel?: string;
  lat?: number;
  lng?: number;
  neighborhood?: string;
  photos?: string[];
  // RENTAL
  pricePerDayCents?: number;
  pricePerWeekCents?: number;
  depositCents?: number;
  // SERVICE
  hourlyRateCents?: number;
  flatRateCents?: number;
  serviceRadiusKm?: number;
};

export type UpdateListingRequest = Partial<CreateListingRequest> & {
  status?: ListingStatus;
};

/** Format affiche pour un listing : "120 €", "12 €/jour", "25 €/h", "Gratuit". */
export function formatListingPrice(l: Listing): string {
  const eur = (cents: number | null | undefined) =>
    cents != null ? `${(cents / 100).toLocaleString('fr-FR')} €` : '';

  if (l.listingType === 'LOCATION') {
    return l.pricePerDayCents != null ? `${eur(l.pricePerDayCents)}/jour` : 'Sur demande';
  }
  if (l.listingType === 'SERVICE') {
    if (l.hourlyRateCents != null) return `${eur(l.hourlyRateCents)}/h`;
    if (l.flatRateCents != null) return eur(l.flatRateCents);
    return 'Sur devis';
  }
  // VENTE
  if (isFreeListing(l)) return 'Gratuit';
  return l.priceCents != null ? eur(l.priceCents) : 'Gratuit';
}

/**
 * Don (esprit Nextdoor / freecycle) : priceCents = 0 ou null sur une vente.
 * Le tag "Gratuit" s'affiche sur les cards quand cette condition est vraie.
 */
export function isFreeListing(l: Listing): boolean {
  return l.listingType === 'VENTE' && (l.priceCents == null || l.priceCents === 0);
}

/**
 * Resolution d'une URL d'image servie par le backend.
 * Si url commence par '/' (chemin relatif type '/uploads/listings/xxx.jpg'),
 * on prefixe avec API_BASE pour que le client puisse la charger.
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  // chemin relatif backend
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return url;
}

/** Premiere photo ou placeholder. */
export function listingMainPhoto(l: Listing): string {
  return resolveImageUrl(l.photos?.[0]);
}

export const listingsApi = {
  list: (filters: ListingFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
    return request<PageResponse<Listing>>(`/listings?${params}`, {}, { auth: false });
  },

  get: (id: string) =>
    request<Listing>(`/listings/${id}`, {}, { auth: false }),

  create: (req: CreateListingRequest) =>
    request<Listing>('/listings', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  update: (id: string, req: UpdateListingRequest) =>
    request<Listing>(`/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(req),
    }),

  archive: (id: string) =>
    request<void>(`/listings/${id}`, { method: 'DELETE' }),

  /**
   * Upload une photo d'annonce. Accepte un URI local (file://, blob:, data:)
   * ou une URL distante (qu'on telecharge puis re-uploade).
   * Renvoie l'URL servie par le backend (genre /uploads/listings/xxx.jpg).
   */
  async uploadPhoto(localUri: string): Promise<string> {
    const blobRes = await fetch(localUri);
    const blob = await blobRes.blob();
    const form = new FormData();
    const mime = blob.type || 'image/jpeg';
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    form.append('file', blob as any, `listing.${ext}`);
    const res = await request<{ url: string }>(
      '/listings/photos',
      { method: 'POST', body: form },
    );
    return res.url;
  },
};

// ---------------------------------------------------------------------------
// Saved searches (recherches sauvegardees + alertes)
// ---------------------------------------------------------------------------

export type SavedSearch = {
  id: string;
  name: string;
  query: string | null;
  listingType: ListingType | null;
  categoryId: string | null;
  condition: 'new' | 'likenew' | 'good' | 'fair' | null;
  minPriceCents: number | null;
  maxPriceCents: number | null;
  centerLat: number | null;
  centerLng: number | null;
  radiusMeters: number | null;
  alertsEnabled: boolean;
  createdAt: string;
};

export type SavedSearchRequest = {
  name: string;
  query?: string;
  listingType?: ListingType;
  categoryId?: string;
  condition?: 'new' | 'likenew' | 'good' | 'fair';
  minPriceCents?: number;
  maxPriceCents?: number;
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number;
  alertsEnabled?: boolean;
};

export const savedSearchesApi = {
  list: () => request<SavedSearch[]>('/me/saved-searches'),
  create: (req: SavedSearchRequest) =>
    request<SavedSearch>('/me/saved-searches', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  update: (id: string, req: SavedSearchRequest) =>
    request<SavedSearch>(`/me/saved-searches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(req),
    }),
  delete: (id: string) =>
    request<void>(`/me/saved-searches/${id}`, { method: 'DELETE' }),
};

// ---------------------------------------------------------------------------
// Favorites (annonces sauvegardees)
// ---------------------------------------------------------------------------

export const favoritesApi = {
  /** Liste paginee des annonces favorites de l'user. */
  list: (page = 0, size = 20) =>
    request<PageResponse<Listing>>(`/me/favorites?page=${page}&size=${size}`),
  /** Juste les IDs (pour preload des coeurs sur les cartes du feed). */
  ids: () => request<{ ids: string[] }>('/me/favorites/ids'),
  add: (listingId: string) =>
    request<void>(`/me/favorites/${listingId}`, { method: 'POST' }),
  remove: (listingId: string) =>
    request<void>(`/me/favorites/${listingId}`, { method: 'DELETE' }),
};

// ---------------------------------------------------------------------------
// Offers (negociation sur le prix)
// ---------------------------------------------------------------------------

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN';

export type OfferResponse = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amountCents: number;
  message: string | null;
  status: OfferStatus;
  responseMessage: string | null;
  respondedAt: string | null;
  expiresAt: string;
  createdAt: string;
};

export type CreateOfferRequest = {
  listingId: string;
  amountCents: number;
  message?: string;
};

export const offersApi = {
  create: (req: CreateOfferRequest) =>
    request<OfferResponse>('/offers', { method: 'POST', body: JSON.stringify(req) }),
  accept: (id: string, message?: string) =>
    request<OfferResponse>(`/offers/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  reject: (id: string, message?: string) =>
    request<OfferResponse>(`/offers/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  withdraw: (id: string) =>
    request<OfferResponse>(`/offers/${id}/withdraw`, { method: 'POST' }),
  sent: () => request<OfferResponse[]>('/me/offers/sent'),
  received: () => request<OfferResponse[]>('/me/offers/received'),
};

// ---------------------------------------------------------------------------
// Public users (profils visibles depuis annonce / thread)
// ---------------------------------------------------------------------------

export type PublicProfile = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  age: number | null;
  profession: string | null;
  neighborhood: string | null;
  city: string | null;
  rating: number | null;
  reviewsCount: number | null;
  listingsCount: number | null;
  salesCount: number | null;
  createdAt: string;
};

export const publicUsersApi = {
  get: (userId: string) =>
    request<PublicProfile>(`/users/${userId}/public`, {}, { auth: false }),
};

// ---------------------------------------------------------------------------
// Reviews (avis)
// ---------------------------------------------------------------------------

export type ReviewResponse = {
  id: string;
  orderId: string;
  authorId: string;
  targetUserId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type CreateReviewRequest = {
  orderId: string;
  rating: number;     // 1..5
  comment?: string;
};

export const reviewsApi = {
  create: (req: CreateReviewRequest) =>
    request<ReviewResponse>('/reviews', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  listForUser: (userId: string, page = 0, size = 20) =>
    request<PageResponse<ReviewResponse>>(
      `/users/${userId}/reviews?page=${page}&size=${size}`,
      {},
      { auth: false },
    ),
};

// ---------------------------------------------------------------------------
// Reports (signalements)
// ---------------------------------------------------------------------------

export type ReportTargetType = 'LISTING' | 'USER' | 'THREAD' | 'MESSAGE';

export type CreateReportRequest = {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
};

export type ReportResponse = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details: string | null;
  status: 'OPEN' | 'REVIEWING' | 'ACTIONED' | 'DISMISSED';
  createdAt: string;
};

export const reportsApi = {
  create: (req: CreateReportRequest) =>
    request<ReportResponse>('/reports', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
};

// ---------------------------------------------------------------------------
// Payments (Stripe)
// ---------------------------------------------------------------------------
//
// Flow attendu :
//   1. Mobile cree une Order via `ordersApi.create(...)`        -> orderId
//   2. Mobile appelle `paymentsApi.createIntent(orderId)`       -> clientSecret
//   3. Mobile appelle `stripe.confirmPayment(clientSecret, ...)` via le SDK
//      @stripe/stripe-react-native — affiche la PaymentSheet
//   4. Stripe envoie un webhook au backend qui marque Order.payment_status
//      = SUCCEEDED + paidAt = now()
//   5. Mobile route vers /payment/success (qui poll Order.status si besoin)
//
// La cle PUBLISHABLE vient de `paymentsApi.config()` au boot (ou de l'env
// EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY pour les builds prod EAS).

export type PaymentsConfig = {
  enabled: boolean;
  publishableKey: string;
};

export type CreateIntentResponse = {
  clientSecret: string;
  paymentIntentId: string;
  amountCents: number;
  status: string; // 'requires_payment_method' | 'succeeded' | ...
};

export const paymentsApi = {
  config: () =>
    request<PaymentsConfig>('/payments/config', {}, { auth: false }),

  /**
   * Cree (ou recupere si deja existant) le PaymentIntent associe a une Order.
   * Le `clientSecret` retourne sert au SDK Stripe cote mobile pour afficher
   * la PaymentSheet et confirmer la carte.
   */
  createIntent: (orderId: string) =>
    request<CreateIntentResponse>(`/payments/intents/${orderId}`, {
      method: 'POST',
    }),
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type NotifKind =
  | 'MESSAGE'
  | 'OFFER'
  | 'BOOKING_REQUEST'
  | 'LISTING_SOLD'
  | 'ORDER_UPDATE'
  | 'REVIEW'
  | 'PAYOUT'
  | 'SYSTEM';

export type ApiNotification = {
  id: string;
  kind: NotifKind;
  title: string;
  body: string | null;
  href: string | null;
  unread: boolean;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Categories publiques (arbre lisible par mobile)
// ---------------------------------------------------------------------------

export type PublicCategoryNode = {
  id: string;
  slug: string;
  label: string;
  subtitle: string | null;
  parentId: string | null;
  type: ListingType;
  glyph: string | null;
  sortOrder: number;
  isLeaf: boolean;
  children: PublicCategoryNode[];
};

export const publicCategoriesApi = {
  /** Arbre actif d'un univers (VENTE par defaut). */
  tree: (type: ListingType = 'VENTE') =>
    request<PublicCategoryNode[]>(`/categories?type=${type}`, {}, { auth: false }),
  /** Categories feuilles uniquement (utiles dans la creation d'annonce). */
  leaves: (type: ListingType = 'VENTE') =>
    request<PublicCategoryNode[]>(`/categories/leaves?type=${type}`, {}, { auth: false }),
};

export const notifsApi = {
  list: (page = 0, size = 30) =>
    request<PageResponse<ApiNotification>>(
      `/me/notifications?page=${page}&size=${size}`,
    ),

  unreadCount: () => request<{ count: number }>('/me/notifications/unread'),

  markRead: (id: string) =>
    request<void>(`/me/notifications/${id}/read`, { method: 'POST' }),

  markAllRead: () =>
    request<void>('/me/notifications/read-all', { method: 'POST' }),
};

// ---------------------------------------------------------------------------
// Messaging (threads + messages)
// ---------------------------------------------------------------------------

export type MessageKind = 'TEXT' | 'PHOTO' | 'LOCATION' | 'OFFER' | 'PICKUP' | 'SYSTEM';

export type ApiMessage = {
  id: string;
  threadId: string;
  senderId: string;
  kind: MessageKind;
  text: string | null;
  imageUrl: string | null;
  createdAt: string;
};

export type ThreadParticipant = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  rating: number | null;
  reviewsCount: number | null;
  neighborhood: string | null;
};

export type ApiThread = {
  id: string;
  listingId: string;
  listing: Listing | null;
  iAmSeller: boolean;
  other: ThreadParticipant | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastFromMe: boolean;
  unreadCount: number;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Orders (commandes)
// ---------------------------------------------------------------------------

export type ApiOrderStatus =
  | 'AWAITING_PICKUP'
  | 'HANDOFF_PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'DISPUTED';

export type ApiOrder = {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  listingTitle: string | null;
  listingThumb: string | null;
  listingType: ListingType;
  amountCents: number;
  feeCents: number;
  depositCents: number | null;
  rentalStart: string | null;
  rentalEnd: string | null;
  status: ApiOrderStatus;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  depositReleased: boolean | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
};

export const ordersApi = {
  create: (listingId: string, amountCentsOverride?: number) =>
    request<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify({ listingId, amountCentsOverride }),
    }),

  list: (role: 'buyer' | 'seller' = 'buyer', page = 0, size = 30) =>
    request<PageResponse<ApiOrder>>(
      `/me/orders?role=${role}&page=${page}&size=${size}`,
    ),

  get: (id: string) => request<ApiOrder>(`/me/orders/${id}`),

  confirmPickup: (id: string) =>
    request<ApiOrder>(`/me/orders/${id}/confirm-pickup`, { method: 'POST' }),

  cancel: (id: string, reason?: string) =>
    request<ApiOrder>(`/me/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// ---------------------------------------------------------------------------
// Appels VoIP (Jitsi Meet)
// ---------------------------------------------------------------------------

export type CallStatus = 'RINGING' | 'ACCEPTED' | 'DECLINED' | 'ENDED' | 'MISSED';
export type CallKind = 'AUDIO' | 'VIDEO';

export type ApiCall = {
  id: string;
  threadId: string;
  callerId: string;
  calleeId: string;
  roomName: string;
  jitsiUrl: string;
  status: CallStatus;
  kind: CallKind;
  startedAt: string;
  acceptedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
};

export const callsApi = {
  /** Caller initie un appel sur un thread. */
  initiate: (threadId: string, kind: CallKind = 'AUDIO') =>
    request<ApiCall>(`/threads/${threadId}/calls?kind=${kind}`, { method: 'POST' }),

  /** Callee polling : appels entrants RINGING qui m'attendent. */
  incoming: () => request<ApiCall[]>('/me/calls/incoming'),

  get: (id: string) => request<ApiCall>(`/me/calls/${id}`),
  accept: (id: string) => request<ApiCall>(`/me/calls/${id}/accept`, { method: 'POST' }),
  decline: (id: string) => request<ApiCall>(`/me/calls/${id}/decline`, { method: 'POST' }),
  end: (id: string) => request<ApiCall>(`/me/calls/${id}/end`, { method: 'POST' }),
};

export const threadsApi = {
  list: (page = 0, size = 30) =>
    request<PageResponse<ApiThread>>(`/me/threads?page=${page}&size=${size}`),

  get: (id: string) => request<ApiThread>(`/me/threads/${id}`),

  /** Crée ou retrouve un thread autour d'une annonce ("Contacter le vendeur"). */
  open: (listingId: string) =>
    request<ApiThread>('/me/threads', {
      method: 'POST',
      body: JSON.stringify({ listingId }),
    }),

  /** Charge la 1ère page de messages (du plus ancien au plus récent). */
  messages: (threadId: string, page = 0, size = 50) =>
    request<PageResponse<ApiMessage>>(
      `/me/threads/${threadId}/messages?page=${page}&size=${size}`,
    ),

  /** Polling : récupère les nouveaux messages depuis un timestamp (epoch ms). */
  messagesSince: (threadId: string, timestampMs: number) =>
    request<ApiMessage[]>(
      `/me/threads/${threadId}/messages/since?ts=${timestampMs}`,
    ),

  send: (threadId: string, text: string) =>
    request<ApiMessage>(`/me/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  /** Envoyer une photo dans un thread (multipart). Caption optionnelle. */
  async sendPhoto(threadId: string, localUri: string, caption?: string): Promise<ApiMessage> {
    const blobRes = await fetch(localUri);
    const blob = await blobRes.blob();
    const form = new FormData();
    const mime = blob.type || 'image/jpeg';
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('gif') ? 'gif' : 'jpg';
    form.append('file', blob as any, `msg.${ext}`);
    if (caption) form.append('caption', caption);
    return request<ApiMessage>(`/me/threads/${threadId}/messages/photo`, {
      method: 'POST',
      body: form,
    });
  },

  markRead: (threadId: string) =>
    request<void>(`/me/threads/${threadId}/read`, { method: 'POST' }),

  unreadCount: () => request<{ count: number }>('/me/threads/unread-count'),
};
