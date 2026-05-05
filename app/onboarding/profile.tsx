import { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSButton } from '@/components';
import { useSession } from '@/lib/session';
import { AgePickerSheet } from '@/components/onboarding/AgePickerSheet';
import { PROFESSIONS, searchProfessions } from '@/lib/professions';

export default function Profile() {
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const setDisplayName = useSession((s) => s.setDisplayName);
  const setAvatar = useSession((s) => s.setAvatar);
  const avatarUri = useSession((s) => s.avatarUri);

  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [profession, setProfession] = useState('');
  const [profFocused, setProfFocused] = useState(false);
  const [agePickerOpen, setAgePickerOpen] = useState(false);
  const profInputRef = useRef<TextInput>(null);

  const filled = name.trim().length > 1;

  const profSuggestions = useMemo(
    () => searchProfessions(profession, 10),
    [profession],
  );
  const showProfDropdown = profFocused;
  const isCustom =
    profession.trim().length > 1 &&
    !PROFESSIONS.some((p) => p.toLowerCase() === profession.trim().toLowerCase());

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: C.paper }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          zIndex: 20,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.n100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.Chevron size={18} dir="left" color={C.ink} />
        </Pressable>
        <Text style={[t('caption'), { color: C.n500 }]}>Étape 2 sur 2</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 28,
            lineHeight: 32,
            letterSpacing: -0.56,
            color: C.ink,
          }}
        >
          Quelques infos
        </Text>
        <Text style={[t('body'), { color: C.n600, marginTop: 10 }]}>
          Aide tes voisins à te reconnaître. Tu peux tout modifier plus tard.
        </Text>

        {/* Avatar uploader */}
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Pressable onPress={pickAvatar}>
            <View style={{ position: 'relative' }}>
              {avatarUri ? (
                <View
                  style={[
                    Sh.medium,
                    {
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      borderWidth: 4,
                      borderColor: '#FFF',
                      overflow: 'hidden',
                    },
                  ]}
                >
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: 112, height: 112 }}
                    contentFit="cover"
                  />
                </View>
              ) : (
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: C.n50,
                    borderWidth: 2,
                    borderColor: C.n300,
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.Camera size={32} color={C.n400} />
                </View>
              )}
              <View
                style={[
                  Sh.primaryGlow,
                  {
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: C.primary,
                    borderWidth: 3,
                    borderColor: '#FFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <Icon.Camera size={16} color="#FFF" />
              </View>
            </View>
          </Pressable>
        </View>

        {/* Form */}
        <View style={{ marginTop: 32, gap: 14 }}>
          <Field label="Nom affiché">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Comment on t'appelle ?"
              placeholderTextColor={C.n400}
              autoCapitalize="words"
              style={[t('bodyLg'), { flex: 1, color: C.ink, padding: 0 }]}
            />
          </Field>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Age — opens picker sheet */}
            <View style={{ flex: 1 }}>
              <FieldLabel label="Âge" optional />
              <Pressable
                onPress={() => setAgePickerOpen(true)}
                style={[
                  Sh.subtle,
                  {
                    height: 52,
                    paddingHorizontal: 20,
                    backgroundColor: C.surface,
                    borderWidth: 1.5,
                    borderColor: C.n200,
                    borderRadius: R.full,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}
              >
                <Text
                  style={[
                    t('bodyLg'),
                    { color: age != null ? C.ink : C.n400 },
                  ]}
                >
                  {age != null ? String(age) : '—'}
                </Text>
                <Icon.Chevron size={14} color={C.n500} dir="down" />
              </Pressable>
            </View>

            {/* Profession — typeahead */}
            <View style={{ flex: 1.4 }}>
              <FieldLabel label="Profession" optional />
              <View
                style={[
                  Sh.subtle,
                  {
                    height: 52,
                    paddingHorizontal: 20,
                    backgroundColor: C.surface,
                    borderWidth: 1.5,
                    borderColor: profFocused ? C.ink : C.n200,
                    borderRadius: R.full,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                ]}
              >
                <TextInput
                  ref={profInputRef}
                  value={profession}
                  onChangeText={setProfession}
                  onFocus={() => setProfFocused(true)}
                  onBlur={() => {
                    // Delay blur so taps on the dropdown register first.
                    setTimeout(() => setProfFocused(false), 120);
                  }}
                  placeholder="Recherche…"
                  placeholderTextColor={C.n400}
                  style={[t('bodyLg'), { flex: 1, color: C.ink, padding: 0 }]}
                />
                {profession.length > 0 && (
                  <Pressable
                    onPress={() => {
                      setProfession('');
                      profInputRef.current?.focus();
                    }}
                    hitSlop={8}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: C.n200,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon.Close size={10} color={C.n600} />
                    </View>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Profession dropdown */}
        {showProfDropdown && (
          <View
            style={[
              Sh.medium,
              {
                marginTop: 8,
                backgroundColor: C.surface,
                borderRadius: R.lg,
                borderWidth: 1,
                borderColor: C.divider,
                overflow: 'hidden',
                maxHeight: 320,
              },
            ]}
          >
            {/* Custom-add row when input doesn't match a known profession */}
            {isCustom && (
              <Pressable
                onPress={() => {
                  setProfFocused(false);
                  profInputRef.current?.blur();
                }}
                android_ripple={{ color: C.n100 }}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderBottomWidth: profSuggestions.length > 0 ? 1 : 0,
                  borderBottomColor: C.divider,
                  backgroundColor: C.primarySoft,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: C.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.Plus size={14} color="#FFF" />
                </View>
                <Text
                  style={[t('body'), { flex: 1, color: C.primaryInk }]}
                  numberOfLines={1}
                >
                  Utiliser{' '}
                  <Text style={{ fontFamily: 'InstrumentSans-SemiBold' }}>
                    « {profession.trim()} »
                  </Text>
                </Text>
              </Pressable>
            )}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={{ maxHeight: 280 }}
            >
              {profSuggestions.map((p, i) => {
                const matchLen = Math.min(profession.trim().length, p.length);
                const head = p.slice(0, matchLen);
                const tail = p.slice(matchLen);
                return (
                  <Pressable
                    key={p}
                    onPress={() => {
                      setProfession(p);
                      setProfFocused(false);
                      profInputRef.current?.blur();
                    }}
                    android_ripple={{ color: C.n100 }}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 12,
                      borderBottomWidth: i < profSuggestions.length - 1 ? 1 : 0,
                      borderBottomColor: C.divider,
                    }}
                  >
                    <Text style={[t('body'), { color: C.n500 }]} numberOfLines={1}>
                      {profession.trim().length > 0 ? (
                        <>
                          <Text
                            style={{
                              color: C.ink,
                              fontFamily: 'InstrumentSans-SemiBold',
                            }}
                          >
                            {head}
                          </Text>
                          {tail}
                        </>
                      ) : (
                        <Text style={{ color: C.ink }}>{p}</Text>
                      )}
                    </Text>
                  </Pressable>
                );
              })}
              {profSuggestions.length === 0 && !isCustom && (
                <View style={{ paddingVertical: 18, paddingHorizontal: 18 }}>
                  <Text style={[t('bodySm'), { color: C.n500 }]}>
                    Continue à taper pour ajouter une profession personnalisée.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 24 + insets.bottom,
          backgroundColor: isDark ? 'rgba(24,21,18,0.95)' : 'rgba(251,248,244,0.95)',
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <MSButton
          size="lg"
          fullWidth
          state={filled ? 'default' : 'disabled'}
          onPress={() => {
            setDisplayName(name);
            router.push('/kyc/intro?signup=1' as any);
          }}
        >
          Continuer
        </MSButton>
      </View>

      {/* Age picker sheet */}
      <AgePickerSheet
        visible={agePickerOpen}
        initial={age}
        onCancel={() => setAgePickerOpen(false)}
        onSelect={(picked) => {
          setAge(picked);
          setAgePickerOpen(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

function FieldLabel({ label, optional }: { label: string; optional?: boolean }) {
  const C = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 6,
      }}
    >
      <Text
        style={[
          t('label'),
          { color: C.n700, textTransform: 'none', letterSpacing: 0 },
        ]}
      >
        {label}
      </Text>
      {optional && <Text style={[t('caption'), { color: C.n500 }]}>Facultatif</Text>}
    </View>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const C = useColors();
  return (
    <View>
      <FieldLabel label={label} optional={optional} />
      <View
        style={[
          Sh.subtle,
          {
            height: 52,
            paddingHorizontal: 20,
            backgroundColor: C.surface,
            borderWidth: 1.5,
            borderColor: C.n200,
            borderRadius: R.full,
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}
