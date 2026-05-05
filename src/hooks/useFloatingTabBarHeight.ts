// Single source of truth for the bottom space the floating tab bar
// reserves on tab screens. Tab content (ScrollView/FlatList) should add
// this to its `contentContainerStyle.paddingBottom` so the last items
// aren't hidden behind the bar.
//
// Also exports the same value as `useFloatingTabBarSpace` (the older
// name, still used by the map screen for sheet alignment) so existing
// callers keep working.

export {
  useFloatingTabBarSpace as useFloatingTabBarHeight,
  useFloatingTabBarSpace,
  TAB_BAR_HEIGHT,
  TAB_BAR_GAP_TOP,
  TAB_BAR_MIN_BOTTOM,
} from '@/components/navigation/FloatingTabBar';
