import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { CategoryGlyph as Name } from '@/lib/categories';

// Compact 24x24 stroke glyph atlas used by the category picker. All paths
// share `strokeLinecap=round`, `strokeLinejoin=round`, and a single tint
// color so categories sit visually consistent in the list.

type Props = {
  name: Name;
  size?: number;
  color?: string;
};

export function CategoryGlyph({ name, size = 18, color = '#1F2421' }: Props) {
  const sw = 1.7;
  const c = color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {render(name, c, sw)}
    </Svg>
  );
}

function render(name: Name, c: string, sw: number) {
  switch (name) {
    case 'home':
      return (
        <>
          <Path d="M3 11 L12 4 L21 11 V20 H15 V14 H9 V20 H3 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </>
      );
    case 'kitchen':
      return (
        <>
          <Path d="M3 13 H17 V17 A4 4 0 0 1 13 21 H7 A4 4 0 0 1 3 17 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M17 14 L21 14" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <Path d="M7 5 V9 M11 4 V9 M15 5 V9" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
    case 'tool':
      return (
        <>
          <Path d="M14 6 a4 4 0 0 1 4 4 L20.5 12.5 L17 16 L14 13 a4 4 0 0 1 0-7 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M14 13 L4 21 L3 20 L11 12" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </>
      );
    case 'leaf':
      return (
        <Path d="M4 20 C4 11 11 4 20 4 C20 13 13 20 4 20 Z M4 20 L14 10" stroke={c} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
      );
    case 'pet':
      return (
        <>
          <Circle cx={6} cy={10} r={2} stroke={c} strokeWidth={sw} />
          <Circle cx={10} cy={6} r={2} stroke={c} strokeWidth={sw} />
          <Circle cx={14} cy={6} r={2} stroke={c} strokeWidth={sw} />
          <Circle cx={18} cy={10} r={2} stroke={c} strokeWidth={sw} />
          <Path d="M8 18 a4 4 0 0 1 8 0 c0 2-2 3-4 3 s-4-1-4-3 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </>
      );
    case 'garment':
      return (
        <Path d="M8 4 L4 7 L6 10 L8 9 V20 H16 V9 L18 10 L20 7 L16 4 L14 6 a2 2 0 0 1-4 0 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      );
    case 'shoe':
      return (
        <Path d="M3 17 V13 L8 12 L11 7 H13 V13 L20 16 V19 H4 a1 1 0 0 1 -1 -1 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      );
    case 'bag':
      return (
        <>
          <Path d="M5 9 H19 L18 20 H6 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M9 9 V7 a3 3 0 0 1 6 0 V9" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
    case 'jewelry':
      return (
        <>
          <Path d="M5 9 H19 L12 20 Z M5 9 L8 5 H16 L19 9 M9 9 L12 5 L15 9" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </>
      );
    case 'beauty':
      return (
        <>
          <Path d="M9 3 H15 V7 H9 Z" stroke={c} strokeWidth={sw} />
          <Path d="M8 9 H16 L17 14 V20 H7 V14 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M9 14 H15" stroke={c} strokeWidth={sw} />
        </>
      );
    case 'baby':
      return (
        <>
          <Circle cx={12} cy={11} r={4} stroke={c} strokeWidth={sw} />
          <Path d="M9 17 V20 M15 17 V20 M9 14 a3 3 0 0 1-6 0 a3 3 0 0 1 6 0 M15 14 a3 3 0 0 0 6 0 a3 3 0 0 0-6 0" stroke={c} strokeWidth={sw} />
        </>
      );
    case 'toy':
      return (
        <>
          <Circle cx={12} cy={13} r={6} stroke={c} strokeWidth={sw} />
          <Circle cx={12} cy={13} r={1.5} fill={c} />
          <Path d="M7 6 a2 2 0 0 1 3-1 M14 5 a2 2 0 0 1 3 1" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
    case 'office':
      return (
        <>
          <Path d="M14 3 L21 10 L9 22 L3 22 L3 16 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M12 5 L19 12" stroke={c} strokeWidth={sw} />
        </>
      );
    case 'chip':
      return (
        <>
          <Rect x={6} y={6} width={12} height={12} rx={2} stroke={c} strokeWidth={sw} />
          <Rect x={9} y={9} width={6} height={6} stroke={c} strokeWidth={sw} />
          <Path d="M9 3 V6 M15 3 V6 M9 18 V21 M15 18 V21 M3 9 H6 M3 15 H6 M18 9 H21 M18 15 H21" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
    case 'phone':
      return (
        <>
          <Rect x={7} y={2} width={10} height={20} rx={2} stroke={c} strokeWidth={sw} />
          <Path d="M11 18 H13" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
    case 'laptop':
      return (
        <>
          <Path d="M5 5 H19 V16 H5 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M3 19 H21" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
    case 'tv':
      return (
        <>
          <Path d="M3 5 H21 V17 H3 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M9 21 H15 M12 17 V21" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
    case 'camera':
      return (
        <>
          <Path d="M3 8 H7 L9 5 H15 L17 8 H21 V19 H3 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Circle cx={12} cy={13} r={3.5} stroke={c} strokeWidth={sw} />
        </>
      );
    case 'gamepad':
      return (
        <>
          <Path d="M7 7 H17 a4 4 0 0 1 4 4 V14 a3 3 0 0 1-5 2 L14 14 H10 L8 16 a3 3 0 0 1-5-2 V11 a4 4 0 0 1 4-4 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M8 11 V13 M7 12 H9" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <Circle cx={15} cy={12} r={1} fill={c} />
          <Circle cx={17} cy={11} r={1} fill={c} />
        </>
      );
    case 'book':
      return (
        <>
          <Path d="M4 4 H10 a2 2 0 0 1 2 2 V20 a2 2 0 0 0-2-2 H4 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M20 4 H14 a2 2 0 0 0-2 2 V20 a2 2 0 0 1 2-2 H20 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </>
      );
    case 'music':
      return (
        <>
          <Path d="M9 17 V5 L19 3 V15" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Circle cx={7} cy={17} r={2.5} stroke={c} strokeWidth={sw} />
          <Circle cx={17} cy={15} r={2.5} stroke={c} strokeWidth={sw} />
        </>
      );
    case 'sport':
      return (
        <>
          <Path d="M5 9 V15 M19 9 V15" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <Path d="M3 11 V13 M21 11 V13" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <Path d="M7 12 H17" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <Rect x={5} y={9} width={2} height={6} stroke={c} strokeWidth={sw} />
          <Rect x={17} y={9} width={2} height={6} stroke={c} strokeWidth={sw} />
        </>
      );
    case 'tent':
      return (
        <>
          <Path d="M3 20 L12 4 L21 20 Z M12 4 V20" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M9 20 L12 16 L15 20" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </>
      );
    case 'bike':
      return (
        <>
          <Circle cx={6} cy={16} r={4} stroke={c} strokeWidth={sw} />
          <Circle cx={18} cy={16} r={4} stroke={c} strokeWidth={sw} />
          <Path d="M6 16 L11 7 L15 7 L18 16 M11 7 L8 7" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </>
      );
    case 'car':
      return (
        <>
          <Path d="M4 16 V12 L6 7 H18 L20 12 V16 H17 V18 H15 V16 H9 V18 H7 V16 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Circle cx={8} cy={14} r={1} fill={c} />
          <Circle cx={16} cy={14} r={1} fill={c} />
        </>
      );
    case 'art':
      return (
        <>
          <Path d="M12 4 a8 8 0 1 0 4 14 a2 2 0 0 1 2-2 H20 a2 2 0 0 0 2-2 A8 8 0 0 0 12 4 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
          <Circle cx={8} cy={10} r={1} fill={c} />
          <Circle cx={12} cy={7} r={1} fill={c} />
          <Circle cx={16} cy={10} r={1} fill={c} />
        </>
      );
    case 'gift':
      return (
        <>
          <Path d="M3 9 H21 V12 H3 Z M5 12 H19 V20 H5 Z M12 5 V20 M12 9 a3 3 0 0 0-6-3 a3 3 0 0 1 6 3 Z M12 9 a3 3 0 0 1 6-3 a3 3 0 0 0-6 3 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </>
      );
    case 'service':
      return (
        <>
          <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={sw} />
          <Path d="M8 13 L11 16 L17 9" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'other':
      return (
        <>
          <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={sw} />
          <Path d="M8 12 H8.01 M12 12 H12.01 M16 12 H16.01" stroke={c} strokeWidth={sw + 0.5} strokeLinecap="round" />
        </>
      );
    default:
      return null;
  }
}
