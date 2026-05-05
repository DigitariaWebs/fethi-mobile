// Draft state for the multi-step sell flow.
// In-memory while the user is in the flow; persists across app restarts
// only when the user taps "Save & exit", at which point we mark the draft
// as `hasSaved` and write it to AsyncStorage. The map screen reads
// `hasSaved` to surface a "resume your draft" pill above the tab bar.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type SellDraft = {
  // Type picked at /sell/type. Defaults to 'sale' for backwards-compat
  // with anything that pre-existed the type-picker.
  listingType: 'sale' | 'rental' | 'service';
  photos: string[]; // local URIs
  title: string;
  category: string;
  tags: string[];
  condition: 'new' | 'likenew' | 'good' | 'fair' | null;
  description: string;
  price: number | null;
  acceptOffers: boolean;
  minOffer: number | null;
  pickupMethod: 'home' | 'meeting' | 'shipping';
  availability: string[];
  // Rental-specific fields.
  rentalPricePerDay: number | null;
  rentalPricePerWeek: number | null;
  rentalDeposit: number | null;
  rentalUnavailableDates: string[];
  // Service-specific fields.
  serviceMode: 'hourly' | 'flat' | null;
  serviceRate: number | null;
  serviceMinDuration: number | null; // minutes
  serviceRadiusKm: number | null;
};

type State = SellDraft & {
  hasSaved: boolean;
  hydrated: boolean;
  // Last route the user was on when they saved & exited — lets the map's
  // "Resume" pill drop them back exactly where they left off.
  lastRoute: string | null;
  set: (patch: Partial<SellDraft>) => void;
  togglePhoto: (uri: string) => void;
  toggleTag: (tag: string) => void;
  toggleAvail: (slot: string) => void;
  hydrate: () => Promise<void>;
  saveAndExit: (lastRoute?: string | null) => Promise<void>;
  reset: () => void;
  clearSaved: () => Promise<void>;
};

const KEY = 'mystreet:selldraft:v1';

const initial: SellDraft = {
  listingType: 'sale',
  photos: [
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&q=80',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80',
    'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=600&q=80',
  ],
  title: '',
  category: 'Vélos & mobilité',
  tags: ['Vintage', 'Adulte'],
  condition: 'good',
  description: '',
  price: null,
  acceptOffers: true,
  minOffer: 90,
  pickupMethod: 'home',
  availability: ['Evenings', 'Weekends'],
  rentalPricePerDay: null,
  rentalPricePerWeek: null,
  rentalDeposit: null,
  rentalUnavailableDates: [],
  serviceMode: null,
  serviceRate: null,
  serviceMinDuration: 60,
  serviceRadiusKm: 3,
};

type Persisted = SellDraft & { lastRoute: string | null };

function snapshot(s: State): Persisted {
  const {
    listingType,
    photos, title, category, tags, condition, description,
    price, acceptOffers, minOffer, pickupMethod, availability,
    rentalPricePerDay, rentalPricePerWeek, rentalDeposit, rentalUnavailableDates,
    serviceMode, serviceRate, serviceMinDuration, serviceRadiusKm,
    lastRoute,
  } = s;
  return {
    listingType,
    photos, title, category, tags, condition, description,
    price, acceptOffers, minOffer, pickupMethod, availability,
    rentalPricePerDay, rentalPricePerWeek, rentalDeposit, rentalUnavailableDates,
    serviceMode, serviceRate, serviceMinDuration, serviceRadiusKm,
    lastRoute,
  };
}

export const useSellDraft = create<State>((set, get) => ({
  ...initial,
  hasSaved: false,
  hydrated: false,
  lastRoute: null,
  set: (patch) => set(patch),
  togglePhoto: (uri) =>
    set({
      photos: get().photos.includes(uri)
        ? get().photos.filter((p) => p !== uri)
        : [...get().photos, uri],
    }),
  toggleTag: (tag) =>
    set({
      tags: get().tags.includes(tag)
        ? get().tags.filter((t) => t !== tag)
        : [...get().tags, tag],
    }),
  toggleAvail: (slot) =>
    set({
      availability: get().availability.includes(slot)
        ? get().availability.filter((s) => s !== slot)
        : [...get().availability, slot],
    }),
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw) as Persisted;
        set({ ...data, hasSaved: true, hydrated: true });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },
  saveAndExit: async (lastRoute) => {
    set({ lastRoute: lastRoute ?? null });
    const data = snapshot(get());
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
    set({ hasSaved: true });
  },
  reset: () => set({ ...initial, hasSaved: false, lastRoute: null }),
  clearSaved: async () => {
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {}
    set({ ...initial, hasSaved: false, lastRoute: null });
  },
}));
