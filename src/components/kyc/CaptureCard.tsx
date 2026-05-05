import { Pressable, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { useColors, t } from '@/theme';

// Reusable capture-frame card for the KYC flow. Renders a brand-coloured
// guide overlay with corner brackets (rectangle for IDs, oval for the
// selfie). Tapping the central CTA simulates a capture.
export function CaptureCard({
  shape,
  label,
  onCapture,
}: {
  shape: 'rect' | 'oval';
  label: string;
  onCapture: () => void;
}) {
  const C = useColors();
  return (
    <View
      style={{
        marginVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <View
        style={{
          width: 280,
          height: shape === 'rect' ? 180 : 240,
          borderRadius: shape === 'oval' ? 120 : 16,
          borderWidth: 2,
          borderColor: 'rgba(31,36,33,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(31,36,33,0.04)',
          overflow: 'hidden',
        }}
      >
        {shape === 'rect' ? (
          <Svg width={280} height={180} viewBox="0 0 280 180" style={{ position: 'absolute' }}>
            <Line x1={6} y1={6} x2={36} y2={6} stroke={C.primary} strokeWidth={3} strokeLinecap="round" />
            <Line x1={6} y1={6} x2={6} y2={36} stroke={C.primary} strokeWidth={3} strokeLinecap="round" />
            <Line x1={244} y1={6} x2={274} y2={6} stroke={C.primary} strokeWidth={3} strokeLinecap="round" />
            <Line x1={274} y1={6} x2={274} y2={36} stroke={C.primary} strokeWidth={3} strokeLinecap="round" />
            <Line x1={6} y1={174} x2={6} y2={144} stroke={C.primary} strokeWidth={3} strokeLinecap="round" />
            <Line x1={6} y1={174} x2={36} y2={174} stroke={C.primary} strokeWidth={3} strokeLinecap="round" />
            <Line x1={244} y1={174} x2={274} y2={174} stroke={C.primary} strokeWidth={3} strokeLinecap="round" />
            <Line x1={274} y1={174} x2={274} y2={144} stroke={C.primary} strokeWidth={3} strokeLinecap="round" />
          </Svg>
        ) : (
          <Svg width={280} height={240} viewBox="0 0 280 240" style={{ position: 'absolute' }}>
            <Path
              d="M140 12 a 90 108 0 0 1 0 216 a 90 108 0 0 1 0 -216"
              stroke={C.primary}
              strokeWidth={3}
              fill="none"
              strokeDasharray="8 6"
            />
          </Svg>
        )}
      </View>
      <Text style={[t('caption'), { color: C.n500 }]}>{label}</Text>
      <Pressable
        onPress={onCapture}
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: C.primary,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 4,
          borderColor: C.primarySoft,
        }}
      >
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFF' }} />
      </Pressable>
    </View>
  );
}
