// Color palettes — light & dark.
// Mirrors the web app's token system in mystreet-web/src/app/globals.css.
// Brand tokens (primary / accent) stay the same character in both modes;
// surfaces, neutrals, and semantic-soft tints flip.

export type Palette = {
  // Brand
  primary: string;
  primaryHover: string;
  primaryPressed: string;
  primarySoft: string;
  primaryInk: string;

  // Accent — sage
  accent: string;
  accentSoft: string;

  // Neutrals — warm, paper-based
  paper: string;
  surface: string;
  n50: string;
  n100: string;
  n200: string;
  n300: string;
  n400: string;
  n500: string;
  n600: string;
  n700: string;
  n800: string;
  ink: string;

  // Semantic
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;

  // Surfaces
  overlay: string;
  divider: string;

  // Glass tints (used by MSGlass / BlurView)
  glassNeutral: string;
  glassWarm: string;
  glassInk: string;
  glassPin: string;
  glassPinSel: string;
  glassCluster: string;
  glassSheet: string;

  // Translucent surface fills (used to live as hard whites in light mode)
  white60: string;
  white72: string;
  white85: string;
  white95: string;
  white96: string;

  // Subtle ripples / pressed states
  inkOverlay05: string;
  inkOverlay09: string;
};

export const lightPalette: Palette = {
  primary:        '#C8553D',
  primaryHover:   '#B14732',
  primaryPressed: '#9A3C2B',
  primarySoft:    '#FBE9E2',
  primaryInk:     '#5C2419',

  accent:         '#2F6B5E',
  accentSoft:     '#E4EDE9',

  paper:          '#FBF8F4',
  surface:        '#FFFFFF',
  n50:            '#F5F1EB',
  n100:           '#ECE6DD',
  n200:           '#DDD5C8',
  n300:           '#C2B7A4',
  n400:           '#9C907C',
  n500:           '#76695A',
  n600:           '#574E42',
  n700:           '#3B342C',
  n800:           '#272320',
  ink:            '#1F2421',

  success:        '#3F7D5C',
  successSoft:    '#E2EFE7',
  warning:        '#C68A2E',
  warningSoft:    '#F7ECD6',
  danger:         '#B23A2A',
  dangerSoft:     '#F7E1DC',
  info:           '#3A6BA3',
  infoSoft:       '#E1EAF4',

  overlay:        'rgba(31, 36, 33, 0.45)',
  divider:        'rgba(31, 36, 33, 0.08)',

  glassNeutral:   'rgba(255, 252, 248, 0.62)',
  glassWarm:      'rgba(251, 233, 226, 0.55)',
  glassInk:       'rgba(31, 36, 33, 0.55)',
  glassPin:       'rgba(255, 252, 248, 0.78)',
  glassPinSel:    'rgba(31, 36, 33, 0.82)',
  glassCluster:   'rgba(31, 36, 33, 0.78)',
  glassSheet:     'rgba(255, 252, 248, 0.86)',

  white60:        'rgba(255,255,255,0.6)',
  white72:        'rgba(255,255,255,0.72)',
  white85:        'rgba(255,255,255,0.85)',
  white95:        'rgba(255,255,255,0.95)',
  white96:        'rgba(255,255,255,0.96)',
  inkOverlay05:   'rgba(31,36,33,0.05)',
  inkOverlay09:   'rgba(31,36,33,0.09)',
};

// Warm dark — wet bricks at night, never cold black.
// Brand stays terracotta; soft tints become deep warm tints.
export const darkPalette: Palette = {
  primary:        '#C8553D',
  primaryHover:   '#D26B53',
  primaryPressed: '#B14732',
  primarySoft:    '#3D1F18',   // deep terracotta tint for dark surfaces
  primaryInk:     '#FBE9E2',

  accent:         '#3F8576',
  accentSoft:     '#1F3D36',

  paper:          '#181512',   // deep warm earth
  surface:        '#211C18',   // slightly raised
  // Neutrals invert smoothly — n50 (background tint) → darkest, n800 → lightest
  n50:            '#272320',
  n100:           '#312B26',
  n200:           '#433A32',
  n300:           '#63574B',
  n400:           '#9C907C',
  n500:           '#C2B7A4',
  n600:           '#DDD5C8',
  n700:           '#ECE6DD',
  n800:           '#F5F1EB',
  ink:            '#F5F1EB',   // paper-cream text

  success:        '#5BA37C',
  successSoft:    '#1F3D2C',
  warning:        '#E0A85A',
  warningSoft:    '#3D2F18',
  danger:         '#D5614F',
  dangerSoft:     '#3D1F18',
  info:           '#5C8DC0',
  infoSoft:       '#1F2D3D',

  overlay:        'rgba(0, 0, 0, 0.55)',
  divider:        'rgba(245, 241, 235, 0.10)',

  glassNeutral:   'rgba(33, 28, 24, 0.72)',
  glassWarm:      'rgba(61, 31, 24, 0.55)',
  glassInk:       'rgba(245, 241, 235, 0.18)',
  glassPin:       'rgba(33, 28, 24, 0.82)',
  glassPinSel:    'rgba(245, 241, 235, 0.78)',
  glassCluster:   'rgba(245, 241, 235, 0.78)',
  glassSheet:     'rgba(24, 21, 18, 0.92)',

  // In dark, "white" surface fills become elevated dark surfaces.
  white60:        'rgba(33, 28, 24, 0.60)',
  white72:        'rgba(33, 28, 24, 0.72)',
  white85:        'rgba(33, 28, 24, 0.85)',
  white95:        'rgba(33, 28, 24, 0.95)',
  white96:        'rgba(33, 28, 24, 0.96)',
  // Pressed/ripple tints flip to light overlays on dark surfaces.
  inkOverlay05:   'rgba(245,241,235,0.05)',
  inkOverlay09:   'rgba(245,241,235,0.10)',
};
