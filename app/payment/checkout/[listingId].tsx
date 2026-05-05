import { useLocalSearchParams, useRouter } from 'expo-router';

import { CheckoutShell } from '@/components/payments/CheckoutShell';
import { LISTINGS } from '@/lib/fixtures';
import { useOrders, formatEuros } from '@/lib/orders';

export default function CheckoutSale() {
  const router = useRouter();
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const listing = LISTINGS.find((l) => l.id === listingId) ?? LISTINGS[0];
  const addOrder = useOrders((s) => s.add);

  const itemCents = listing.price * 100;
  const feeCents = 95;
  const totalCents = itemCents + feeCents;

  const fees = [
    { label: 'Objet', value: formatEuros(itemCents) },
    { label: 'Frais de service', value: formatEuros(feeCents), muted: true },
    { label: 'Total', value: formatEuros(totalCents), emphasis: true as const },
  ];

  const pay = () => {
    const orderId = `o${Date.now()}`;
    addOrder({
      id: orderId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingThumb: listing.thumb,
      type: 'sale',
      buyerId: 'me',
      sellerId: listing.sellerId,
      amountCents: totalCents,
      feeCents,
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
      subtitle={'à ' + listing.distanceLabel}
      fees={fees}
      ctaLabel={`Payer ${formatEuros(totalCents)}`}
      onPay={pay}
    />
  );
}
