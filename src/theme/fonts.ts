// Local font registration for expo-font.
// Place TTF/OTF files in `./assets/fonts/` with the exact filenames below.
// Sources:
//   Instrument Sans: https://fonts.google.com/specimen/Instrument+Sans
//   Instrument Serif: https://fonts.google.com/specimen/Instrument+Serif
//
// Required files in /assets/fonts:
//   InstrumentSans-Regular.ttf
//   InstrumentSans-Medium.ttf
//   InstrumentSans-SemiBold.ttf
//   InstrumentSans-Bold.ttf
//   InstrumentSans-Italic.ttf
//   InstrumentSerif-Regular.ttf
//   InstrumentSerif-Italic.ttf
//
// The map keys are the family names referenced everywhere via theme/tokens.ts.

export const fontMap = {
  'InstrumentSans':           require('../../assets/fonts/InstrumentSans-Regular.ttf'),
  'InstrumentSans-Medium':    require('../../assets/fonts/InstrumentSans-Medium.ttf'),
  'InstrumentSans-SemiBold':  require('../../assets/fonts/InstrumentSans-SemiBold.ttf'),
  'InstrumentSans-Bold':      require('../../assets/fonts/InstrumentSans-Bold.ttf'),
  'InstrumentSans-Italic':    require('../../assets/fonts/InstrumentSans-Italic.ttf'),
  'InstrumentSerif':          require('../../assets/fonts/InstrumentSerif-Regular.ttf'),
  'InstrumentSerif-Italic':   require('../../assets/fonts/InstrumentSerif-Italic.ttf'),
};
