// In-app notification feed. Real backend would push these in via FCM /
// APNs and write them into this same store.

import { create } from 'zustand';

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
  // ISO timestamp — used for "today / yesterday / older" grouping.
  at: string;
  unread: boolean;
  // Optional deep-link target.
  href?: string;
};

const SEED: Notification[] = [
  { id: 'n1', kind: 'message',         title: 'Karim B. t\'a envoyé un message',     body: 'Je regarde et je te dis dans 5 min.', at: '2026-05-04T14:32:00Z', unread: true,  href: '/(tabs)/messages/karim' },
  { id: 'n2', kind: 'offer',           title: 'Nouvelle offre sur PS4 + 5 jeux',    body: '165 € de ta part · en attente de réponse', at: '2026-05-04T14:20:00Z', unread: true,  href: '/(tabs)/messages/karim' },
  { id: 'n3', kind: 'booking-request', title: 'Thomas veut réserver ton vélo',      body: '8 mai → 11 mai · 3 jours',            at: '2026-05-04T11:02:00Z', unread: true,  href: '/orders/o3' },
  { id: 'n4', kind: 'listing-sold',    title: 'Ta machine Nespresso est vendue !',  body: 'À Léa M. pour 45 €',                  at: '2026-05-03T11:14:00Z', unread: false, href: '/orders/o2' },
  { id: 'n5', kind: 'order-update',    title: 'Récupération confirmée par Karim',   body: "Aujourd'hui à 19h00 · 42 rue Royale", at: '2026-05-03T16:39:00Z', unread: false, href: '/orders/o1' },
  { id: 'n6', kind: 'review',          title: 'Léa t\'a laissé un avis 5★',         body: '« Super sympa et machine impeccable ! »', at: '2026-05-03T13:22:00Z', unread: false, href: '/profile/lea' },
  { id: 'n7', kind: 'payout',          title: 'Versement envoyé — 44,05 €',         body: 'Arrivée prévue sous 1 à 2 jours ouvrés.', at: '2026-05-02T09:00:00Z', unread: false, href: '/payouts' },
  { id: 'n8', kind: 'system',          title: 'Nouvelles locations près de toi',    body: 'Outils, matériel d\'extérieur, et plus.', at: '2026-05-01T08:30:00Z', unread: false, href: '/(tabs)/search/rentals' },
  { id: 'n9', kind: 'system',          title: 'Bienvenue dans MyStreet+',           body: 'Rayon personnalisé débloqué.',         at: '2026-04-30T20:00:00Z', unread: false },
  { id: 'n10', kind: 'message',        title: 'Olivier T. t\'a envoyé une photo',   body: '',                                    at: '2026-04-30T18:11:00Z', unread: false, href: '/(tabs)/messages/olivier' },
  { id: 'n11', kind: 'order-update',   title: 'Marc a refusé ton offre',            body: '70 € sur Vélo Peugeot',               at: '2026-04-29T14:00:00Z', unread: false, href: '/(tabs)/messages/marc' },
  { id: 'n12', kind: 'system',         title: 'Vérifie ton identité',               body: 'Obligatoire avant ton premier versement.', at: '2026-04-28T10:00:00Z', unread: false, href: '/kyc' },
];

type NotifState = {
  items: Notification[];
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
};

export const useNotifications = create<NotifState>((set, get) => ({
  items: SEED,
  markAllRead: () =>
    set({ items: get().items.map((n) => ({ ...n, unread: false })) }),
  markRead: (id) =>
    set({
      items: get().items.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    }),
  clearAll: () => set({ items: [] }),
}));

export function unreadCount(items: Notification[]): number {
  return items.filter((n) => n.unread).length;
}
