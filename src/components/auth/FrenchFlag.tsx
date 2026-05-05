import Svg, { Rect } from 'react-native-svg';

// Tiny vector French flag — used in the phone-auth country chip instead of
// the 🇫🇷 emoji, which doesn't render on every device/simulator (the
// regional-indicator pair sometimes falls through to the system font and
// shows as two question-mark tofu boxes).
export function FrenchFlag({ size = 18 }: { size?: number }) {
  // 3:2 aspect — most common flag display ratio.
  const w = size;
  const h = Math.round((size / 3) * 2);
  const stripe = w / 3;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect x={0} y={0} width={stripe} height={h} fill="#0055A4" />
      <Rect x={stripe} y={0} width={stripe} height={h} fill="#FFFFFF" />
      <Rect x={stripe * 2} y={0} width={stripe} height={h} fill="#EF4135" />
    </Svg>
  );
}
