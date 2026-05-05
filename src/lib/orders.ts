// Order lifecycle store. Each order is created when a checkout completes;
// both buyer and seller see the same record (filtered by role at the
// query layer). Real backend would replace fixtures with API calls.

import { create } from 'zustand';

export type OrderStatus =
  | 'awaiting-pickup'   // paid, not yet handed off
  | 'handoff-pending'   // both sides need to confirm meetup
  | 'completed'         // confirmed by both
  | 'refunded'          // refund issued
  | 'disputed'          // open dispute
  | 'cancelled';        // cancelled before handoff

export type OrderType = 'sale' | 'rental' | 'service';

export type Order = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingThumb: string;
  type: OrderType;
  buyerId: string;
  sellerId: string;
  amountCents: number;          // total in cents
  feeCents: number;             // platform fee in cents
  depositCents?: number;        // rentals
  rentalDates?: { start: string; end: string };
  serviceSlot?: { date: string; from: string; to: string };
  status: OrderStatus;
  createdAt: string;            // ISO
  // Both confirmations set when both have tapped "We met" — when both true
  // and depositReleased (rentals only) we flip to `completed`.
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  depositReleased?: boolean;
  // Optional review state, filled post-completion.
  buyerReview?: { rating: number; comment?: string };
  sellerReview?: { rating: number; comment?: string };
};

const SEED: Order[] = [
  {
    id: 'o1',
    listingId: '4',
    listingTitle: 'PS4 + 5 jeux + 2 manettes',
    listingThumb: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&q=80',
    type: 'sale',
    buyerId: 'me',
    sellerId: 'karim',
    amountCents: 16500,
    feeCents: 95,
    status: 'awaiting-pickup',
    createdAt: '2026-05-03T14:38:00Z',
    buyerConfirmed: false,
    sellerConfirmed: false,
  },
  {
    id: 'o2',
    listingId: '3',
    listingTitle: 'Machine Nespresso + 40 capsules',
    listingThumb: 'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=400&q=80',
    type: 'sale',
    buyerId: 'me',
    sellerId: 'lea',
    amountCents: 4500,
    feeCents: 95,
    status: 'completed',
    createdAt: '2026-04-29T11:14:00Z',
    buyerConfirmed: true,
    sellerConfirmed: true,
    buyerReview: { rating: 5, comment: 'Super sympa et machine impeccable !' },
  },
  {
    id: 'o3',
    listingId: 'r1',
    listingTitle: 'Perceuse Bosch Pro + visserie',
    listingThumb: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&q=80',
    type: 'rental',
    buyerId: 'me',
    sellerId: 'olivier',
    amountCents: 2400,
    feeCents: 95,
    depositCents: 6000,
    rentalDates: { start: '2026-05-08', end: '2026-05-11' },
    status: 'handoff-pending',
    createdAt: '2026-05-03T16:20:00Z',
    buyerConfirmed: true,
    sellerConfirmed: false,
  },
  {
    id: 'o4',
    listingId: '1',
    listingTitle: 'Vélo de ville Peugeot, années 80',
    listingThumb: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80',
    type: 'sale',
    buyerId: 'thomas',
    sellerId: 'me',
    amountCents: 11000,
    feeCents: 95,
    status: 'awaiting-pickup',
    createdAt: '2026-05-02T16:02:00Z',
    buyerConfirmed: false,
    sellerConfirmed: false,
  },
  {
    id: 'o5',
    listingId: 's1',
    listingTitle: 'Cours de guitare pour débutants',
    listingThumb: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
    type: 'service',
    buyerId: 'me',
    sellerId: 'lea',
    amountCents: 2500,
    feeCents: 95,
    serviceSlot: { date: '2026-05-09', from: '17:00', to: '18:00' },
    status: 'awaiting-pickup',
    createdAt: '2026-05-04T10:00:00Z',
    buyerConfirmed: false,
    sellerConfirmed: false,
  },
];

type OrdersState = {
  orders: Order[];
  add: (o: Order) => void;
  patch: (id: string, patch: Partial<Order>) => void;
  // Mark either confirmation; flips to `completed` when both are true (and
  // deposit is released for rentals).
  confirmHandoff: (id: string, side: 'buyer' | 'seller') => void;
  releaseDeposit: (id: string) => void;
};

export const useOrders = create<OrdersState>((set, get) => ({
  orders: SEED,
  add: (o) => set({ orders: [o, ...get().orders] }),
  patch: (id, patch) =>
    set({
      orders: get().orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }),
  confirmHandoff: (id, side) =>
    set({
      orders: get().orders.map((o) => {
        if (o.id !== id) return o;
        const next = {
          ...o,
          buyerConfirmed: side === 'buyer' ? true : o.buyerConfirmed,
          sellerConfirmed: side === 'seller' ? true : o.sellerConfirmed,
        };
        const fullyConfirmed = next.buyerConfirmed && next.sellerConfirmed;
        const rentalDone = o.type !== 'rental' || next.depositReleased;
        if (fullyConfirmed && rentalDone) next.status = 'completed';
        else if (fullyConfirmed) next.status = 'awaiting-pickup';
        return next;
      }),
    }),
  releaseDeposit: (id) =>
    set({
      orders: get().orders.map((o) => {
        if (o.id !== id) return o;
        const next = { ...o, depositReleased: true };
        if (next.buyerConfirmed && next.sellerConfirmed) next.status = 'completed';
        return next;
      }),
    }),
}));

export function getOrder(id: string): Order | undefined {
  return useOrders.getState().orders.find((o) => o.id === id);
}

export function formatEuros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  'awaiting-pickup': 'En attente de récupération',
  'handoff-pending': 'Confirmer la remise',
  completed: 'Terminée',
  refunded: 'Remboursée',
  disputed: 'Litige en cours',
  cancelled: 'Annulée',
};
