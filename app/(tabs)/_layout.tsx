import { Tabs } from 'expo-router';

import { useColors } from '@/theme';
import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';

// Phase 7 — five-tab layout rendered with a custom floating pill bar.
// The Sell tab is registered here so expo-router knows the route, but the
// custom bar intercepts taps and pushes /sell as a modal.
export default function TabsLayout() {
  const C = useColors();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.n500,
      }}
    >
      <Tabs.Screen name="map" options={{ title: 'Carte' }} />
      <Tabs.Screen name="search" options={{ title: 'Rechercher' }} />
      <Tabs.Screen name="sell-tab" options={{ title: '' }} />
      <Tabs.Screen
        name="messages"
        options={{ title: 'Messages', tabBarBadge: 3 }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
