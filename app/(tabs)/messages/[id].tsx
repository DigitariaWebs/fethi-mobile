import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
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
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useColors, useIsDark, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSAvatar, MSButton, MSMapPin, MSPill } from '@/components';
import { getThread, type ChatMessage } from '@/lib/threads';

// Phase 4 / Screens 37 + 38 — chat thread.
// Fully interactive log: typing into the composer + tapping send appends a
// message; the seller "types" and replies after a short delay; the offer
// composer pushes an offer card; Accept / Counter / Decline / Confirm
// pickup all mutate the in-memory message list.
//
// State lives only on this screen — when the user navigates away it
// resets to the seeded fixture. Real backend wiring would replace
// `setMessages` calls with mutations.

// Reply pools — different vibe depending on whether the bot is impersonating
// the seller of someone else's listing (negotiation-aware) or the buyer of
// my listing (eager / haggling).
const REPLY_POOL_AS_SELLER = [
  'Je regarde et je reviens vers toi.',
  'OK, ça me va.',
  'Tu peux passer ce soir ?',
  "Disponible quand tu veux.",
  "D'accord, pas de souci.",
  'Je vérifie et je te dis.',
  'Parfait, on fait comme ça.',
];

const REPLY_POOL_AS_BUYER = [
  'Super, merci !',
  "Ça m'arrange aussi.",
  'Top, je te confirme dans la journée.',
  'Tu peux faire un petit geste ?',
  'OK, je suis preneur.',
  'Disons demain en fin de journée ?',
];

const ACCEPT_REPLY_AS_SELLER = "Top, ça marche pour moi !";
const DECLINE_REPLY_AS_SELLER = 'Désolé, je peux pas descendre plus.';
const ACCEPT_REPLY_AS_BUYER = 'Génial, je passe quand tu veux !';
const DECLINE_REPLY_AS_BUYER = 'Pas de souci, merci quand même.';

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function pickReply(text: string, asBuyer: boolean): string {
  const pool = asBuyer ? REPLY_POOL_AS_BUYER : REPLY_POOL_AS_SELLER;
  const lower = text.toLowerCase();
  if (lower.includes('?')) return pool[0];
  if (lower.includes('merci') || lower.includes('parfait')) return 'Avec plaisir !';
  if (lower.includes('quand') || lower.includes('heure') || lower.includes('time'))
    return asBuyer ? 'Demain matin si possible ?' : 'Ce soir vers 19h, ça te va ?';
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Chat() {
  const C = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const thread = getThread(id || '') ?? getThread('karim')!;
  // When iAmSeller is true the bot speaks as the buyer (eager, haggling);
  // otherwise as the seller (negotiating, scheduling).
  const botAsBuyer = thread.iAmSeller;

  const [messages, setMessages] = useState<ChatMessage[]>(thread.seed);
  const [draft, setDraft] = useState('');
  const [composerFocused, setComposerFocused] = useState(false);
  const [offerModal, setOfferModal] = useState<{ visible: boolean; counterTo?: number }>({
    visible: false,
  });
  const [attachMenu, setAttachMenu] = useState(false);
  const [headerMenu, setHeaderMenu] = useState(false);
  const [muted, setMuted] = useState(false);

  // Auto-scroll to the latest message whenever the log changes.
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(id);
  }, [messages]);

  // Track whether a bot reply is in flight so we don't stack typing
  // indicators on rapid sends.
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  const queueBotReply = (text: string, delay = 1400) => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    setMessages((prev) =>
      prev.some((m) => m.kind === 'typing') ? prev : [...prev, { kind: 'typing' }],
    );
    botTimerRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev.filter((m) => m.kind !== 'typing'),
        { kind: 'text', from: 'them', text, time: nowHHMM() },
      ]);
    }, delay);
  };

  const sendText = (raw?: string) => {
    const text = (raw ?? draft).trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev.filter((m) => m.kind !== 'typing'),
      { kind: 'text', from: 'me', text, time: nowHHMM() },
    ]);
    setDraft('');
    queueBotReply(pickReply(text, botAsBuyer));
  };

  // Stock photos to cycle through when the user taps "+ → Photo".
  // Real-world wiring would launch expo-image-picker here.
  const PHOTO_POOL = [
    'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80',
    'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=800&q=80',
  ];
  const photoIdxRef = useRef(0);

  const sendPhoto = () => {
    const uri = PHOTO_POOL[photoIdxRef.current % PHOTO_POOL.length];
    photoIdxRef.current += 1;
    setMessages((prev) => [
      ...prev.filter((m) => m.kind !== 'typing'),
      { kind: 'photo', from: 'me', uri, time: nowHHMM() },
    ]);
    queueBotReply('Top, ça a l\'air bien !');
  };

  const sendLocation = () => {
    setMessages((prev) => [
      ...prev.filter((m) => m.kind !== 'typing'),
      { kind: 'location', from: 'me', address: '14 Rue du 14 Juillet, Lille', time: nowHHMM() },
    ]);
    queueBotReply('Reçu, je vois où c\'est.');
  };

  const sendPickupProposal = () => {
    const proposed = {
      kind: 'pickup' as const,
      from: 'me' as const,
      status: 'pending' as const,
      address: thread.iAmSeller ? '14 Rue du 14 Juillet, Lille' : '42 rue Royale, Vieux-Lille',
      time: "Aujourd'hui, 19:00",
      timestamp: nowHHMM(),
    };
    setMessages((prev) => [...prev.filter((m) => m.kind !== 'typing'), proposed]);
    // Two-second pause, then the other side "accepts": flip the same card
    // to confirmed and follow up with a friendly text.
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    botTimerRef.current = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m === proposed ? { ...proposed, status: 'confirmed' } : m,
        ),
      );
      setMessages((prev) => [
        ...prev,
        {
          kind: 'text',
          from: 'them',
          text: botAsBuyer ? 'Parfait, à ce soir !' : 'Ça me va, on dit ça !',
          time: nowHHMM(),
        },
      ]);
    }, 2000);
  };

  const sendOffer = (amount: number, isCounter = false) => {
    setMessages((prev) => [
      ...prev.filter((m) => m.kind !== 'typing'),
      {
        kind: 'offer',
        from: 'me',
        status: 'pending',
        amount: `€${amount}`,
        listingPrice: thread.listing.priceLabel,
        time: `${nowHHMM()} · envoyée`,
      },
    ]);
    queueBotReply(
      isCounter ? 'Hmm, je réfléchis…' : 'Je regarde, je te dis dans 5 min.',
      1600,
    );
  };

  // Mutate an existing offer in the log (used by Accept / Decline).
  const updateOffer = (
    target: Extract<ChatMessage, { kind: 'offer' }>,
    next: 'accepted' | 'declined',
  ) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.kind === 'offer' && m === target
          ? { ...m, status: next, time: `${next === 'accepted' ? 'Acceptée' : 'Refusée'} à ${nowHHMM()}` }
          : m,
      ),
    );
    if (next === 'accepted') {
      // After acceptance, the natural next step is a pickup proposal.
      // Whoever is the seller in the conversation proposes — buyer-side
      // chat means "they" propose; seller-side means "I" propose and the
      // pickup auto-confirms two seconds later (mock other-side accept).
      botTimerRef.current = setTimeout(() => {
        if (thread.iAmSeller) {
          const proposed = {
            kind: 'pickup' as const,
            from: 'me' as const,
            status: 'pending' as const,
            address: '14 Rue du 14 Juillet, Lille',
            time: "Aujourd'hui, 19:00",
            timestamp: nowHHMM(),
          };
          setMessages((prev) => [
            ...prev,
            {
              kind: 'text',
              from: 'them',
              text: botAsBuyer ? ACCEPT_REPLY_AS_BUYER : ACCEPT_REPLY_AS_SELLER,
              time: nowHHMM(),
            },
            proposed,
          ]);
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((m) => (m === proposed ? { ...proposed, status: 'confirmed' } : m)),
            );
          }, 2000);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              kind: 'pickup',
              from: 'them',
              status: 'pending',
              address: '42 rue Royale, Vieux-Lille',
              time: "Aujourd'hui, 19:00",
              timestamp: nowHHMM(),
            },
            {
              kind: 'text',
              from: 'them',
              text: ACCEPT_REPLY_AS_SELLER,
              time: nowHHMM(),
            },
          ]);
        }
      }, 600);
    } else {
      queueBotReply(botAsBuyer ? DECLINE_REPLY_AS_BUYER : DECLINE_REPLY_AS_SELLER, 1200);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 6,
          backgroundColor: isDark ? "rgba(24,21,18,0.95)" : "rgba(251,248,244,0.95)",
          borderBottomWidth: 1,
          borderBottomColor: C.divider,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            gap: 10,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.Chevron size={18} dir="left" color={C.ink} />
          </Pressable>
          <Pressable
            onPress={() => router.push(`/profile/${thread.seller.id}` as any)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              flex: 1,
              minWidth: 0,
            }}
          >
            <View style={{ position: 'relative' }}>
              <MSAvatar name={thread.seller.name} size={36} />
              {thread.online && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#3FA66B',
                    borderWidth: 2,
                    borderColor: C.paper,
                  }}
                />
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[t('body'), { fontFamily: 'InstrumentSans-SemiBold', color: C.ink }]}>
                {thread.seller.name}
              </Text>
              <Text style={[t('caption'), { color: thread.online ? '#3FA66B' : C.n500 }]}>
                {thread.online ? 'En ligne' : 'Vu il y a 2h'}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setHeaderMenu(true)}
            hitSlop={6}
            style={{
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.Dots size={18} color={C.ink} />
          </Pressable>
        </View>

        {/* Listing context strip — owner POV when iAmSeller, buyer POV otherwise */}
        <Pressable
          onPress={() =>
            router.push(
              thread.iAmSeller
                ? (`/seller/${thread.listing.id}` as any)
                : (`/listing/${thread.listing.id}` as any),
            )
          }
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: C.surface,
            marginHorizontal: 16,
            marginBottom: 12,
            padding: 10,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
          }}
        >
          <View style={{ width: 44, height: 44, borderRadius: R.md, overflow: 'hidden' }}>
            <Image
              source={{ uri: thread.listing.thumb }}
              style={{ width: 44, height: 44 }}
              contentFit="cover"
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[t('caption'), { color: C.n500, marginBottom: 1 }]}>
              {thread.iAmSeller ? 'Ton annonce' : 'À propos de cette annonce'}
            </Text>
            <Text
              numberOfLines={1}
              style={[t('bodySm'), { fontFamily: 'InstrumentSans-SemiBold', color: C.ink }]}
            >
              {thread.listing.title}
            </Text>
          </View>
          <Text style={[t('h3'), { fontSize: 17, color: C.ink }]}>{thread.listing.priceLabel}</Text>
        </Pressable>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m, i) => (
          <Bubble
            key={i}
            m={m}
            listingPrice={thread.listing.priceLabel}
            onAccept={(target) => updateOffer(target, 'accepted')}
            onDecline={(target) => updateOffer(target, 'declined')}
            onCounter={(target) =>
              setOfferModal({
                visible: true,
                counterTo: parseInt(target.amount.replace(/[^0-9]/g, ''), 10),
              })
            }
            onConfirmPickup={(target) => {
              setMessages((prev) =>
                prev.map((p) =>
                  p === target
                    ? { ...target, status: 'confirmed' as const }
                    : p,
                ),
              );
              setMessages((prev) => [
                ...prev,
                {
                  kind: 'text',
                  from: 'me',
                  text: 'Confirmé — à tout à l\'heure !',
                  time: nowHHMM(),
                },
              ]);
            }}
          />
        ))}
      </ScrollView>

      {/* Composer */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {composerFocused && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 6 }}
          >
            <MSPill size="sm" onPress={() => sendText('Toujours disponible ?')}>
              Toujours dispo ?
            </MSPill>
            <MSPill size="sm" onPress={() => sendText('Heure de récupération ?')}>
              Heure de récup ?
            </MSPill>
            <MSPill size="sm" onPress={() => sendText('Possibilité sur le prix ?')}>
              Marge sur le prix ?
            </MSPill>
          </ScrollView>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: isDark ? "rgba(24,21,18,0.95)" : "rgba(251,248,244,0.95)",
            borderTopWidth: 1,
            borderTopColor: C.divider,
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: 12 + insets.bottom,
          }}
        >
          <Pressable
            onPress={() => setAttachMenu(true)}
            hitSlop={6}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.n200,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon.Plus size={18} color={C.ink} />
          </Pressable>
          <View
            style={{
              flex: 1,
              minHeight: 40,
              borderRadius: R.full,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.n200,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
            }}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              onSubmitEditing={() => sendText()}
              blurOnSubmit={false}
              returnKeyType="send"
              placeholder="Message…"
              placeholderTextColor={C.n500}
              multiline
              style={[
                t('body'),
                { flex: 1, color: C.ink, padding: 0, paddingVertical: 8 },
              ]}
            />
          </View>
          {draft.trim().length > 0 ? (
            <Pressable
              onPress={() => sendText()}
              hitSlop={6}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: C.primary,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M3 12 L21 4 L17 21 L11 13 L3 12 Z"
                  fill="#FFF"
                  stroke="#FFF"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
          ) : !thread.iAmSeller ? (
            <Pressable
              onPress={() => setOfferModal({ visible: true })}
              hitSlop={6}
              style={{
                paddingHorizontal: 14,
                height: 38,
                borderRadius: 19,
                backgroundColor: C.primarySoft,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Text
                style={{
                  color: C.primary,
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 13,
                }}
              >
                € Offre
              </Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>

      <OfferComposer
        visible={offerModal.visible}
        listingPrice={thread.listing.priceLabel}
        seedAmount={offerModal.counterTo}
        onCancel={() => setOfferModal({ visible: false })}
        onSubmit={(amount) => {
          const isCounter = offerModal.counterTo != null;
          setOfferModal({ visible: false });
          sendOffer(amount, isCounter);
        }}
      />

      <AttachMenu
        visible={attachMenu}
        iAmSeller={thread.iAmSeller}
        onCancel={() => setAttachMenu(false)}
        onPhoto={() => {
          setAttachMenu(false);
          sendPhoto();
        }}
        onLocation={() => {
          setAttachMenu(false);
          sendLocation();
        }}
        onOffer={() => {
          setAttachMenu(false);
          setOfferModal({ visible: true });
        }}
        onPickup={() => {
          setAttachMenu(false);
          sendPickupProposal();
        }}
      />

      <HeaderMenu
        visible={headerMenu}
        sellerName={thread.seller.name}
        muted={muted}
        onCancel={() => setHeaderMenu(false)}
        onViewProfile={() => {
          setHeaderMenu(false);
          router.push(`/profile/${thread.seller.id}` as any);
        }}
        onToggleMute={() => {
          setMuted((m) => !m);
          setHeaderMenu(false);
        }}
        onReport={() => setHeaderMenu(false)}
        onBlock={() => setHeaderMenu(false)}
        onDelete={() => {
          setHeaderMenu(false);
          router.back();
        }}
      />
    </View>
  );
}

type BubbleProps = {
  m: ChatMessage;
  listingPrice: string;
  onAccept: (target: Extract<ChatMessage, { kind: 'offer' }>) => void;
  onDecline: (target: Extract<ChatMessage, { kind: 'offer' }>) => void;
  onCounter: (target: Extract<ChatMessage, { kind: 'offer' }>) => void;
  onConfirmPickup: (target: Extract<ChatMessage, { kind: 'pickup' }>) => void;
};

function Bubble({ m, listingPrice, onAccept, onDecline, onCounter, onConfirmPickup }: BubbleProps) {
  const C = useColors();
  if (m.kind === 'day') {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 14,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
        <Text
          style={[
            t('caption'),
            { color: C.n500, fontFamily: 'InstrumentSans-Medium' },
          ]}
        >
          {m.label}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
      </View>
    );
  }

  if (m.kind === 'typing') {
    return (
      <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 18,
            borderBottomLeftRadius: 4,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.divider,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.n400 }} />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: C.n400,
              opacity: 0.7,
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: C.n400,
              opacity: 0.4,
            }}
          />
        </View>
      </View>
    );
  }

  if (m.kind === 'text') {
    const isMe = m.from === 'me';
    return (
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 4,
          alignItems: isMe ? 'flex-end' : 'flex-start',
        }}
      >
        <View style={{ maxWidth: '78%' }}>
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 18,
              borderBottomRightRadius: isMe ? 4 : 18,
              borderBottomLeftRadius: isMe ? 18 : 4,
              backgroundColor: isMe ? C.ink : C.surface,
              borderWidth: isMe ? 0 : 1,
              borderColor: C.divider,
            }}
          >
            <Text style={[t('body'), { color: isMe ? C.paper : C.ink, lineHeight: 21 }]}>
              {m.text}
            </Text>
          </View>
          {m.time && (
            <Text
              style={[
                t('caption'),
                {
                  fontSize: 11,
                  color: C.n400,
                  marginTop: 3,
                  textAlign: isMe ? 'right' : 'left',
                  paddingHorizontal: 6,
                },
              ]}
            >
              {m.time}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (m.kind === 'photo') {
    const isMe = m.from === 'me';
    return (
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 4,
          alignItems: isMe ? 'flex-end' : 'flex-start',
        }}
      >
        <View style={{ maxWidth: '78%' }}>
          <View
            style={{
              borderRadius: 18,
              borderBottomRightRadius: isMe ? 4 : 18,
              borderBottomLeftRadius: isMe ? 18 : 4,
              overflow: 'hidden',
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.divider,
            }}
          >
            <Image source={{ uri: m.uri }} style={{ width: 200, height: 200 }} contentFit="cover" />
          </View>
          {m.time && (
            <Text
              style={[
                t('caption'),
                {
                  fontSize: 11,
                  color: C.n400,
                  marginTop: 3,
                  textAlign: isMe ? 'right' : 'left',
                  paddingHorizontal: 6,
                },
              ]}
            >
              {m.time}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (m.kind === 'location') {
    const isMe = m.from === 'me';
    return (
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 4,
          alignItems: isMe ? 'flex-end' : 'flex-start',
        }}
      >
        <View>
          {/* Compact dark "map preview" bubble — a square chip with a
              white pin medallion in the middle, mirroring the design's
              shared-location card. */}
          <View
            style={{
              width: 140,
              height: 96,
              borderRadius: 18,
              borderBottomRightRadius: isMe ? 4 : 18,
              borderBottomLeftRadius: isMe ? 18 : 4,
              backgroundColor: C.ink,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#FFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.Pin size={20} color={C.ink} />
            </View>
          </View>
          {m.time ? (
            <Text
              style={[
                t('caption'),
                {
                  fontSize: 11,
                  color: C.n400,
                  marginTop: 3,
                  textAlign: isMe ? 'right' : 'left',
                  paddingHorizontal: 6,
                },
              ]}
            >
              {m.time}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (m.kind === 'offer') {
    return (
      <OfferBubble
        m={m}
        listingPrice={listingPrice}
        onAccept={onAccept}
        onDecline={onDecline}
        onCounter={onCounter}
      />
    );
  }

  if (m.kind === 'pickup') {
    return <PickupBubble m={m} onConfirm={() => onConfirmPickup(m)} />;
  }

  return null;
}

function OfferBubble({
  m,
  listingPrice,
  onAccept,
  onDecline,
  onCounter,
}: {
  m: Extract<ChatMessage, { kind: 'offer' }>;
  listingPrice: string;
  onAccept: (target: Extract<ChatMessage, { kind: 'offer' }>) => void;
  onDecline: (target: Extract<ChatMessage, { kind: 'offer' }>) => void;
  onCounter: (target: Extract<ChatMessage, { kind: 'offer' }>) => void;
}) {
  const C = useColors();
  const isMe = m.from === 'me';
  const meta = (() => {
    if (m.status === 'pending')
      return {
        label: 'Offre en attente',
        tone: C.primary,
        bg: C.primarySoft,
        fg: C.primaryInk,
        border: 'rgba(200,85,61,0.25)',
      };
    if (m.status === 'accepted')
      return {
        label: 'Acceptée',
        tone: '#3FA66B',
        bg: C.accentSoft,
        fg: '#2F4F45',
        border: 'rgba(95,131,116,0.25)',
      };
    return {
      label: 'Refusée',
      tone: C.n400,
      bg: C.n100,
      fg: C.n600,
      border: C.n200 as string,
    };
  })();

  return (
    <View
      style={{
        paddingHorizontal: 16,
        marginBottom: 4,
        alignItems: isMe ? 'flex-end' : 'flex-start',
      }}
    >
      <View style={{ width: 280, maxWidth: '85%' }}>
        <View
          style={[
            Sh.subtle,
            {
              backgroundColor: C.surface,
              borderWidth: 1.5,
              borderColor: meta.border,
              borderRadius: 16,
              overflow: 'hidden',
            },
          ]}
        >
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: meta.bg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: meta.tone }}
              />
              <Text
                style={{
                  color: meta.fg,
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 11,
                  letterSpacing: 0.44,
                  textTransform: 'uppercase',
                }}
              >
                {meta.label}
              </Text>
            </View>
            {m.status === 'accepted' && <Icon.Check size={14} color={meta.fg} />}
          </View>
          <View style={{ padding: 16, paddingTop: 14 }}>
            <Text style={[t('caption'), { color: C.n500, marginBottom: 4 }]}>
              {isMe ? 'Tu as proposé' : 'Proposition reçue'}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: 'InstrumentSans-SemiBold',
                  fontSize: 32,
                  color: C.ink,
                  letterSpacing: -0.64,
                }}
              >
                {m.amount}
              </Text>
              <Text
                style={[
                  t('bodySm'),
                  { color: C.n500, textDecorationLine: 'line-through' },
                ]}
              >
                {listingPrice}
              </Text>
            </View>

            {m.status === 'pending' && !isMe && (
              <View style={{ gap: 8 }}>
                <Pressable
                  onPress={() => onAccept(m)}
                  style={{
                    paddingVertical: 11,
                    borderRadius: R.full,
                    backgroundColor: C.ink,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: C.paper,
                      fontFamily: 'InstrumentSans-SemiBold',
                      fontSize: 15,
                    }}
                  >
                    Accepter {m.amount}
                  </Text>
                </Pressable>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={() => onCounter(m)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: R.full,
                      backgroundColor: C.surface,
                      borderWidth: 1,
                      borderColor: C.n200,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: C.ink,
                        fontFamily: 'InstrumentSans-SemiBold',
                        fontSize: 13,
                      }}
                    >
                      Contre-offre
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onDecline(m)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: C.n500,
                        fontFamily: 'InstrumentSans-Medium',
                        fontSize: 13,
                      }}
                    >
                      Refuser
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
            {m.status === 'pending' && isMe && (
              <Text
                style={[
                  t('caption'),
                  {
                    color: C.n500,
                    textAlign: 'center',
                    paddingVertical: 6,
                  },
                ]}
              >
En attente d'une réponse…
              </Text>
            )}
            {m.status === 'accepted' && (
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: R.md,
                  backgroundColor: C.n50,
                  alignItems: 'center',
                }}
              >
                <Text style={[t('caption'), { color: C.n600 }]}>
                  Mettez-vous d'accord sur un horaire ci-dessous ↓
                </Text>
              </View>
            )}
          </View>
        </View>
        {m.time && (
          <Text
            style={[
              t('caption'),
              {
                fontSize: 11,
                color: C.n400,
                marginTop: 3,
                textAlign: isMe ? 'right' : 'left',
                paddingHorizontal: 6,
              },
            ]}
          >
            {m.time}
          </Text>
        )}
      </View>
    </View>
  );
}

function PickupBubble({
  m,
  onConfirm,
}: {
  m: Extract<ChatMessage, { kind: 'pickup' }>;
  onConfirm: () => void;
}) {
  const C = useColors();
  const isMe = m.from === 'me';
  const confirmed = m.status === 'confirmed';
  return (
    <View
      style={{
        paddingHorizontal: 16,
        marginBottom: 4,
        alignItems: isMe ? 'flex-end' : 'flex-start',
      }}
    >
      <View style={{ width: 280, maxWidth: '85%' }}>
        <View
          style={{
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.divider,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Mini map illustration */}
          <View style={{ height: 90, position: 'relative', backgroundColor: '#E8DFCB' }}>
            <Svg
              viewBox="0 0 280 90"
              preserveAspectRatio="xMidYMid slice"
              width="100%"
              height={90}
            >
              <Rect width={280} height={90} fill="#E8DFCB" />
              <Path d="M 0 30 L 280 35" stroke="#FFF" strokeWidth={3} opacity={0.85} />
              <Path d="M 0 60 L 280 58" stroke="#FFF" strokeWidth={3} opacity={0.85} />
              <Path d="M 80 0 L 90 90" stroke="#FFF" strokeWidth={3} opacity={0.85} />
              <Path d="M 200 0 L 195 90" stroke="#FFF" strokeWidth={3} opacity={0.85} />
              <Rect x={20} y={40} width={40} height={15} fill="#D4C9B0" rx={2} />
              <Rect x={100} y={40} width={80} height={15} fill="#D4C9B0" rx={2} />
              <Rect x={210} y={40} width={50} height={15} fill="#D4C9B0" rx={2} />
            </Svg>
            <View
              style={{ position: 'absolute', left: 130, top: 28, alignItems: 'center' }}
            >
              <MSMapPin variant="selected" label="Ici" />
            </View>
          </View>
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: C.n500,
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 11,
                letterSpacing: 0.44,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
Récupération proposée
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <Icon.Pin size={14} color={C.primary} />
              <Text
                style={[
                  t('bodySm'),
                  {
                    color: C.ink,
                    fontFamily: 'InstrumentSans-Medium',
                    flex: 1,
                  },
                ]}
              >
                {m.address}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} stroke={C.primary} strokeWidth={2} />
                <Path
                  d="M12 6 V 12 L 16 14"
                  stroke={C.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text
                style={[t('bodySm'), { color: C.ink, fontFamily: 'InstrumentSans-Medium' }]}
              >
                {m.time}
              </Text>
            </View>
            {confirmed ? (
              <View
                style={{
                  paddingVertical: 10,
                  borderRadius: R.full,
                  backgroundColor: C.success,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Icon.Check size={14} color="#FFF" />
                <Text
                  style={{
                    color: '#FFF',
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 13,
                  }}
                >
                  Récupération confirmée
                </Text>
              </View>
            ) : isMe ? (
              <View
                style={{
                  paddingVertical: 10,
                  borderRadius: R.full,
                  backgroundColor: C.n50,
                  borderWidth: 1,
                  borderColor: C.divider,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: C.n600,
                    fontFamily: 'InstrumentSans-Medium',
                    fontSize: 13,
                  }}
                >
                  En attente de confirmation…
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={onConfirm}
                style={{
                  paddingVertical: 10,
                  borderRadius: R.full,
                  backgroundColor: C.ink,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    color: C.paper,
                    fontFamily: 'InstrumentSans-SemiBold',
                    fontSize: 13,
                  }}
                >
                  Confirmer la récupération
                </Text>
              </Pressable>
            )}
          </View>
        </View>
        {m.timestamp && (
          <Text
            style={[
              t('caption'),
              { fontSize: 11, color: C.n400, marginTop: 3, paddingHorizontal: 6 },
            ]}
          >
            {m.timestamp}
          </Text>
        )}
      </View>
    </View>
  );
}

// Attach menu — slides up from the `+` button. Picks one of: photo,
// location, offer (delegates to OfferComposer), or pickup proposal.
function AttachMenu({
  visible,
  iAmSeller,
  onCancel,
  onPhoto,
  onLocation,
  onOffer,
  onPickup,
}: {
  visible: boolean;
  iAmSeller: boolean;
  onCancel: () => void;
  onPhoto: () => void;
  onLocation: () => void;
  onOffer: () => void;
  onPickup: () => void;
}) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        onPress={onCancel}
        style={{ flex: 1, backgroundColor: 'rgba(31,36,33,0.45)' }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: C.paper,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24 + insets.bottom,
        }}
      >
        <View
          style={{
            width: 40,
            height: 5,
            borderRadius: 3,
            backgroundColor: C.n300,
            alignSelf: 'center',
            marginBottom: 12,
          }}
        />
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 16,
            color: C.ink,
            paddingHorizontal: 6,
            marginBottom: 12,
          }}
        >
          Ajouter à la conversation
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <AttachTile
            label="Photo"
            sub="Depuis ta galerie"
            tint={C.primary}
            tintBg={C.primarySoft}
            glyph={
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M3 8 H7 L9 5 H15 L17 8 H21 V19 H3 Z"
                  stroke={C.primary}
                  strokeWidth={1.7}
                  strokeLinejoin="round"
                />
                <Circle cx={12} cy={13} r={3.5} stroke={C.primary} strokeWidth={1.7} />
              </Svg>
            }
            onPress={onPhoto}
          />
          <AttachTile
            label="Localisation"
            sub="Partager ton adresse"
            tint="#2F6B5E"
            tintBg={C.accentSoft}
            glyph={
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21 10 c0 7 -9 13 -9 13 s-9 -6 -9 -13 a9 9 0 0 1 18 0 Z"
                  stroke="#2F6B5E"
                  strokeWidth={1.7}
                />
                <Circle cx={12} cy={10} r={3} stroke="#2F6B5E" strokeWidth={1.7} />
              </Svg>
            }
            onPress={onLocation}
          />
          <AttachTile
            label={iAmSeller ? 'Contre-offre' : 'Offre'}
            sub={iAmSeller ? "Répondre à une offre" : 'Faire / contrer une offre'}
            tint={C.primary}
            tintBg={C.primarySoft}
            glyph={
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={9} stroke={C.primary} strokeWidth={1.7} />
                <Path
                  d="M9 9 H15 M9 12 H15 M14 7 c0 3 -5 3 -5 6 c0 2 5 2 5 4"
                  stroke={C.primary}
                  strokeWidth={1.7}
                  strokeLinecap="round"
                />
              </Svg>
            }
            onPress={onOffer}
          />
          <AttachTile
            label="Récupération"
            sub="Proposer un rendez-vous"
            tint="#3F7D5C"
            tintBg={C.successSoft}
            glyph={
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Rect
                  x={4}
                  y={5}
                  width={16}
                  height={16}
                  rx={2}
                  stroke="#3F7D5C"
                  strokeWidth={1.7}
                />
                <Path
                  d="M8 3 V7 M16 3 V7 M4 10 H20"
                  stroke="#3F7D5C"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                />
                <Path
                  d="M9 15 L11 17 L15 13"
                  stroke="#3F7D5C"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            }
            onPress={onPickup}
          />
        </View>
      </View>
    </Modal>
  );
}

function AttachTile({
  label,
  sub,
  tint,
  tintBg,
  glyph,
  onPress,
}: {
  label: string;
  sub: string;
  tint: string;
  tintBg: string;
  glyph: React.ReactNode;
  onPress: () => void;
}) {
  const C = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: '48%',
        backgroundColor: C.surface,
        borderRadius: R.lg,
        borderWidth: 1,
        borderColor: C.divider,
        padding: 14,
        gap: 10,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: tintBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {glyph}
      </View>
      <View>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 15,
            color: C.ink,
          }}
        >
          {label}
        </Text>
        <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      <View
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.Chevron size={12} color="#FFF" />
      </View>
    </Pressable>
  );
}

// Header overflow menu — slides up from the bottom with a stacked list of
// chat-management actions. Mock-only: mute/report/block/delete close the
// menu without backend wiring (delete just pops the route).
function HeaderMenu({
  visible,
  sellerName,
  muted,
  onCancel,
  onViewProfile,
  onToggleMute,
  onReport,
  onBlock,
  onDelete,
}: {
  visible: boolean;
  sellerName: string;
  muted: boolean;
  onCancel: () => void;
  onViewProfile: () => void;
  onToggleMute: () => void;
  onReport: () => void;
  onBlock: () => void;
  onDelete: () => void;
}) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        onPress={onCancel}
        style={{ flex: 1, backgroundColor: 'rgba(31,36,33,0.45)' }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: C.paper,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16 + insets.bottom,
        }}
      >
        <View
          style={{
            width: 40,
            height: 5,
            borderRadius: 3,
            backgroundColor: C.n300,
            alignSelf: 'center',
            marginBottom: 14,
          }}
        />

        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          <MenuRow
            label={`Voir le profil de ${sellerName}`}
            glyph={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={8} r={4} stroke={C.ink} strokeWidth={1.7} />
                <Path
                  d="M4 21 c0 -4 4 -7 8 -7 s8 3 8 7"
                  stroke={C.ink}
                  strokeWidth={1.7}
                  strokeLinecap="round"
                />
              </Svg>
            }
            onPress={onViewProfile}
          />
          <MenuRow
            label={muted ? 'Activer les notifications' : 'Couper les notifications'}
            glyph={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M6 8 a6 6 0 0 1 12 0 v3 l2 4 H4 l2 -4 Z"
                  stroke={C.ink}
                  strokeWidth={1.7}
                  strokeLinejoin="round"
                />
                <Path d="M10 19 a2 2 0 0 0 4 0" stroke={C.ink} strokeWidth={1.7} strokeLinecap="round" />
                {muted ? <Path d="M3 3 L21 21" stroke={C.ink} strokeWidth={1.7} strokeLinecap="round" /> : null}
              </Svg>
            }
            onPress={onToggleMute}
          />
          <MenuRow
            label="Signaler"
            glyph={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M5 3 V21" stroke={C.ink} strokeWidth={1.7} strokeLinecap="round" />
                <Path
                  d="M5 4 H17 L14 8 L17 12 H5"
                  stroke={C.ink}
                  strokeWidth={1.7}
                  strokeLinejoin="round"
                />
              </Svg>
            }
            onPress={onReport}
          />
          <MenuRow
            label={`Bloquer ${sellerName}`}
            tint={C.danger}
            glyph={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={9} stroke={C.danger} strokeWidth={1.7} />
                <Path d="M5.6 5.6 L18.4 18.4" stroke={C.danger} strokeWidth={1.7} strokeLinecap="round" />
              </Svg>
            }
            onPress={onBlock}
            last
          />
        </View>

        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          <MenuRow
            label="Supprimer la conversation"
            tint={C.danger}
            glyph={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 7 H19 L18 21 H6 Z"
                  stroke={C.danger}
                  strokeWidth={1.7}
                  strokeLinejoin="round"
                />
                <Path
                  d="M9 7 V5 a2 2 0 0 1 2 -2 H13 a2 2 0 0 1 2 2 V7 M3 7 H21"
                  stroke={C.danger}
                  strokeWidth={1.7}
                  strokeLinecap="round"
                />
              </Svg>
            }
            onPress={onDelete}
            last
          />
        </View>

        <Pressable
          onPress={onCancel}
          style={{
            backgroundColor: C.surface,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: C.divider,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text
            style={{ color: C.ink, fontFamily: 'InstrumentSans-SemiBold', fontSize: 15 }}
          >
            Annuler
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function MenuRow({
  label,
  glyph,
  tint,
  onPress,
  last,
}: {
  label: string;
  glyph: React.ReactNode;
  tint?: string;
  onPress: () => void;
  last?: boolean;
}) {
  const C = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.divider,
      }}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
      >
        <View style={{ width: 24, alignItems: 'center', justifyContent: 'center' }}>{glyph}</View>
        <Text
          style={{
            flex: 1,
            color: tint ?? C.ink,
            fontFamily: 'InstrumentSans-Medium',
            fontSize: 15,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// In-line modal for composing or countering an offer.
function OfferComposer({
  visible,
  listingPrice,
  seedAmount,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  listingPrice: string;
  seedAmount?: number;
  onCancel: () => void;
  onSubmit: (amount: number) => void;
}) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const priceNum = parseInt(listingPrice.replace(/[^0-9]/g, ''), 10) || 0;
  const initial = seedAmount != null ? seedAmount - 5 : Math.round(priceNum * 0.85);
  const [value, setValue] = useState<string>(String(initial));

  // Reset whenever the modal re-opens with a different seed.
  useEffect(() => {
    if (visible) setValue(String(seedAmount != null ? seedAmount - 5 : Math.round(priceNum * 0.85)));
  }, [visible, seedAmount, priceNum]);

  const numeric = parseInt(value || '0', 10);
  const valid = !Number.isNaN(numeric) && numeric > 0 && numeric <= priceNum;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        onPress={onCancel}
        style={{ flex: 1, backgroundColor: 'rgba(31,36,33,0.45)' }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: C.paper,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24 + insets.bottom,
        }}
      >
        <View
          style={{
            width: 40,
            height: 5,
            borderRadius: 3,
            backgroundColor: C.n300,
            alignSelf: 'center',
            marginBottom: 16,
          }}
        />
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 20,
            color: C.ink,
          }}
        >
          {seedAmount != null ? 'Contre-offre' : 'Envoyer une offre'}
        </Text>
        <Text style={[t('bodySm'), { color: C.n500, marginTop: 4, marginBottom: 24 }]}>
          Prix affiché : {listingPrice}.
        </Text>

        <View style={{ alignItems: 'center', paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 48,
                color: C.ink,
                letterSpacing: -1,
              }}
            >
              €
            </Text>
            <TextInput
              value={value}
              onChangeText={(s) => setValue(s.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              autoFocus
              maxLength={6}
              style={{
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 56,
                color: C.ink,
                letterSpacing: -1.6,
                minWidth: 80,
                padding: 0,
                textAlign: 'left',
              }}
            />
          </View>
          {priceNum > 0 && numeric > 0 ? (
            <Text style={[t('caption'), { color: C.n500, marginTop: 6 }]}>
              {Math.round((numeric / priceNum) * 100)}% du prix affiché
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
          {[80, 85, 90, 95].map((pct) => {
            const amount = Math.round((priceNum * pct) / 100);
            return (
              <MSPill
                key={pct}
                size="sm"
                selected={numeric === amount}
                onPress={() => setValue(String(amount))}
              >
                {pct}% · €{amount}
              </MSPill>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={onCancel}
            style={{
              flex: 1,
              height: 48,
              borderRadius: R.full,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.n200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: C.ink,
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 15,
              }}
            >
              Annuler
            </Text>
          </Pressable>
          <View style={{ flex: 2 }}>
            <MSButton
              size="lg"
              fullWidth
              onPress={() => valid && onSubmit(numeric)}
              state={valid ? undefined : 'disabled'}
            >
              {`Envoyer €${numeric || 0}`}
            </MSButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}
