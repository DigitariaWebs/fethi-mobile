// Apparence — choix du theme clair / sombre / suivre l'appareil.
//
// 3 cartes avec preview du rendu. Tap = applique immediatement via
// `useThemeStore.setPreference()`. La preference est persistee.
//
// - 'light'  : toujours clair, ignore l'OS
// - 'dark'   : toujours sombre, ignore l'OS
// - 'system' : suit Appearance.getColorScheme() + reagit aux changements
//              en temps reel (sub Appearance.addChangeListener installee
//              dans app/_layout.tsx)

import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { Icon, PageHeader } from '@/components';
import { lightPalette, darkPalette, type Palette } from '@/theme/palettes';
import { useThemeStore, type ThemePreference } from '@/theme/themeStore';

type Choice = {
  id: ThemePreference;
  label: string;
  caption: string;
  /** Palette utilisee pour le preview. Pour 'system' on prend la palette active. */
  paletteFor: (current: Palette) => Palette;
};

const CHOICES: Choice[] = [
  { id: 'light', label: 'Clair', caption: 'Toujours en mode clair', paletteFor: () => lightPalette },
  { id: 'dark',  label: 'Sombre', caption: 'Toujours en mode sombre', paletteFor: () => darkPalette },
  { id: 'system', label: 'Suivre l\'appareil', caption: 'Bascule avec les réglages système', paletteFor: (c) => c },
];

export default function Appearance() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Apparence" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 + insets.bottom }}>
        <Text style={[t('body'), { color: C.n600, marginBottom: 20, lineHeight: 22 }]}>
          Choisis le rendu visuel de l'app. Le réglage s'applique immédiatement
          et survit à un redémarrage.
        </Text>

        <View style={{ gap: 10 }}>
          {CHOICES.map((c) => {
            const selected = preference === c.id;
            const palette = c.paletteFor(C);
            return (
              <Pressable
                key={c.id}
                onPress={() => setPreference(c.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  borderRadius: R.lg,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? C.ink : C.divider,
                  padding: 12,
                  backgroundColor: C.surface,
                }}
              >
                {/* Preview "fenetre" miniature du theme */}
                <View
                  style={{
                    width: 56, height: 56, borderRadius: 10,
                    backgroundColor: palette.paper,
                    borderWidth: 1, borderColor: palette.divider,
                    padding: 5, gap: 3,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: 8, borderRadius: 4,
                      backgroundColor: palette.surface,
                    }}
                  />
                  <View
                    style={{
                      flex: 1, borderRadius: 5,
                      backgroundColor: palette.surface, padding: 3, gap: 2,
                    }}
                  >
                    <View style={{ height: 4, width: '60%', borderRadius: 2, backgroundColor: palette.ink, opacity: 0.7 }} />
                    <View style={{ height: 3, width: '40%', borderRadius: 1.5, backgroundColor: palette.n500 }} />
                    <View style={{ flex: 1 }} />
                    <View style={{ height: 6, width: 22, borderRadius: 3, backgroundColor: palette.primary }} />
                  </View>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>
                    {c.label}
                  </Text>
                  <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>
                    {c.caption}
                  </Text>
                </View>
                {selected ? (
                  <View
                    style={{
                      width: 22, height: 22, borderRadius: 11,
                      backgroundColor: C.ink,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon.Check size={12} color={C.paper} />
                  </View>
                ) : (
                  <View
                    style={{
                      width: 22, height: 22, borderRadius: 11,
                      borderWidth: 1.5, borderColor: C.n300,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
