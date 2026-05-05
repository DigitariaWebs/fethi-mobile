import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useColors, useThemeStore } from '@/theme';
import { PageHeader } from '@/components';
import { SettingsGroup, SettingsRow } from '@/components/settings/SettingsRow';

export default function Preferences() {
  const C = useColors();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const [radius, setRadius] = useState<'500m' | '1km' | '2km' | '5km'>('500m');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [unit, setUnit] = useState<'km' | 'mi'>('km');

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Préférences de recherche" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <SettingsGroup title="Apparence">
          <SettingsRow
            kind="value"
            label="Clair"
            value={themeMode === 'light' ? '✓' : ''}
            onPress={() => void setThemeMode('light')}
          />
          <SettingsRow
            kind="value"
            label="Sombre"
            value={themeMode === 'dark' ? '✓' : ''}
            onPress={() => void setThemeMode('dark')}
            last
          />
        </SettingsGroup>
        <SettingsGroup title="Rayon de recherche par défaut">
          {(['500m', '1km', '2km', '5km'] as const).map((r, i, arr) => (
            <SettingsRow
              key={r}
              kind="value"
              label={r}
              value={radius === r ? '✓' : ''}
              onPress={() => setRadius(r)}
              last={i === arr.length - 1}
            />
          ))}
        </SettingsGroup>
        <SettingsGroup title="Langue">
          <SettingsRow kind="value" label="Anglais" value={language === 'en' ? '✓' : ''} onPress={() => setLanguage('en')} />
          <SettingsRow kind="value" label="Français" value={language === 'fr' ? '✓' : ''} onPress={() => setLanguage('fr')} last />
        </SettingsGroup>
        <SettingsGroup title="Unité de distance">
          <SettingsRow kind="value" label="Kilomètres" value={unit === 'km' ? '✓' : ''} onPress={() => setUnit('km')} />
          <SettingsRow kind="value" label="Miles" value={unit === 'mi' ? '✓' : ''} onPress={() => setUnit('mi')} last />
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}
