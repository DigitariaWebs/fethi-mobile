import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { MSAvatar } from '../primitives/MSAvatar';
import { MSStars } from '../primitives/MSStars';
import { Icon } from '../icons/Icon';

type SellerStats = { rating: number; count: number };
type Variant = 'default' | 'compact' | 'horizontal' | 'seller';

type Props = {
  variant?: Variant;
  photo?: string;
  title: string;
  price: string;
  distance?: string;
  seller?: string;
  condition?: string;
  sellerStats?: SellerStats;
  views?: number;
  messages?: number;
  status?: 'active' | 'paused' | 'sold';
  saved?: boolean;
  onPress?: () => void;
  onToggleSave?: () => void;
};

function PhotoFill({ photo, height }: { photo?: string; height: number }) {
  const C = useColors();
  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={{ width: '100%', height }}
        contentFit="cover"
      />
    );
  }
  return <View style={{ width: '100%', height, backgroundColor: C.primarySoft }} />;
}

export function MSListingCard(props: Props) {
  const C = useColors();
  const {
    variant = 'default',
    photo,
    title,
    price,
    distance,
    seller,
    condition,
    sellerStats,
    views,
    messages,
    status,
    saved,
    onPress,
    onToggleSave,
  } = props;

  if (variant === 'compact') {
    return (
      <Pressable
        onPress={onPress}
        style={{
          width: 200,
          backgroundColor: C.surface,
          borderRadius: R.lg,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: C.divider,
        }}
      >
        <PhotoFill photo={photo} height={140} />
        <View style={{ padding: 12 }}>
          {distance && (
            <Text style={[t('bodySm'), { color: C.n500, marginBottom: 2 }]}>{distance}</Text>
          )}
          <Text
            numberOfLines={2}
            style={[
              t('body'),
              {
                fontFamily: 'InstrumentSans-SemiBold',
                color: C.ink,
                lineHeight: 19.5,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              t('body'),
              { fontFamily: 'InstrumentSans-Bold', color: C.ink, marginTop: 6 },
            ]}
          >
            {price}
          </Text>
        </View>
      </Pressable>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: 'row',
          gap: 12,
          padding: 12,
          backgroundColor: C.surface,
          borderRadius: R.lg,
          borderWidth: 1,
          borderColor: C.divider,
        }}
      >
        <View style={{ width: 88, height: 88, borderRadius: R.md, overflow: 'hidden' }}>
          <PhotoFill photo={photo} height={88} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          {distance && <Text style={[t('bodySm'), { color: C.n500 }]}>{distance}</Text>}
          <Text
            numberOfLines={2}
            style={[t('body'), { fontFamily: 'InstrumentSans-SemiBold', color: C.ink }]}
          >
            {title}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 4,
            }}
          >
            <Text style={[t('h3'), { color: C.ink }]}>{price}</Text>
            {seller && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MSAvatar name={seller} size={20} />
                <Text style={[t('caption'), { color: C.n600 }]}>{seller}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  if (variant === 'seller') {
    return (
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: C.surface,
          borderRadius: R.lg,
          borderWidth: 1,
          borderColor: C.divider,
          overflow: 'hidden',
        }}
      >
        <View style={{ height: 140, position: 'relative' }}>
          <PhotoFill photo={photo} height={140} />
          {status && (
            <View
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: R.full,
                backgroundColor: status === 'sold' ? C.ink : C.surface,
              }}
            >
              <Text
                style={[
                  t('caption'),
                  {
                    fontFamily: 'InstrumentSans-SemiBold',
                    color: status === 'sold' ? '#FFF' : C.ink,
                  },
                ]}
              >
                {status === 'sold' ? 'Sold' : status === 'paused' ? 'Paused' : 'Active'}
              </Text>
            </View>
          )}
          <Pressable
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: C.white95,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.Dots size={14} color={C.ink} />
          </Pressable>
        </View>
        <View style={{ padding: 12 }}>
          <Text
            numberOfLines={2}
            style={[
              t('body'),
              { fontFamily: 'InstrumentSans-SemiBold', color: C.ink, minHeight: 38 },
            ]}
          >
            {title}
          </Text>
          <Text style={[t('h3'), { color: C.ink, marginTop: 4 }]}>{price}</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon.Eye size={12} color={C.n500} />
              <Text style={[t('caption'), { color: C.n500 }]}>{views} views</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon.Chat size={12} color={C.n500} />
              <Text style={[t('caption'), { color: C.n500 }]}>{messages}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // default — full-width card
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: C.surface,
        borderRadius: R.lg,
        borderWidth: 1,
        borderColor: C.divider,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: 200, position: 'relative' }}>
        <PhotoFill photo={photo} height={200} />
        {condition && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: R.full,
              backgroundColor: C.white96,
            }}
          >
            <Text
              style={[
                t('caption'),
                { fontFamily: 'InstrumentSans-SemiBold', color: C.ink },
              ]}
            >
              {condition}
            </Text>
          </View>
        )}
        <Pressable
          onPress={onToggleSave}
          style={[
            Sh.subtle,
            {
              position: 'absolute',
              top: 12,
              right: 12,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: C.white96,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Icon.Heart
            size={18}
            color={saved ? C.primary : C.ink}
            filled={saved}
          />
        </Pressable>
      </View>
      <View style={{ padding: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 5,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: C.primary,
              }}
            />
            <Text style={[t('caption'), { color: C.n600, letterSpacing: 0 }]}>{distance}</Text>
          </View>
          <Text style={[t('h3'), { color: C.ink }]}>{price}</Text>
        </View>
        <Text
          style={[
            t('body'),
            {
              fontFamily: 'InstrumentSans-SemiBold',
              color: C.ink,
              marginTop: 4,
            },
          ]}
        >
          {title}
        </Text>
        {seller && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 12,
            }}
          >
            <MSAvatar name={seller} size={24} />
            <Text
              style={[
                t('bodySm'),
                { color: C.n700, fontFamily: 'InstrumentSans-Medium' },
              ]}
            >
              {seller}
            </Text>
            {sellerStats && (
              <>
                <Text style={{ color: C.n300 }}>·</Text>
                <MSStars
                  value={sellerStats.rating}
                  count={sellerStats.count}
                  size={11}
                />
              </>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}
