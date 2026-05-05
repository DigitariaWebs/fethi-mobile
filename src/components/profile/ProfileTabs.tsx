import { Pressable, Text, View } from 'react-native';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';

export type ProfileTabId = 'selling' | 'sold' | 'reviews';

type Props = {
  active: ProfileTabId;
  counts: { selling: number; sold: number; reviews: number };
  onChange: (id: ProfileTabId) => void;
};

const LABELS: Record<ProfileTabId, string> = {
  selling: 'Selling',
  sold: 'Sold',
  reviews: 'Reviews',
};

export function ProfileTabs({ active, counts, onChange }: Props) {
  const C = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 4,
        padding: 4,
        backgroundColor: C.n50,
        borderRadius: R.full,
        borderWidth: 1,
        borderColor: C.divider,
      }}
    >
      {(Object.keys(LABELS) as ProfileTabId[]).map((id) => {
        const sel = active === id;
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            style={[
              sel && Sh.subtle,
              {
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: R.full,
                backgroundColor: sel ? C.surface : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              },
            ]}
          >
            <Text
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 13,
                color: sel ? C.ink : C.n500,
              }}
            >
              {LABELS[id]}
            </Text>
            <Text
              style={[
                t('caption'),
                {
                  fontSize: 11,
                  color: sel ? C.n500 : C.n400,
                  fontFamily: 'InstrumentSans-SemiBold',
                },
              ]}
            >
              {counts[id]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
