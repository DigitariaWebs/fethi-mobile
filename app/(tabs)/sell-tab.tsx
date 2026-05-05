import { Redirect } from 'expo-router';

// Placeholder route the tab bar never actually renders — the tab button is
// overridden in (tabs)/_layout.tsx to push the sell modal stack instead.
// We still need a screen file so the Tabs schema is happy.
export default function SellTabRedirect() {
  return <Redirect href="/sell" />;
}
