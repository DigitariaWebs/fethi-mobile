// Vieux-Lille mock map — vector recreation of the design's MapBG SVG.
// Used as the fallback inside MapHost when expo-maps is unavailable
// (Expo Go, web, snapshot tests). On a real device the Apple Maps view
// covers this entirely.

import Svg, {
  Defs,
  LinearGradient,
  Pattern,
  Rect,
  Stop,
  Path,
  G,
  Text as SvgText,
} from 'react-native-svg';

const BUILDINGS: Array<[number, number, number, number, number]> = [
  [40, 320, 80, 50, 0.5], [140, 320, 50, 50, 0.45],
  [210, 310, 70, 40, 0.5], [300, 320, 60, 50, 0.45],
  [40, 400, 60, 60, 0.45], [120, 400, 100, 70, 0.5],
  [240, 400, 50, 50, 0.45], [310, 400, 60, 60, 0.5],
  [40, 510, 80, 30, 0.45], [140, 500, 70, 40, 0.5],
  [240, 500, 60, 50, 0.45], [320, 510, 50, 40, 0.5],
  [240, 580, 80, 60, 0.5], [330, 600, 50, 60, 0.45],
  [260, 670, 90, 50, 0.5], [40, 760, 70, 40, 0.45],
];

export function MapBackground({ desaturate = true }: { desaturate?: boolean }) {
  return (
    <Svg
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
    >
      <Defs>
        <LinearGradient id="mapPaper" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0%" stopColor="#F2EBDD" />
          <Stop offset="100%" stopColor="#E8DFCB" />
        </LinearGradient>
        <Pattern id="grain" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
          <Rect width="3" height="3" fill="rgba(140,120,90,0.04)" />
        </Pattern>
      </Defs>

      <Rect width="390" height="844" fill="url(#mapPaper)" />
      <Rect width="390" height="844" fill="url(#grain)" />

      {/* Park (Jardin Vauban-ish) */}
      <Path
        d="M 20 580 Q 60 540 130 560 Q 200 580 230 640 Q 220 720 150 730 Q 50 720 20 660 Z"
        fill="#CDD8B6"
        opacity={0.7}
      />
      <Path
        d="M 280 80 Q 340 70 380 100 Q 380 150 350 180 Q 290 175 270 130 Z"
        fill="#CDD8B6"
        opacity={0.6}
      />

      {/* River */}
      <Path
        d="M -10 200 Q 80 220 170 200 Q 260 180 400 220 L 400 240 Q 260 200 170 220 Q 80 240 -10 220 Z"
        fill="#B8CFD9"
        opacity={0.55}
      />

      {/* Buildings */}
      {BUILDINGS.map(([x, y, w, h, o], i) => (
        <Rect key={i} x={x} y={y} width={w} height={h} fill="#D4C9B0" opacity={o} rx={2} />
      ))}

      {/* Streets — major */}
      <G stroke="#FFFEFA" strokeWidth={6} opacity={0.85} fill="none">
        <Path d="M 0 290 Q 100 285 195 295 T 390 290" />
        <Path d="M 0 380 L 390 385" />
        <Path d="M 0 480 Q 200 478 390 485" />
        <Path d="M 0 555 L 390 555" />
        <Path d="M 0 660 Q 100 655 200 665 T 390 660" />
        <Path d="M 0 740 L 390 745" />
        <Path d="M 100 280 L 110 800" />
        <Path d="M 220 280 L 235 800" />
        <Path d="M 320 280 L 305 800" />
        <Path d="M 60 280 L 30 800" />
      </G>
      <G stroke="#FFFEFA" strokeWidth={3} opacity={0.6} fill="none">
        <Path d="M 0 340 L 390 340" />
        <Path d="M 0 430 L 390 430" />
        <Path d="M 160 280 L 170 800" />
        <Path d="M 270 280 L 280 800" />
      </G>

      {/* Street labels */}
      <SvgText x={80} y={370} fontSize={9} fill="#8B7E66" fontFamily="InstrumentSans-Medium" opacity={0.7}>
        rue de la Monnaie
      </SvgText>
      <SvgText x={220} y={475} fontSize={9} fill="#8B7E66" fontFamily="InstrumentSans-Medium" opacity={0.7}>
        rue Royale
      </SvgText>
      <SvgText x={40} y={650} fontSize={9} fill="#8B7E66" fontFamily="InstrumentSans-Medium" opacity={0.7}>
        place du Concert
      </SvgText>

      {desaturate && <Rect width="390" height="844" fill="#FBF8F4" opacity={0.18} />}
    </Svg>
  );
}
