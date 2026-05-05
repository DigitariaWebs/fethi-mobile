// Lightweight onboarding/session store.
// Backed by AsyncStorage so onboarding completion survives app restarts.
//
// In a real backend integration, replace `address`/`displayName`/`avatarUri`
// with whatever the user-profile API returns.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type State = {
  hydrated: boolean;
  onboarded: boolean;
  tutorialSeen: boolean;
  address: string;
  addressLat?: number;
  addressLng?: number;
  displayName: string;
  avatarUri?: string;
  hydrate: () => Promise<void>;
  setAddress: (address: string, lat?: number, lng?: number) => void;
  setDisplayName: (name: string) => void;
  setAvatar: (uri: string) => void;
  finishOnboarding: () => Promise<void>;
  finishTutorial: () => Promise<void>;
  replayTutorial: () => Promise<void>;
  reset: () => Promise<void>;
};

const KEY = 'mystreet:session:v1';

type Persisted = Pick<
  State,
  | 'onboarded'
  | 'tutorialSeen'
  | 'address'
  | 'addressLat'
  | 'addressLng'
  | 'displayName'
  | 'avatarUri'
>;

async function persist(s: Persisted) {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

function snapshot(s: State): Persisted {
  return {
    onboarded: s.onboarded,
    tutorialSeen: s.tutorialSeen,
    address: s.address,
    addressLat: s.addressLat,
    addressLng: s.addressLng,
    displayName: s.displayName,
    avatarUri: s.avatarUri,
  };
}

export const useSession = create<State>((set, get) => ({
  hydrated: false,
  onboarded: false,
  tutorialSeen: false,
  address: '',
  addressLat: undefined,
  addressLng: undefined,
  displayName: '',
  avatarUri: undefined,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as Persisted;
        set({ ...s, hydrated: true });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },
  setAddress: (address, lat, lng) => set({ address, addressLat: lat, addressLng: lng }),
  setDisplayName: (displayName) => set({ displayName }),
  setAvatar: (avatarUri) => set({ avatarUri }),
  finishOnboarding: async () => {
    set({ onboarded: true });
    await persist(snapshot(get()));
  },
  finishTutorial: async () => {
    set({ tutorialSeen: true });
    await persist(snapshot(get()));
  },
  replayTutorial: async () => {
    set({ tutorialSeen: false });
    await persist(snapshot(get()));
  },
  reset: async () => {
    set({
      onboarded: false,
      tutorialSeen: false,
      address: '',
      addressLat: undefined,
      addressLng: undefined,
      displayName: '',
      avatarUri: undefined,
    });
    await AsyncStorage.removeItem(KEY);
  },
}));
