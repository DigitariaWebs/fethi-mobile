import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSAvatar } from '@/components';
import {
  threadsApi,
  callsApi,
  listingMainPhoto,
  formatListingPrice,
  resolveImageUrl,
  type ApiThread,
  type ApiMessage,
} from '@/lib/api';

// Emojis rapides pour l'inline picker (Messenger-style)
const QUICK_EMOJIS = [
  '😀','😂','🥰','😍','😘','🤩','😎','🤔','😅','😭',
  '😡','🥺','👍','👎','❤️','🔥','💯','🙏','👏','✨',
  '🎉','😴','🤝','📦','🏠','🚲','🛍️','💰','🤑','✅',
];

// Phase 4 / Screens 37 + 38 — chat thread, branche backend.
//
// Flux :
//   1. Au mount : GET /me/threads/{id} (thread + listing + other) puis GET messages
//   2. Polling : toutes les 4s, GET /messages/since?ts=<last> pour les nouveaux
//   3. Send : POST /messages, on append optimistiquement
//   4. Au focus de l'ecran : POST /read pour marquer comme lu

// Polling toutes les 2s pour un rendu "quasi temps reel".
// Pour du vrai temps reel : passer en WebSocket / SSE (a faire en phase 2).
const POLL_INTERVAL_MS = 2000;

function hhmm(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d >= today) return "Aujourd'hui";
  if (d >= yesterday) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Chat() {
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [thread, setThread] = useState<ApiThread | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [composerFocused, setComposerFocused] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const lastTsRef = useRef<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Chargement initial
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const [t, m] = await Promise.all([
          threadsApi.get(id),
          threadsApi.messages(id, 0, 100),
        ]);
        if (!alive) return;
        setThread(t);
        setMessages(m.content);
        lastTsRef.current = m.content.length > 0
          ? new Date(m.content[m.content.length - 1].createdAt).getTime()
          : Date.now();
        // Marque comme lu cote backend
        await threadsApi.markRead(id).catch(() => {});
      } catch (e) {
        console.warn('thread load failed', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // Polling des nouveaux messages.
  // IMPORTANT : dedupe par id pour eviter les doublons quand le polling
  // recupere un message qu'on vient juste d'envoyer (race condition avec
  // l'insert optimiste de handleSend).
  useEffect(() => {
    if (!id) return;
    pollRef.current = setInterval(async () => {
      try {
        const since = lastTsRef.current;
        if (!since) return;
        const fresh = await threadsApi.messagesSince(id, since);
        if (fresh.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = fresh.filter((m) => !existingIds.has(m.id));
            return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
          });
          lastTsRef.current = new Date(fresh[fresh.length - 1].createdAt).getTime();
          threadsApi.markRead(id).catch(() => {});
        }
      } catch {
        // ignore les erreurs reseau temporaires
      }
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id]);

  // Auto-scroll en bas a chaque nouveau message
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    if (!id || !draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    setSending(true);

    // Optimistic insert
    const optimistic: ApiMessage = {
      id: 'tmp-' + Date.now(),
      threadId: id,
      senderId: 'me',
      kind: 'TEXT',
      text,
      imageUrl: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const real = await threadsApi.send(id, text);
      setMessages((prev) => {
        // Cas 1 : l'optimiste est toujours la -> on le remplace par le reel
        // Cas 2 : le poll a deja insere le reel -> on retire juste l'optimiste
        const alreadyHasReal = prev.some((m) => m.id === real.id);
        if (alreadyHasReal) {
          return prev.filter((m) => m.id !== optimistic.id);
        }
        return prev.map((m) => (m.id === optimistic.id ? real : m));
      });
      lastTsRef.current = new Date(real.createdAt).getTime();
    } catch (e) {
      console.warn('send failed', e);
      // Retire l'optimistic en cas d'echec
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
    } finally {
      setSending(false);
    }
  }, [id, draft, sending]);

  // Picker photo + envoi
  const handlePickAndSendPhoto = useCallback(async () => {
    if (!id || sending) return;
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: false,
      });
      if (result.canceled || !result.assets[0]) return;

      const uri = result.assets[0].uri;
      setSending(true);

      // Optimistic insert (photo locale, sera remplacee par l'URL backend)
      const optimistic: ApiMessage = {
        id: 'tmp-' + Date.now(),
        threadId: id,
        senderId: 'me',
        kind: 'PHOTO',
        text: null,
        imageUrl: uri, // URI locale pour preview immediat
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const real = await threadsApi.sendPhoto(id, uri);
        setMessages((prev) => {
          const alreadyHasReal = prev.some((m) => m.id === real.id);
          if (alreadyHasReal) return prev.filter((m) => m.id !== optimistic.id);
          return prev.map((m) => (m.id === optimistic.id ? real : m));
        });
        lastTsRef.current = new Date(real.createdAt).getTime();
      } catch (e) {
        console.warn('photo send failed', e);
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      } finally {
        setSending(false);
      }
    } catch (e) {
      console.warn('pick photo failed', e);
      setSending(false);
    }
  }, [id, sending]);

  if (loading || !thread) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  const otherName = thread.other?.displayName ?? 'Voisin·e';
  const meId = thread.iAmSeller ? thread.listing?.ownerId : thread.other?.id;
  // Pour distinguer "moi" vs "lui" sans userId reel cote front, on utilise
  // l'astuce : "moi" = senderId qui n'est PAS celui de other.
  const otherId = thread.other?.id;

  const isMe = (m: ApiMessage) =>
    m.senderId !== otherId || m.senderId === 'me'; // 'me' = optimistic insert

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: C.paper }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 12,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: C.divider,
          backgroundColor: C.paper,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon.Chevron size={18} color={C.ink} dir="left" />
        </Pressable>
        <MSAvatar name={otherName} size={36} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={[t('body'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}
          >
            {otherName}
          </Text>
          {thread.listing ? (
            <Text numberOfLines={1} style={[t('caption'), { color: C.n500 }]}>
              {thread.listing.title}
            </Text>
          ) : null}
        </View>
        {/* Bouton appel securise (VoIP via Jitsi, audio par defaut) */}
        <Pressable
          onPress={async () => {
            try {
              const call = await callsApi.initiate(thread.id, 'AUDIO');
              router.push(`/call/${call.id}` as any);
            } catch (err) {
              console.warn('initiate call failed', err);
            }
          }}
          hitSlop={8}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: C.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>📞</Text>
        </Pressable>
      </View>

      {/* Bandeau listing (cliquable) */}
      {thread.listing ? (
        <Pressable
          onPress={() => router.push(`/listing/${thread.listing!.id}` as any)}
          style={{
            margin: 12,
            padding: 10,
            borderRadius: R.lg,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.divider,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Image
            source={{ uri: listingMainPhoto(thread.listing) }}
            style={{ width: 48, height: 48, borderRadius: R.md }}
            contentFit="cover"
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={[t('bodySm'), { color: C.ink, fontFamily: 'InstrumentSans-SemiBold' }]}
            >
              {thread.listing.title}
            </Text>
            <Text style={[t('caption'), { color: C.n500 }]}>
              {formatListingPrice(thread.listing)}
            </Text>
          </View>
          <Icon.Chevron size={14} color={C.n400} />
        </Pressable>
      ) : null}

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 4 }}
      >
        {messages.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Text style={[t('bodySm'), { color: C.n500, textAlign: 'center' }]}>
              Aucun message pour l'instant.{'\n'}Lance la conversation !
            </Text>
          </View>
        ) : (
          messages.map((m, i) => {
            const mine = isMe(m);
            const showDay =
              i === 0 ||
              new Date(m.createdAt).toDateString() !==
                new Date(messages[i - 1].createdAt).toDateString();
            return (
              <View key={m.id}>
                {showDay ? (
                  <View style={{ alignItems: 'center', marginVertical: 12 }}>
                    <Text style={[t('caption'), { color: C.n500 }]}>
                      {dayLabel(m.createdAt)}
                    </Text>
                  </View>
                ) : null}
                <View
                  style={{
                    alignSelf: mine ? 'flex-end' : 'flex-start',
                    maxWidth: '78%',
                    marginBottom: 4,
                  }}
                >
                  {m.kind === 'PHOTO' && m.imageUrl ? (
                    <View
                      style={[
                        Sh.subtle,
                        {
                          borderRadius: 18,
                          borderBottomRightRadius: mine ? 4 : 18,
                          borderBottomLeftRadius: mine ? 18 : 4,
                          overflow: 'hidden',
                          backgroundColor: mine ? C.primary : C.surface,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: resolveImageUrl(m.imageUrl) }}
                        style={{ width: 220, height: 220 }}
                        contentFit="cover"
                      />
                      {m.text ? (
                        <Text
                          style={[
                            t('body'),
                            {
                              color: mine ? '#FFF' : C.ink,
                              lineHeight: 20,
                              paddingHorizontal: 14,
                              paddingVertical: 8,
                            },
                          ]}
                        >
                          {m.text}
                        </Text>
                      ) : null}
                    </View>
                  ) : (
                    <View
                      style={[
                        Sh.subtle,
                        {
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderRadius: 18,
                          borderBottomRightRadius: mine ? 4 : 18,
                          borderBottomLeftRadius: mine ? 18 : 4,
                          backgroundColor: mine ? C.primary : C.surface,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          t('body'),
                          { color: mine ? '#FFF' : C.ink, lineHeight: 20 },
                        ]}
                      >
                        {m.text}
                      </Text>
                    </View>
                  )}
                  <Text
                    style={[
                      t('caption'),
                      {
                        color: C.n500,
                        marginTop: 2,
                        marginHorizontal: 8,
                        alignSelf: mine ? 'flex-end' : 'flex-start',
                      },
                    ]}
                  >
                    {hhmm(m.createdAt)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Picker emoji (s'affiche au-dessus du composer quand ouvert) */}
      {emojiPickerOpen && (
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: C.divider,
            backgroundColor: C.surface,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 4,
          }}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => {
                setDraft((d) => d + emoji);
              }}
              style={{
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 22 }}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Composer */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: C.divider,
          backgroundColor: C.paper,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 6,
        }}
      >
        {/* Bouton photo */}
        <Pressable
          onPress={handlePickAndSendPhoto}
          disabled={sending}
          style={{
            width: 40,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>📷</Text>
        </Pressable>

        {/* Bouton emoji picker */}
        <Pressable
          onPress={() => setEmojiPickerOpen((v) => !v)}
          style={{
            width: 40,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>{emojiPickerOpen ? '⌨️' : '😊'}</Text>
        </Pressable>

        <View
          style={{
            flex: 1,
            backgroundColor: C.surface,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: composerFocused ? C.ink : C.n200,
            paddingHorizontal: 14,
            paddingVertical: 10,
            minHeight: 44,
            maxHeight: 120,
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onFocus={() => {
              setComposerFocused(true);
              setEmojiPickerOpen(false); // ferme le picker quand on tape
            }}
            onBlur={() => setComposerFocused(false)}
            placeholder="Message…"
            placeholderTextColor={C.n400}
            multiline
            style={{
              fontFamily: 'InstrumentSans',
              fontSize: 15,
              color: C.ink,
              padding: 0,
            }}
          />
        </View>
        <Pressable
          onPress={handleSend}
          disabled={!draft.trim() || sending}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: draft.trim() && !sending ? C.primary : C.n200,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {sending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={{ color: '#FFF', fontSize: 18, fontFamily: 'InstrumentSans-Bold' }}>
              ➤
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
