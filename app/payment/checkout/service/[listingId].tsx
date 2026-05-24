import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CheckoutShell } from '@/components/payments/CheckoutShell';
import { listingsApi, ordersApi, type Listing } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { useColors } from '@/theme';

function formatEuros(cents: number): string {
  return `${(cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export default function CheckoutService() {
  const router = useRouter();
  const toast = useToast();
  const C = useColors();
  const { listingId, date, from } = useLocalSearchParams<{ listingId: string; date: string; from: string }>();
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

  // For hourly services we estimate one hour at the booked rate; flat-rate
  // services charge the flat fee. Real backend would honor the user-picked
  // duration.
  const hours = 1;
  const subtotalCents = listing.flatRateCents
    ? listing.flatRateCents
    : (listing.hourlyRateCents ?? 0) * hours;
  const feeCents = Math.round(subtotalCents * 0.05);
  const totalCents = subtotalCents + feeCents;

  const fees = [
    {
      label: listing.flatRateCents
        ? 'Frais de réservation'
        : `${formatEuros(listing.hourlyRateCents ?? 0)}/h × ${hours}h`,
      value: formatEuros(subtotalCents),
    },
    { label: 'Frais de service', value: formatEuros(feeCents), muted: true },
    { label: 'Total', value: formatEuros(totalCents), emphasis: true as const },
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
      meta={`${date ?? ''} · ${from ?? ''}`}
      fees={fees}
      ctaLabel={`Payer ${formatEuros(totalCents)}`}
      onPay={pay}
    />
  );
}
