import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter, usePathname } from 'expo-router';

import { useColors, shadow as Sh } from '@/theme';
import { Icon } from '@/components';

// Layout constants exported so other screens can reserve space for the
// floating bar (e.g. the map sheet pads its bottom by this amount so its
// content stops just above the bar).
export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_GAP_TOP = 12; // visual gap between sheet content and bar
export const TAB_BAR_MIN_BOTTOM = 12; // matches paddingBottom floor below

// Total vertical space the floating bar reserves at the bottom of the screen.
export function useFloatingTabBarSpace() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + TAB_BAR_GAP_TOP + Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM);
}

// Floating pill tab bar. Sits above the safe-area inset, fully rounded,
// with a soft drop shadow and a brand-tinted Sell button raised slightly
// out of the bar's center.
//
// The Sell tab is registered as a normal screen so expo-router knows
// about the route, but tapping it pushes /sell as a modal instead of
// switching tabs — matches the original tabBarButton override.
// Routes that should hide the floating tab bar (immersive sub-screens
// where chrome would compete with content — chat threads, listing
// detail, etc.). Pattern-matched against `usePathname()`.
const HIDE_ON: RegExp[] = [
  /^\/messages\/[^/]+$/, // /messages/<thread-id>
];

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  if (HIDE_ON.some((re) => re.test(pathname))) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM),
        paddingHorizontal: 16,
        alignItems: 'center',
      }}
    >
      <View
        style={[
          Sh.strong,
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: C.surface,
            borderRadius: 999,
            paddingHorizontal: 8,
            height: 64,
            borderWidth: 1,
            borderColor: C.divider,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            (options.tabBarLabel as string | undefined) ??
            (options.title as string | undefined) ??
            route.name;
          const isSell = route.name === 'sell-tab';
          const badge = options.tabBarBadge as number | undefined;

          const onPress = () => {
            if (isSell) {
              router.push('/sell');
              return;
            }
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          if (isSell) {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                hitSlop={6}
                style={{
                  width: 56,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={[
                    Sh.primaryGlow,
                    {
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: C.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}
                >
                  <Icon.Plus size={22} color="#FFF" />
                </View>
              </Pressable>
            );
          }

          const tint = focused ? C.primary : C.n500;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              hitSlop={6}
              style={{
                flex: 1,
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <View>
                <TabIcon name={route.name} color={tint} active={focused} />
                {badge ? <Badge count={badge} /> : null}
              </View>
              <Text
                style={{
                  fontFamily: focused
                    ? 'InstrumentSans-SemiBold'
                    : 'InstrumentSans-Medium',
                  fontSize: 10,
                  color: tint,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Badge({ count }: { count: number }) {
  const C = useColors();
  return (
    <View
      style={{
        position: 'absolute',
        top: -4,
        right: -8,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: C.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: C.surface,
      }}
    >
      <Text
        style={{
          color: '#FFF',
          fontFamily: 'InstrumentSans-Bold',
          fontSize: 9,
          lineHeight: 11,
        }}
      >
        {count}
      </Text>
    </View>
  );
}

function TabIcon({
  name,
  color,
  active,
}: {
  name: string;
  color: string;
  active: boolean;
}) {
  const sw = active ? 2.2 : 1.8;
  switch (name) {
    case 'map':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
            stroke={color}
            strokeWidth={sw}
          />
          <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={sw} />
        </Svg>
      );
    case 'search':
      return <Icon.Search size={22} color={color} />;
    case 'messages':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'profile':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? color : 'none'}>
          <Path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            stroke={color}
            strokeWidth={sw}
          />
          <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={sw} />
        </Svg>
      );
    default:
      return null;
  }
}
