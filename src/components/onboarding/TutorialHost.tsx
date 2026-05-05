import { usePathname } from 'expo-router';

import { useSession } from '@/lib/session';
import { TutorialOverlay } from '@/components/onboarding/TutorialOverlay';

// Mounted once at the root layout (next to ToastHost / ConfirmHost) so
// the tutorial overlay sits above every navigation stack — including the
// floating tab bar and any modals — without depending on per-screen
// wiring. The overlay is only surfaced on the home/map tab — every other
// surface (splash, welcome, auth, onboarding, KYC, listings, etc.) is
// excluded so the tutorial never blocks those flows.

const SHOW_ON: RegExp[] = [
  /^\/(\(tabs\)\/)?map(\/.*)?$/,
];

export function TutorialHost() {
  const pathname = usePathname();
  const hydrated = useSession((s) => s.hydrated);
  const tutorialSeen = useSession((s) => s.tutorialSeen);
  const finishTutorial = useSession((s) => s.finishTutorial);

  const onHome = SHOW_ON.some((re) => re.test(pathname));
  const visible = hydrated && !tutorialSeen && onHome;

  return (
    <TutorialOverlay visible={visible} onDone={finishTutorial} onSkip={finishTutorial} />
  );
}
