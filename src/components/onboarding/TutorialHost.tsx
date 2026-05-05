import { usePathname } from 'expo-router';

import { useSession } from '@/lib/session';
import { TutorialOverlay } from '@/components/onboarding/TutorialOverlay';

// Mounted once at the root layout (next to ToastHost / ConfirmHost) so
// the tutorial overlay sits above every navigation stack — including the
// floating tab bar and any modals — without depending on per-screen
// wiring. The overlay is only surfaced once the session store has
// hydrated and the user lands on a "main app" route. Pre-onboarding
// surfaces (splash, welcome, auth, onboarding) are skipped explicitly so
// we never block those flows.

const SKIP_ON: RegExp[] = [
  /^\/$/, // splash
  /^\/welcome$/,
  /^\/auth(\/.*)?$/,
  /^\/onboarding(\/.*)?$/,
];

export function TutorialHost() {
  const pathname = usePathname();
  const hydrated = useSession((s) => s.hydrated);
  const tutorialSeen = useSession((s) => s.tutorialSeen);
  const finishTutorial = useSession((s) => s.finishTutorial);

  const onMainApp = !SKIP_ON.some((re) => re.test(pathname));
  const visible = hydrated && !tutorialSeen && onMainApp;

  return (
    <TutorialOverlay visible={visible} onDone={finishTutorial} onSkip={finishTutorial} />
  );
}
