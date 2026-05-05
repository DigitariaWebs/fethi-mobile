import { View, Text } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { useColors } from '@/theme';
import type { CardBrand } from '@/lib/payments';

// Compact card-brand badge — matches Stripe's inline glyph treatment in
// their card form (small rounded rect with the brand wordmark / logo).
export function CardBrandGlyph({ brand, size = 'sm' }: { brand: CardBrand; size?: 'sm' | 'md' }) {
  const C = useColors();
  const w = size === 'md' ? 40 : 28;
  const h = size === 'md' ? 26 : 18;

  if (brand === 'visa') {
    return (
      <View style={{ width: w, height: h, borderRadius: 4, backgroundColor: '#1A1F71', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FFC107', fontFamily: 'InstrumentSans-Bold', fontSize: size === 'md' ? 11 : 8, letterSpacing: 0.5 }}>
          VISA
        </Text>
      </View>
    );
  }
  if (brand === 'mastercard') {
    return (
      <View style={{ width: w, height: h, borderRadius: 4, backgroundColor: '#FFF', borderWidth: 1, borderColor: C.divider, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size === 'md' ? 22 : 16} height={size === 'md' ? 14 : 10} viewBox="0 0 32 20">
          <Path d="M11 3 a7 7 0 1 0 0 14 a7 7 0 1 0 0-14" fill="#EA001B" />
          <Path d="M21 3 a7 7 0 1 0 0 14 a7 7 0 1 0 0-14" fill="#F79E1B" />
          <Path d="M16 5 a7 7 0 0 1 0 10 a7 7 0 0 1 0-10" fill="#FF5F00" />
        </Svg>
      </View>
    );
  }
  if (brand === 'amex') {
    return (
      <View style={{ width: w, height: h, borderRadius: 4, backgroundColor: '#2E77BB', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FFF', fontFamily: 'InstrumentSans-Bold', fontSize: size === 'md' ? 9 : 7, letterSpacing: 0.5 }}>
          AMEX
        </Text>
      </View>
    );
  }
  return (
    <View
      style={{
        width: w,
        height: h,
        borderRadius: 4,
        backgroundColor: C.n100,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size === 'md' ? 18 : 12} height={size === 'md' ? 12 : 8} viewBox="0 0 24 16">
        <Rect x={2} y={2} width={20} height={12} rx={2} stroke={C.n400} strokeWidth={1.5} fill="none" />
        <Rect x={2} y={6} width={20} height={2} fill={C.n400} />
      </Svg>
    </View>
  );
}
