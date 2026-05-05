// Theme mode store. Mirrors the web ThemeProvider's API: a `theme` value and a
// `toggle()` function. Persisted via AsyncStorage so the choice survives a
// cold start, and falls back to the OS color scheme on first launch.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';

import { lightPalette, darkPalette, type Palette } from './palettes';

export type ThemeMode = 'light' | 'dark';

type State = {
  hydrated: boolean;
  mode: ThemeMode;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggle: () => Promise<void>;
};

const KEY = 'mystreet:theme:v1';

export const useThemeStore = create<State>((set, get) => ({
  hydrated: false,
  // Until hydration completes we lean on the OS preference so the very first
  // paint already matches what the user expects.
  mode: (Appearance.getColorScheme() ?? 'light') as ThemeMode,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const stored = raw === 'light' || raw === 'dark' ? (raw as ThemeMode) : null;
      const initial = stored ?? ((Appearance.getColorScheme() ?? 'light') as ThemeMode);
      set({ mode: initial, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  setMode: async (mode) => {
    set({ mode });
    try {
      await AsyncStorage.setItem(KEY, mode);
    } catch {
      // Ignore — at worst the mode resets next launch.
    }
  },

  toggle: async () => {
    await get().setMode(get().mode === 'light' ? 'dark' : 'light');
  },
}));

// Read-only selectors so components don't pull the whole store object.
export const useThemeMode = () => useThemeStore((s) => s.mode);
export const useColors = (): Palette =>
  useThemeStore((s) => (s.mode === 'dark' ? darkPalette : lightPalette));
export const useIsDark = () => useThemeStore((s) => s.mode === 'dark');
