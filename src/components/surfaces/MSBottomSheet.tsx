import { forwardRef, useMemo, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  type BottomSheetBackdropProps,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { useColors, radius as R, shadow as Sh } from '@/theme';
import { MSGlass } from './MSGlass';

// MyStreet bottom sheet — blurred glass background, paper-warm tint, rounded top.
// Uses @gorhom/bottom-sheet v5 (New Architecture compatible) under the hood.
//
// Common snap points:
//   collapsed: ~200
//   expanded:  ~540 (or 60% of viewport)
//
// `glass` controls whether the sheet uses MSGlass (over the map) or a solid paper
// background (over content). Defaults to `'glass'`.

type Props = Omit<BottomSheetModalProps, 'snapPoints' | 'children'> & {
  snapPoints?: (string | number)[];
  glass?: boolean;
  children?: ReactNode;
  withBackdrop?: boolean;
};

export const MSBottomSheet = forwardRef<BottomSheetModal, Props>(function MSBottomSheet(
  { snapPoints, glass = true, children, withBackdrop = false, ...rest },
  ref,
) {
  const C = useColors();
  const snaps = useMemo(() => snapPoints ?? ['28%', '70%'], [snapPoints]);

  const renderBackdrop = useMemo(
    () =>
      withBackdrop
        ? (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              opacity={0.45}
              pressBehavior="close"
            />
          )
        : undefined,
    [withBackdrop],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snaps}
      backdropComponent={renderBackdrop}
      handleComponent={null}
      backgroundComponent={() =>
        glass ? (
          <MSGlass
            tone="sheet"
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderTopLeftRadius: R.xl2,
                borderTopRightRadius: R.xl2,
              },
            ]}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              Sh.sheet,
              {
                backgroundColor: C.paper,
                borderTopLeftRadius: R.xl2,
                borderTopRightRadius: R.xl2,
              },
            ]}
          />
        )
      }
      {...rest}
    >
      <View
        style={{
          width: 40,
          height: 5,
          borderRadius: 3,
          backgroundColor: C.n300,
          alignSelf: 'center',
          marginTop: 10,
          marginBottom: 8,
        }}
      />
      {children}
    </BottomSheetModal>
  );
});

// Static handle (used inside non-modal sheets like MapHome's pinned sheet).
export function MSSheetHandle() {
  const C = useColors();
  return (
    <View
      style={{
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: C.n300,
        alignSelf: 'center',
        marginVertical: 8,
      }}
    />
  );
}
