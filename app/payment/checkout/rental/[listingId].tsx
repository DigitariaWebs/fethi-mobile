import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CheckoutShell } from '@/components/payments/CheckoutShell';
import { listingsApi, ordersApi, type Listing } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { daysBetween, formatRange } from '@/lib/availability';
import { useColors } from '@/theme';

function formatEuros(cents: number): string {
  return `${(cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export default function CheckoutRental() {
  const router = useRouter();
  const toast = useToast();
  const C = useColors();
  const { listingId, start, end } = useLocalSearchParams<{ listingId: string; start: string; end: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    let alive = true;
    listingsApi
      .get(listingId)
      .then((l) => alive && setListing(l))
      .catch(() => alive && setListing(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [listingId]);

  if (loading || !listing) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.n500} />
      </View>
    );
  }

  const dayPriceCents = listing.pricePerDayCents ?? 0;
  const depositCents = listing.depositCents ?? 0;
  const days = daysBetween(start, end) + 1;
  const subtotalCents = days * dayPriceCents;
  const feeCents = Math.round(subtotalCents * 0.05);
  const totalCents = subtotalCents + feeCents;

  const fees = [
    { label: `${formatEuros(dayPriceCents)} × ${days} jour${days === 1 ? '' : 's'}`, value: formatEuros(subtotalCents) },
    { label: 'Frais de service', value: formatEuros(feeCents), muted: true },
    { label: 'Caution (retenue)', value: formatEuros(depositCents), muted: true },
    { label: 'À payer maintenant', value: formatEuros(totalCents), emphasis: true as const },
  ];

  const pay = async () => {
    if (pending) return;
    setPending(true);
    try {
      const order = await ordersApi.create(listing.id, totalCents);
      router.replace(`/payment/processing?orderId=${order.id}` as any);
    } catch (err) {
      toast.error('Impossible de créer la commande. Réessaie.');
      setPending(false);
    }
  };

  return (
    <CheckoutShell
      title="Paiement"
      thumb={listing.photos?.[0]}
      subtitle={listing.neighborhood ? `à ${listing.neighborhood}` : ''}
      meta={`${formatRange(start, end)} · ${days} jour${days === 1 ? '' : 's'}`}
      note={`Nous bloquerons ${formatEuros(depositCents)} en caution remboursable. Elle est rendue dès que tu rapportes l'objet dans le même état.`}
      fees={fees}
      ctaLabel={`Payer ${formatEuros(totalCents)}`}
      onPay={pay}
    />
  );
}
