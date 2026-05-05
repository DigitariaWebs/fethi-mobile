import type { TextStyle } from 'react-native';
import { font, type, type TypeKey } from './tokens';

// ms-t() helper — produces an RN-compatible TextStyle from a token key.
// The design uses both Instrument Sans (variable weights) and Instrument Serif.
// RN selects font weight via family suffix on iOS, so we map weight→family for sans.
export function ms_t(key: TypeKey): TextStyle {
  const t = type[key];
  const sansFamily =
    t.weight === '600' ? 'InstrumentSans-SemiBold'
    : t.weight === '700' ? 'InstrumentSans-Bold'
    : t.weight === '500' ? 'InstrumentSans-Medium'
    : 'InstrumentSans';

  return {
    fontFamily: t.family === 'display' ? font.display : sansFamily,
    fontSize: t.size,
    fontWeight: t.weight,
    // RN lineHeight is absolute pixels, not unitless; multiply by size.
    lineHeight: t.size * t.lh,
    letterSpacing: t.ls,
  };
}

export const t = ms_t;
