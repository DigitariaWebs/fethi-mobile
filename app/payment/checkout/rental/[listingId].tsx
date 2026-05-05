import { useLocalSearchParams, useRouter } from 'expo-router';

import { CheckoutShell } from '@/components/payments/CheckoutShell';
import { LISTINGS, type RentalListing } from '@/lib/fixtures';
import { useOrders, formatEuros } from '@/lib/orders';
import { daysBetween, formatRange } from '@/lib/availability';

export default function CheckoutRental() {
  const router = useRouter();
  const { listingId, start, end } = useLocalSearchParams<{ listingId: string; start: string; end: string }>();
  const listing = LISTINGS.find((l) => l.id === listingId) as RentalListing | undefined;
  const addOrder = useOrders((s) => s.add);
  if (!listing || listing.listingType !== 'rental') return null;

  const days = daysBetween(start, end) + 1;
  const subtotalCents = days * listing.pricePerDay * 100;
  const feeCents = 95;
  const depositCents = listing.deposit * 100;
  const totalCents = subtotalCents + feeCents;

  const fees = [
    { label: `€${listing.pricePerDay} × ${days} jour${days === 1 ? '' : 's'}`, value: formatEuros(subtotalCents) },
    { label: 'Frais de service', value: formatEuros(feeCents), muted: true },
    { label: `Caution (retenue)`, value: formatEuros(depositCents), muted: true },
    { label: 'À payer maintenant', value: formatEuros(totalCents), emphasis: true as const },
  ];

  const pay = () => {
    const orderId = `o${Date.now()}`;
    addOrder({
      id: orderId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingThumb: listing.thumb,
      type: 'rental',
      buyerId: 'me',
      sellerId: listing.sellerId,
      amountCents: totalCents,
      feeCents,
      depositCents,
      rentalDates: { start, end },
      status: 'awaiting-pickup',
      createdAt: new Date().toISOString(),
      buyerConfirmed: false,
      sellerConfirmed: false,
    });
    router.replace(`/payment/processing?orderId=${orderId}` as any);
  };

  return (
    <CheckoutShell
      title="Paiement"
      thumb={listing.thumb}
      subtitle={`à ${listing.distanceLabel}`}
      meta={`${formatRange(start, end)} · ${days} jour${days === 1 ? '' : 's'}`}
      note={`Nous bloquerons €${listing.deposit} en caution remboursable. Elle est rendue dès que tu rapportes l'objet dans le même état.`}
      fees={fees}
      ctaLabel={`Payer ${formatEuros(totalCents)}`}
      onPay={pay}
    />
  );
}
