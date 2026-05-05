import { Stack } from 'expo-router';

export default function ListingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="[id]/gallery"
        options={{ presentation: 'modal', animation: 'fade' }}
      />
    </Stack>
  );
}
