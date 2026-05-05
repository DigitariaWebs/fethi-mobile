# Font assets

The seven Instrument family TTFs are committed to this directory and bundled
at build time via `expo-font` (registered in `src/theme/fonts.ts`).

## Licensing

Both families are released under the **SIL Open Font License v1.1**. No
attribution required in the app UI; license text must remain available.

- Instrument Sans — © 2022 The Instrument Sans Project Authors
- Instrument Serif — © 2022 The Instrument Serif Project Authors

## Source

Pulled from the upstream `Instrument/instrument-sans` and
`Instrument/instrument-serif` GitHub repos (the original foundry source —
Google Fonts ships only variable fonts, which `expo-font` can't address by
weight at runtime, hence the static instances).
