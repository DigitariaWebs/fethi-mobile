// Theme mode store. Mirrors the web ThemeProvider's API: a `theme` value and a
// `toggle()` function. Persisted via AsyncStorage so the choice survives a
// cold start, and falls back to the OS color scheme on first launch.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';

import { lightPalette, darkPalette, type Palette } from './palettes';

export type ThemeMode = 'light' | 'dark';
/** Choix utilisateur. 'system' suit l'OS en temps reel. */
export type ThemePreference = 'light' | 'dark' | 'system';

type State = {
  hydrated: boolean;
  /** Le mode effectif applique — derive de la preference + OS si 'system'. */
  mode: ThemeMode;
  /** La preference que l'user a choisie ('light' | 'dark' | 'system'). */
  preference: ThemePreference;
  hydrate: () => Promise<void>;
  setPreference: (pref: ThemePreference) => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggle: () => Promise<void>;
};

const KEY = 'mystreet:theme:v1';

function resolveMode(pref: ThemePreference): ThemeMode {
  if (pref === 'system') {
    return (Appearance.getColorScheme() ?? 'light') as ThemeMode;
  }
  return pref;
}

export const useThemeStore = create<State>((set, get) => ({
  hydrated: false,
  mode: resolveMode('system'),
  preference: 'system',

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const stored: ThemePreference =
        raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
      set({ preference: stored, mode: resolveMode(stored), hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  setPreference: async (pref) => {
    set({ preference: pref, mode: resolveMode(pref) });
    try {
      await AsyncStorage.setItem(KEY, pref);
    } catch {
      // Tant pis, au pire ca repasse a 'system' au prochain boot
    }
  },

  setMode: async (mode) => {
    // Compat retro : choisir explicitement light/dark = preference fixe
    await get().setPreference(mode);
  },

  toggle: async () => {
    const cur = get().preference;
    if (cur === 'system') await get().setPreference('dark');
    else if (cur === 'dark') await get().setPreference('light');
    else await get().setPreference('system');
  },
}));

// Suivi en temps reel de l'OS quand la preference = 'system'. Appele depuis
// app/_layout.tsx au mount pour que le bandeau notif iOS clair->sombre
// applique le theme sans relancer l'app.
let _appearanceSubscription: { remove: () => void } | null = null;
export function watchSystemAppearance() {
  if (_appearanceSubscription) return; // pas de double-souscription
  _appearanceSubscription = Appearance.addChangeListener(({ colorScheme }) => {
    const { preference } = useThemeStore.getState();
    if (preference === 'system') {
      useThemeStore.setState({ mode: (colorScheme ?? 'light') as ThemeMode });
    }
  });
}

// Read-only selectors so components don't pull the whole store object.
export const useThemeMode = () => useThemeStore((s) => s.mode);
export const useThemePreference = () => useThemeStore((s) => s.preference);
export const useColors = (): Palette =>
  useThemeStore((s) => (s.mode === 'dark' ? darkPalette : lightPalette));
export const useIsDark = () => useThemeStore((s) => s.mode === 'dark');
