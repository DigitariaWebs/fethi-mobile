import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { Icon } from '@/components';
import { StepHeader } from '@/components/sell/StepHeader';
import { StepFooter } from '@/components/sell/StepFooter';
import { useSellDraft } from '@/lib/sellDraft';

// Phase 5 / Step 1 — Photos. Cover (large) + grid of 6 slots + tip card.
export default function SellPhotos() {
  const C = useColors();
  const router = useRouter();
  const photos = useSellDraft((s) => s.photos);
  const setDraft = useSellDraft((s) => s.set);

  const removeAt = (i: number) => setDraft({ photos: photos.filter((_, idx) => idx !== i) });

  const addFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 8 - photos.length,
      quality: 0.85,
    });
    if (!result.canceled) {
      setDraft({ photos: [...photos, ...result.assets.map((a) => a.uri)].slice(0, 8) });
    }
  };
  const addFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled && result.assets[0]) {
      setDraft({ photos: [...photos, result.assets[0].uri].slice(0, 8) });
    }
  };

  const grid = Array.from({ length: 6 }).map((_, i) => photos[i + 1]);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StepHeader step={1} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 28,
            lineHeight: 33,
            letterSpacing: -0.56,
            color: C.ink,
          }}
        >
          Montre ton{' '}
          <Text
            style={{
              fontFamily: 'InstrumentSerif-Italic',
              fontWeight: '400',
            }}
          >
            objet
          </Text>
          .
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 8, marginBottom: 22 }]}>
          Ajoute jusqu'à 8 photos. La première sera la couverture.
        </Text>

        {/* Cover */}
        <View
          style={{
            aspectRatio: 1.6,
            borderRadius: R.lg,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: C.divider,
            marginBottom: 10,
          }}
        >
          {photos[0] ? (
            <>
              <Image
                source={{ uri: photos[0] }}
                style={{ flex: 1 }}
                contentFit="cover"
              />
              <View
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: R.full,
                  backgroundColor: 'rgba(31,36,33,0.85)',
                }}
              >
                <Text
                  style={{
                    color: '#FFF',
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 11,
                    letterSpacing: 0.44,
                    textTransform: 'uppercase',
                  }}
                >
                  Couverture
                </Text>
              </View>
              <Pressable
                onPress={() => removeAt(0)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Close size={14} color={C.ink} />
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={addFromLibrary}
              style={{
                flex: 1,
                backgroundColor: C.surface,
                borderWidth: 1.5,
                borderColor: C.n300,
                borderStyle: 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Icon.Camera size={28} color={C.n400} />
              <Text style={[t('bodySm'), { color: C.n500 }]}>Ajouter la photo de couverture</Text>
            </Pressable>
          )}
        </View>

        {/* Photo grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {grid.map((p, i) => (
            <View
              key={i}
              style={{
                width: '31.5%',
                aspectRatio: 1,
                borderRadius: R.md,
                overflow: 'hidden',
                borderWidth: p ? 1 : 1.5,
                borderColor: p ? C.divider : C.n300,
                borderStyle: p ? 'solid' : 'dashed',
                backgroundColor: p ? undefined : C.surface,
              }}
            >
              {p ? (
                <>
                  <Image source={{ uri: p }} style={{ flex: 1 }} contentFit="cover" />
                  <Pressable
                    onPress={() => removeAt(i + 1)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon.Close size={12} color={C.ink} />
                  </Pressable>
                </>
              ) : i === photos.length - 1 ? (
                <Pressable
                  onPress={addFromLibrary}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <Icon.Plus size={20} color={C.n500} />
                  <Text
                    style={[
                      t('caption'),
                      { color: C.n500, fontFamily: 'InstrumentSans-Medium' },
                    ]}
                  >
                    Ajouter
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <Pressable
            onPress={addFromCamera}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: R.full,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.n200,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icon.Camera size={16} color={C.ink} />
            <Text
              style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 13, color: C.ink }}
            >
              Prendre une photo
            </Text>
          </Pressable>
          <Pressable
            onPress={addFromLibrary}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: R.full,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.n200,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 3 H 21 V 21 H 3 Z"
                stroke={C.ink}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              <Circle cx={8.5} cy={8.5} r={1.5} fill={C.ink} />
              <Path d="M21 15 l-5 -5 L 5 21" stroke={C.ink} strokeWidth={2} />
            </Svg>
            <Text
              style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 13, color: C.ink }}
            >
              Galerie
            </Text>
          </Pressable>
        </View>

        {/* Tip card */}
        <View
          style={{
            marginTop: 18,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: R.md,
            backgroundColor: C.primarySoft,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
            <Circle cx={12} cy={12} r={10} stroke={C.primary} strokeWidth={2} />
            <Path
              d="M12 16v-4M12 8h.01"
              stroke={C.primary}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
          <Text
            style={[
              t('bodySm'),
              { color: C.primaryInk, lineHeight: 19, flex: 1 },
            ]}
          >
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold' }}>
              Les annonces avec 3+ photos se vendent 4× plus vite.
            </Text>{' '}
            Privilégie la lumière naturelle et un fond épuré.
          </Text>
        </View>
      </ScrollView>

      <StepFooter
        ctaDisabled={photos.length === 0}
        onCta={() => router.push('/sell/title')}
      />
    </View>
  );
}
