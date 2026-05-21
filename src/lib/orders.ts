// Orders store — synchronise avec le backend.
// On garde la forme historique (OrderStatus lowercase + 'sale'/'rental'/'service')
// pour ne pas casser les ecrans existants, et on mappe ApiOrder -> Order.

import { create } from 'zustand';

import { ordersApi, type ApiOrder, type ApiOrderStatus } from './api';

export type OrderStatus =
  | 'awaiting-pickup'
  | 'handoff-pending'
  | 'completed'
  | 'refunded'
  | 'disputed'
  | 'cancelled';

export type OrderType = 'sale' | 'rental' | 'service';

export type Order = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingThumb: string;
  type: OrderType;
  buyerId: string;
  sellerId: string;
  amountCents: number;
  feeCents: number;
  depositCents?: number;
  rentalDates?: { start: string; end: string };
  serviceSlot?: { date: string; from: string; to: string };
  status: OrderStatus;
  createdAt: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  depositReleased?: boolean;
  buyerReview?: { rating: number; comment?: string };
  sellerReview?: { rating: number; comment?: string };
};

const STATUS_MAP: Record<ApiOrderStatus, OrderStatus> = {
  AWAITING_PICKUP: 'awaiting-pickup',
  HANDOFF_PENDING: 'handoff-pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  DISPUTED: 'disputed',
};

function toFixture(a: ApiOrder): Order {
  const type: OrderType =
    a.listingType === 'VENTE' ? 'sale'
      : a.listingType === 'LOCATION' ? 'rental'
        : 'service';
  return {
    id: a.id,
    listingId: a.listingId,
    listingTitle: a.listingTitle ?? '',
    listingThumb: a.listingThumb ??
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
    type,
    buyerId: a.buyerId,
    sellerId: a.sellerId,
    amountCents: a.amountCents,
    feeCents: a.feeCents,
    depositCents: a.depositCents ?? undefined,
    rentalDates: a.rentalStart && a.rentalEnd
      ? { start: a.rentalStart, end: a.rentalEnd }
      : undefined,
    status: STATUS_MAP[a.status],
    createdAt: a.createdAt,
    buyerConfirmed: a.buyerConfirmed,
    sellerConfirmed: a.sellerConfirmed,
    depositReleased: a.depositReleased ?? undefined,
  };
}

type OrdersState = {
  orders: Order[];
  loading: boolean;
  loaded: boolean;
  /** Charge les commandes du user (buyer + seller fusionnees). */
  load: () => Promise<void>;
  /** Achete une annonce -> nouvelle commande. */
  buyListing: (listingId: string, amountCentsOverride?: number) => Promise<Order>;
  /** Marque la remise comme effectuee cote user courant. */
  confirmHandoff: (id: string, side: 'buyer' | 'seller') => Promise<void>;
  /** Annule la commande. */
  cancel: (id: string, reason?: string) => Promise<void>;
  /** Ajoute une commande au store (compat checkout legacy / scenarios). */
  add: (o: Order) => void;
  /** Patche localement (compat dispute / refund / review / scenarios). */
  patch: (id: string, patch: Partial<Order>) => void;
  /** Libere la caution (rental). Local-only — endpoint backend a faire. */
  releaseDeposit: (id: string) => void;
};

export const useOrders = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  loaded: false,

  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const [asBuyer, asSeller] = await Promise.all([
        ordersApi.list('buyer', 0, 100),
        ordersApi.list('seller', 0, 100),
      ]);
      // Fusionne et dedup (un user peut etre les deux cotes sur des orders distincts)
      const seen = new Set<string>();
      const all: Order[] = [];
      [...asBuyer.content, ...asSeller.content].forEach((a) => {
        if (!seen.has(a.id)) {
          seen.add(a.id);
          all.push(toFixture(a));
        }
      });
      all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      set({ orders: all, loaded: true });
    } catch (err) {
      console.warn('orders load failed', err);
    } finally {
      set({ loading: false });
    }
  },

  buyListing: async (listingId, amountCentsOverride) => {
    const created = await ordersApi.create(listingId, amountCentsOverride);
    const o = toFixture(created);
    set({ orders: [o, ...get().orders] });
    return o;
  },

  confirmHandoff: async (id, _side) => {
    try {
      // Le backend determine le cote (buyer/seller) selon l'user connecte
      const updated = await ordersApi.confirmPickup(id);
      const o = toFixture(updated);
      set({ orders: get().orders.map((x) => (x.id === id ? o : x)) });
    } catch (err) {
      console.warn('confirmHandoff failed', err);
    }
  },

  cancel: async (id, reason) => {
    try {
      const updated = await ordersApi.cancel(id, reason);
      const o = toFixture(updated);
      set({ orders: get().orders.map((x) => (x.id === id ? o : x)) });
    } catch (err) {
      console.warn('cancel failed', err);
    }
  },

  // ---- Compat (utilise par checkout legacy, dispute, refund, scenarios) ----
  add: (o) => set({ orders: [o, ...get().orders] }),
  patch: (id, patch) =>
    set({
      orders: get().orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
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
