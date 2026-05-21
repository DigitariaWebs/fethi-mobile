// useCheckout — flow de paiement Stripe.
//
// Le mobile delegue le calcul du montant et la creation de l'Order au
// backend. Une fois l'Order existante, on demande au backend un PaymentIntent,
// on recoit un `clientSecret`, et c'est le SDK Stripe React Native qui
// affiche la PaymentSheet.
//
// Comme `@stripe/stripe-react-native` doit etre installe via un build natif
// (EAS), ce hook compile sans le SDK : `confirmWithStripe` est passe par
// le caller. C'est lui qui importe le hook officiel et appelle :
//
//     const { useStripe } = require('@stripe/stripe-react-native');
//     const { initPaymentSheet, presentPaymentSheet } = useStripe();
//
// Patterne sans dependance hard pour qu'on puisse builder l'app en Expo Go
// (utilitaire dev) meme sans le SDK natif.

import { useCallback, useState } from 'react';

import { paymentsApi } from '@/lib/api';
import { useToast } from '@/lib/toast';

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; reason: 'disabled' | 'cancelled' | 'failed' | 'network'; message?: string };

export type StripeConfirm = (clientSecret: string) => Promise<{ ok: boolean; cancelled?: boolean; error?: string }>;

export function useCheckout() {
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const pay = useCallback(
    async (orderId: string, confirmWithStripe: StripeConfirm): Promise<CheckoutResult> => {
      setPending(true);
      try {
        // 1. PaymentIntent cote backend
        let intent;
        try {
          intent = await paymentsApi.createIntent(orderId);
        } catch (err: any) {
          if (err?.status === 503) {
            toast.show({
              message: 'Paiement indisponible',
              description: 'Stripe n\'est pas encore configuré sur le backend.',
              tone: 'warning',
            });
            return { ok: false, reason: 'disabled' };
          }
          throw err;
        }

        // 2. PaymentSheet via le SDK natif (fourni par le caller)
        const result = await confirmWithStripe(intent.clientSecret);
        if (result.cancelled) {
          return { ok: false, reason: 'cancelled' };
        }
        if (!result.ok) {
          toast.error(result.error || 'Échec du paiement');
          return { ok: false, reason: 'failed', message: result.error };
        }

        // 3. Le webhook backend va mettre Order.paymentStatus = SUCCEEDED.
        // Le caller redirige vers /payment/success?orderId=... qui peut
        // poll l'Order si besoin pour confirmer.
        toast.success('Paiement effectué');
        return { ok: true, orderId };
      } catch (err: any) {
        console.warn('[checkout] erreur', err);
        toast.error('Erreur réseau. Réessaie.');
        return { ok: false, reason: 'network', message: err?.message };
      } finally {
        setPending(false);
      }
    },
    [toast],
  );

  return { pay, pending };
}
