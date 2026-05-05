import { Stack } from 'expo-router';
import { useColors } from '@/theme';

// Sell flow is presented as a modal stack from the tab bar. The new
// `/sell/type` screen is the entry point — it picks the listing type
// and routes into either the canonical sale path (/sell/index → title →
// description → price → pickup → review) or the rental/service variants.
export default function SellLayout() {
  const C = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.paper },
        animation: 'slide_from_right',
      }}
      initialRouteName="type"
    />
  );
}
