import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, MSGlass } from '@/components';

const MIN_AGE = 13;
const MAX_AGE = 99;
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

type Props = {
  visible: boolean;
  initial?: number | null;
  onCancel: () => void;
  onSelect: (age: number) => void;
};

// iOS-style wheel age picker presented as a bottom sheet. Snaps to the
// nearest age on momentum stop, and the highlight band sits in the middle
// of the visible window.
export function AgePickerSheet({ visible, initial, onCancel, onSelect }: Props) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const selectedRef = useRef<number>(initial ?? 30);
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Animate the dim layer in/out alongside the modal.
  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, overlayOpacity]);

  // When the sheet opens, scroll to the initial age.
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => {
      const startAge = initial ?? 30;
      const clamped = Math.max(MIN_AGE, Math.min(MAX_AGE, startAge));
      scrollRef.current?.scrollTo({
        y: (clamped - MIN_AGE) * ITEM_HEIGHT,
        animated: false,
      });
      selectedRef.current = clamped;
    }, 50);
    return () => clearTimeout(id);
  }, [visible, initial]);

  const onScrollEnd = (offsetY: number) => {
    const index = Math.round(offsetY / ITEM_HEIGHT);
    selectedRef.current = AGES[index] ?? AGES[0];
    // Snap to the rounded position.
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  const wheelHeight = ITEM_HEIGHT * VISIBLE_ITEMS;
  const padding = (wheelHeight - ITEM_HEIGHT) / 2;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(31,36,33,0.45)',
          opacity: overlayOpacity,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onCancel} />
      </Animated.View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: C.paper,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingTop: 10,
          paddingBottom: 24 + insets.bottom,
        }}
      >
        {/* Grabber */}
        <View
          style={{
            width: 40,
            height: 5,
            borderRadius: 3,
            backgroundColor: C.n300,
            alignSelf: 'center',
            marginBottom: 8,
          }}
        />

        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: C.divider,
          }}
        >
          <Pressable onPress={onCancel} hitSlop={8} style={{ paddingVertical: 6 }}>
            <Text
              style={[t('body'), { color: C.n600, fontFamily: 'InstrumentSans-Medium' }]}
            >
              Cancel
            </Text>
          </Pressable>
          <Text
            style={[t('h3'), { fontSize: 17, color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}
          >
            Your age
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Wheel */}
        <View style={{ height: wheelHeight, position: 'relative' }}>
          {/* Highlight band */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: padding,
              left: 24,
              right: 24,
              height: ITEM_HEIGHT,
              borderRadius: R.md,
              backgroundColor: C.primarySoft,
              borderWidth: 1,
              borderColor: 'rgba(200,85,61,0.18)',
            }}
          />
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => onScrollEnd(e.nativeEvent.contentOffset.y)}
            onScrollEndDrag={(e) => {
              if (Platform.OS === 'android') {
                onScrollEnd(e.nativeEvent.contentOffset.y);
              }
            }}
            contentContainerStyle={{
              paddingTop: padding,
              paddingBottom: padding,
            }}
          >
            {AGES.map((age) => (
              <View
                key={age}
                style={{
                  height: ITEM_HEIGHT,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 22,
                    color: C.ink,
                  }}
                >
                  {age}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <MSButton
            size="lg"
            fullWidth
            onPress={() => onSelect(selectedRef.current)}
          >
            Confirm
          </MSButton>
        </View>
      </View>
    </Modal>
  );
}
