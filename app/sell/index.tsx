import { Redirect } from 'expo-router';

// Entry point of the sell flow — redirects to the photos step.
export default function SellEntry() {
  return <Redirect href="/sell/photos" />;
}
