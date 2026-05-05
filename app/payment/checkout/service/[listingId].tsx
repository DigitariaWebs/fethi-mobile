import { useLocalSearchParams, useRouter } from 'expo-router';

import { CheckoutShell } from '@/components/payments/CheckoutShell';
import { LISTINGS, type ServiceListing } from '@/lib/fixtures';
import { useOrders, formatEuros } from '@/lib/orders';

export default function CheckoutService() {
  const router = useRouter();
  const { listingId, date, from } = useLocalSearchParams<{ listingId: string; date: string; from: string }>();
  const listing = LISTINGS.find((l) => l.id === listingId) as ServiceListing | undefined;
  const addOrder = useOrders((s) => s.add);
  if (!listing || listing.listingType !== 'service') return null;

  // For hourly services we estimate one hour at the minimum-booking rate;
  // flat-rate services charge the flat fee. Real backend would honor the
  // user-picked duration.
  const hours = listing.hourlyRate ? Math.max(1, Math.round((listing.availabilityWindows[0]?.from ? 60 : 60) / 60)) : 1;
  const subtotalCents =
    (listing.flatRate ? listing.flatRate : (listing.hourlyRate ?? 0) * hours) * 100;
  const feeCents = 95;
  const totalCents = subtotalCents + feeCents;

  const fees = [
    {
      label: listing.flatRate ? 'Frais de réservation' : `€${listing.hourlyRate}/h × ${hours}h`,
      value: formatEuros(subtotalCents),
    },
    { label: 'Frais de service', value: formatEuros(feeCents), muted: true },
    { label: 'Total', value: formatEuros(totalCents), emphasis: true as const },
  ];

  const pay = () => {
    const to = `${String(parseInt(from?.split(':')[0] ?? '0', 10) + hours).padStart(2, '0')}:00`;
    const orderId = `o${Date.now()}`;
    addOrder({
      id: orderId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingThumb: listing.thumb,
      type: 'service',
      buyerId: 'me',
      sellerId: listing.sellerId,
      amountCents: totalCents,
      feeCents,
      serviceSlot: { date, from, to },
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
      meta={`${date} · ${from}`}
      fees={fees}
      ctaLabel={`Payer ${formatEuros(totalCents)}`}
      onPay={pay}
    />
  );
}
