// Store notifications connecte au backend.
// Le shape "fixture" est conserve (kind lowercase, `at` ISO) pour eviter
// de toucher les ecrans qui consomment ce store.

import { create } from 'zustand';

import { notifsApi, type ApiNotification, type NotifKind as ApiNotifKind } from './api';

export type NotifKind =
  | 'message'
  | 'offer'
  | 'booking-request'
  | 'listing-sold'
  | 'order-update'
  | 'review'
  | 'payout'
  | 'system';

export type Notification = {
  id: string;
  kind: NotifKind;
  title: string;
  body?: string;
  /** ISO timestamp - utilise pour le grouping today / yesterday / older. */
  at: string;
  unread: boolean;
  href?: string;
};

const KIND_MAP: Record<ApiNotifKind, NotifKind> = {
  MESSAGE: 'message',
  OFFER: 'offer',
  BOOKING_REQUEST: 'booking-request',
  LISTING_SOLD: 'listing-sold',
  ORDER_UPDATE: 'order-update',
  REVIEW: 'review',
  PAYOUT: 'payout',
  SYSTEM: 'system',
};

function toFixture(n: ApiNotification): Notification {
  return {
    id: n.id,
    kind: KIND_MAP[n.kind] ?? 'system',
    title: n.title,
    body: n.body ?? undefined,
    at: n.createdAt,
    unread: n.unread,
    href: n.href ?? undefined,
  };
}

type NotifState = {
  items: Notification[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  clearAll: () => void;
};

export const useNotifications = create<NotifState>((set, get) => ({
  items: [],
  loaded: false,
  loading: false,

  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await notifsApi.list(0, 50);
      set({ items: res.content.map(toFixture), loaded: true });
    } catch (err) {
      console.warn('notifs load failed', err);
    } finally {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    // Optimistic
    set({ items: get().items.map((n) => (n.id === id ? { ...n, unread: false } : n)) });
    try {
      await notifsApi.markRead(id);
    } catch (err) {
      console.warn('markRead failed', err);
    }
  },

  markAllRead: async () => {
    set({ items: get().items.map((n) => ({ ...n, unread: false })) });
    try {
      await notifsApi.markAllRead();
    } catch (err) {
      console.warn('markAllRead failed', err);
    }
  },

  clearAll: () => set({ items: [] }),
}));
