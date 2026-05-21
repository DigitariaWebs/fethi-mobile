// MakeOfferSheet — bottom sheet pour proposer un prix au seller.
//
// UI Nextdoor/Vinted style :
//   - Affiche le prix demande en gros
//   - Champ "Mon offre" avec suggestions rapides (-10% / -15% / -20%)
//   - Champ message optionnel
//   - Bouton "Envoyer l'offre"
//
// Apres envoi reussi : on ferme la sheet, on affiche un toast, et on
// invalide les queries "offers" pour que la prochaine fois la sheet sache
// qu'il y a deja une offre pending.

import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { useColors, radius as R, t } from '@/theme';
import { Icon, MSButton } from '@/components';
import { offersApi, ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';

type Props = {
  visible: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  askingPriceCents: number;
};

export function MakeOfferSheet({
  visible, onClose, listingId, listingTitle, askingPriceCents,
}: Props) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const asking = askingPriceCents / 100;
  const quickSuggestions = useMemo(
    () => [
      { label: '-10 %', cents: Math.round(askingPriceCents * 0.9) },
      { label: '-15 %', cents: Math.round(askingPriceCents * 0.85) },
      { label: '-20 %', cents: Math.round(askingPriceCents * 0.8) },
    ],
    [askingPriceCents],
  );

  const amountCents = (() => {
    const n = parseFloat(amount.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.round(n * 100);
  })();
  const valid = amountCents > 0 && amountCents < askingPriceCents && !submitting;

  const submit = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      await offersApi.create({
        listingId,
        amountCents,
        message: message.trim() || undefined,
      });
      toast.success('Offre envoyée');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      onClose();
      // Reset pour la prochaine ouverture
      setAmount('');
      setMessage('');
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.code === 'OFFER_ALREADY_PENDING') {
          toast.show({
            message: 'Offre déjà envoyée',
            description: 'Tu as déjà une offre en attente sur cette annonce.',
            tone: 'warning',
          });
          onClose();
        } else if (err.code === 'OFFER_TOO_HIGH') {
          toast.show({
            message: 'Offre trop haute',
            description: 'Propose un montant inférieur au prix affiché.',
            tone: 'warning',
          });
        } else {
          toast.error(err.message || 'Envoi impossible.');
        }
      } else {
        toast.error('Erreur réseau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#0006',
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
        pointerEvents="box-none"
      >
        <View
          style={{
            backgroundColor: C.paper,
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            paddingTop: 12,
            paddingBottom: 16 + insets.bottom,
            paddingHorizontal: 20,
            maxHeight: '85%',
          }}
        >
          {/* Handle */}
          <View
            style={{
              alignSelf: 'center',
              width: 40, height: 4, borderRadius: 2,
              backgroundColor: C.divider, marginBottom: 12,
            }}
          />

          <Text style={[t('h2'), { color: C.ink, fontSize: 22 }]}>
            Faire une offre
          </Text>
          <Text numberOfLines={1} style={[t('body'), { color: C.n500, marginTop: 4 }]}>
            {listingTitle}
          </Text>

          {/* Asking price */}
          <View
            style={{
              marginTop: 18,
              backgroundColor: C.n50,
              borderRadius: R.lg,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={[t('caption'), { color: C.n500 }]}>Prix demandé</Text>
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 18, color: C.ink }}>
              {asking.toFixed(0)} €
            </Text>
          </View>

          {/* Input */}
          <Text
            style={[
              t('caption'),
              { color: C.n500, marginTop: 18, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
            ]}
          >
            Mon offre
          </Text>
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              paddingHorizontal: 16, height: 56,
              backgroundColor: C.surface,
              borderWidth: 1.5, borderColor: amountCents > 0 ? C.ink : C.divider,
              borderRadius: R.full,
            }}
          >
            <TextInput
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9.,]/g, ''))}
              placeholder="0"
              placeholderTextColor={C.n400}
              keyboardType="numeric"
              style={{
                flex: 1,
                fontFamily: 'InstrumentSans-SemiBold',
                fontSize: 20,
                color: C.ink,
              }}
            />
            <Text style={{ color: C.n500, fontSize: 18, fontFamily: 'InstrumentSans-Medium' }}>€</Text>
          </View>

          {/* Quick suggestions */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            {quickSuggestions.map((s) => (
              <Pressable
                key={s.label}
                onPress={() => setAmount(String(s.cents / 100))}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 999,
                  borderWidth: 1, borderColor: C.divider,
                  backgroundColor: C.surface,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 12, color: C.ink }}>
                  {s.label}
                </Text>
                <Text style={[t('caption'), { color: C.n500, marginTop: 1, fontSize: 10 }]}>
                  {(s.cents / 100).toFixed(0)} €
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Message optionnel */}
          <Text
            style={[
              t('caption'),
              { color: C.n500, marginTop: 18, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
            ]}
          >
            Message (facultatif)
          </Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ex: je viens demain, ça peut le faire ?"
            placeholderTextColor={C.n400}
            multiline
            textAlignVertical="top"
            style={{
              backgroundColor: C.surface,
              borderRadius: R.md,
              borderWidth: 1, borderColor: C.divider,
              padding: 12,
              minHeight: 70,
              fontFamily: 'InstrumentSans-Medium',
              fontSize: 14,
              color: C.ink,
            }}
          />

          <MSButton
            size="lg"
            fullWidth
            state={!valid ? 'disabled' : 'default'}
            onPress={submit}
            style={{ marginTop: 18 }}
          >
            {submitting ? 'Envoi…' : 'Envoyer l\'offre'}
          </MSButton>

          <Pressable onPress={onClose} style={{ alignItems: 'center', paddingVertical: 10, marginTop: 4 }}>
            <Text style={[t('bodySm'), { color: C.n500 }]}>Annuler</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
