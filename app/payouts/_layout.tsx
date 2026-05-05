import { Stack } from 'expo-router';
import { useColors } from '@/theme';

export default function PayoutsLayout() {
  const C = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.paper },
        animation: 'slide_from_right',
      }}
    />
  );
}
