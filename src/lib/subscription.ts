// MyStreet+ subscription state. Persisted via AsyncStorage so unlocked
// features survive app restarts. Real backend would replace this with
// the user's billing-portal status; for now we drive it locally.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type SubTier = 'free' | 'plus';

type State = {
  tier: SubTier;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  upgrade: () => Promise<void>;
  cancel: () => Promise<void>;
};

const KEY = 'mystreet:sub:v1';

export const useSubscription = create<State>((set) => ({
  tier: 'free',
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ tier: raw === 'plus' ? 'plus' : 'free' });
    } catch {}
    set({ hydrated: true });
  },
  upgrade: async () => {
    set({ tier: 'plus' });
    try {
      await AsyncStorage.setItem(KEY, 'plus');
    } catch {}
  },
  cancel: async () => {
    set({ tier: 'free' });
    try {
      await AsyncStorage.setItem(KEY, 'free');
    } catch {}
  },
}));

export function isPlus(): boolean {
  return useSubscription.getState().tier === 'plus';
}
