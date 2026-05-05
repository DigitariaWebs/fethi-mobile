import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useOrders } from '@/lib/orders';
import { useToast } from '@/lib/toast';

const TAGS = ['Sympa', 'À l\'heure', 'Honnête', 'Facile à trouver', 'Réactif', 'Bon contact'];

export default function ReviewPrompt() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const patch = useOrders((s) => s.patch);
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  if (!order) return null;
  const isBuyer = order.buyerId === 'me';

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title={isBuyer ? 'Note le vendeur' : 'Note l\'acheteur'} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Stars row */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 18 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setRating(n)} hitSlop={6}>
              <Svg width={36} height={36} viewBox="0 0 24 24">
                <Polygon
                  points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"
                  fill={n <= rating ? '#C68A2E' : C.n200}
                />
              </Svg>
            </Pressable>
          ))}
        </View>

        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 11,
            color: C.n500,
            letterSpacing: 0.6,
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          Ce qui t'a plu
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {TAGS.map((tag) => {
            const sel = tags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() =>
                  setTags((cur) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]))
                }
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: sel ? C.ink : C.surface,
                  borderWidth: 1,
                  borderColor: sel ? C.ink : C.divider,
                }}
              >
                <Text
                  style={{
                    color: sel ? '#FFF' : C.ink,
                    fontFamily: 'InstrumentSans-Medium',
                    fontSize: 13,
                  }}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 11,
            color: C.n500,
            letterSpacing: 0.6,
            marginBottom: 8,
            marginTop: 22,
            textTransform: 'uppercase',
          }}
        >
          Ajoute un commentaire (optionnel)
        </Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="C'était comment ?"
          placeholderTextColor={C.n400}
          multiline
          textAlignVertical="top"
          style={{
            backgroundColor: C.surface,
            borderRadius: R.md,
            borderWidth: 1,
            borderColor: C.divider,
            padding: 14,
            minHeight: 120,
            fontFamily: 'InstrumentSans-Medium',
            fontSize: 15,
            color: C.ink,
          }}
        />
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 16 + insets.bottom,
          backgroundColor: C.paper,
          borderTopWidth: 1,
          borderTopColor: C.divider,
        }}
      >
        <MSButton
          size="lg"
          fullWidth
          onPress={() => {
            patch(order.id, {
              [isBuyer ? 'buyerReview' : 'sellerReview']: { rating, comment: comment.trim() || undefined },
            });
            toast.success('Avis envoyé.');
            router.back();
          }}
        >
          Envoyer l'avis
        </MSButton>
      </View>
    </View>
  );
}
