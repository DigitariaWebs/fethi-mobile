import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius as R, t } from '@/theme';
import { Icon } from '@/components';
import { listingsApi, type Listing } from '@/lib/api';

// Phase 3 / Screen 35 — fullscreen photo gallery (backend-driven).
// Black backdrop, glass close/save chrome, paginated photos with thumb strip.
export default function Gallery() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const screenW = Dimensions.get('window').width;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    listingsApi
      .get(id)
      .then((l) => {
        if (alive) setListing(l);
      })
      .catch(() => {
        if (alive) setListing(null);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const photos = useMemo(() => listing?.photos ?? [], [listing]);
  const [active, setActive] = useState(0);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0E0E0F', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#FFF" />
      </View>
    );
  }
  if (!listing || photos.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0E0E0F', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#FFF', textAlign: 'center' }}>Aucune photo disponible.</Text>
        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)' }}
        >
          <Text style={{ color: '#FFF' }}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0E0E0F' }}>
      {/* Top chrome */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          right: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.Close size={18} color="#FFF" />
        </Pressable>
        <Text
          style={{
            color: '#FFF',
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 15,
          }}
        >
          {active + 1} / {photos.length}
        </Text>
        <Pressable
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.Heart size={18} color="#FFF" />
        </Pressable>
      </View>

      {/* Paginated photo viewer */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / screenW);
          setActive(i);
        }}
        style={{ flex: 1, marginTop: insets.top + 60 }}
      >
        {photos.map((p, i) => (
          <View
            key={i}
            style={{
              width: screenW,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <View
              style={{
                width: '100%',
                aspectRatio: 0.85,
                borderRadius: R.lg,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.5,
                shadowRadius: 60,
              }}
            >
              <Image source={{ uri: p }} style={{ flex: 1 }} contentFit="cover" />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Caption */}
      <View
        style={{
          position: 'absolute',
          bottom: 140 + insets.bottom,
          left: 24,
          right: 24,
        }}
      >
        <Text
          style={[
            t('body'),
            { color: 'rgba(255,255,255,0.92)', fontFamily: 'InstrumentSans-Medium', marginBottom: 4 },
          ]}
        >
          Photo {active + 1} sur {photos.length}
        </Text>
        <Text style={[t('caption'), { color: 'rgba(255,255,255,0.55)' }]}>
          Appuie pour zoomer · Glisse pour naviguer
        </Text>
      </View>

      {/* Thumb strip */}
      <View
        style={{
          position: 'absolute',
          bottom: 60 + insets.bottom,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
          paddingHorizontal: 16,
        }}
      >
        {photos.slice(0, 6).map((p, i) => (
          <View
            key={i}
            style={{
              width: 56,
              height: 56,
              borderRadius: R.md,
              borderWidth: 2,
              borderColor: i === active ? '#FFF' : 'transparent',
              opacity: i === active ? 1 : 0.55,
              overflow: 'hidden',
            }}
          >
            <Image source={{ uri: p }} style={{ flex: 1 }} contentFit="cover" />
          </View>
        ))}
      </View>

      {/* Page dots */}
      <View
        style={{
          position: 'absolute',
          bottom: 30 + insets.bottom,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 5,
        }}
      >
        {photos.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === active ? 8 : 5,
              height: i === active ? 8 : 5,
              borderRadius: 4,
              backgroundColor: i === active ? '#FFF' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </View>
    </View>
  );
}
