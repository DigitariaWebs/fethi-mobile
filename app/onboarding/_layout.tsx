import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useColors } from '@/theme';
import { tokenStore } from '@/lib/api';

export default function OnboardingLayout() {
  const C = useColors();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // Auth guard : tous les ecrans /onboarding/* presupposent qu'on est logge.
  // Si pas de token (typique sur web ou apres location.reload), on redirige
  // vers /auth/email pour eviter les 403 silencieux sur PATCH /me/profile.
  useEffect(() => {
    (async () => {
      const token = await tokenStore.getAccess();
      if (!token) {
        router.replace('/auth/email');
        return;
      }
      setChecked(true);
    })();
  }, [router]);

  if (!checked) {
    return <View style={{ flex: 1, backgroundColor: C.paper }} />;
  }

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
