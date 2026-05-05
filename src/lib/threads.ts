// Fixtures for the messaging flow.
//
// Each thread captures both perspectives — `iAmSeller` is true when the
// listing being discussed is mine and the OTHER person (`thread.seller`,
// kept that name for backwards-compat with consumers) is the buyer.
// When false, I'm the buyer and the participant owns the listing.
//
// Every thread carries its own message seed so tapping into different
// chats genuinely shows different conversations (no shared fixture).

import { LISTINGS, SELLERS, type Seller, type Listing } from './fixtures';
import { MY_LISTING } from './myListings';

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'completed' | null;

// Extra cast members used as buyers / counterparties in seller-role
// threads. Not part of the seller catalog so we keep them inline.
export const BUYERS: Record<string, Seller> = {
  amelie: {
    id: 'amelie',
    name: 'Amélie R.',
    rating: 4.9,
    transactions: 12,
    joined: 'Feb 2024',
    verified: true,
  },
  thomas: {
    id: 'thomas',
    name: 'Thomas G.',
    rating: 4.7,
    transactions: 8,
    joined: 'Jun 2024',
    verified: true,
  },
  marc: {
    id: 'marc',
    name: 'Marc D.',
    rating: 4.4,
    transactions: 3,
    joined: 'Oct 2024',
    verified: false,
  },
};

export type Thread = {
  id: string;
  iAmSeller: boolean;        // true: I own the listing, the participant is the buyer
  seller: Seller;            // the OTHER person in this conversation
  listing: Listing;          // the listing being discussed
  lastMessage: string;
  lastFromMe: boolean;
  time: string;
  unread: number;
  online: boolean;
  offerStatus: OfferStatus;
  offerAmount?: string;
  seed: ChatMessage[];       // initial message log when the chat opens
};

export type ChatMessage =
  | { kind: 'text'; from: 'me' | 'them'; text: string; time?: string }
  | { kind: 'day'; label: string }
  | { kind: 'photo'; from: 'me' | 'them'; uri: string; time?: string }
  | { kind: 'location'; from: 'me' | 'them'; address: string; time?: string }
  | {
      kind: 'offer';
      from: 'me' | 'them';
      status: 'pending' | 'accepted' | 'declined';
      amount: string;
      listingPrice: string;
      time?: string;
    }
  | {
      kind: 'pickup';
      from: 'me' | 'them';
      status: 'pending' | 'confirmed';
      address: string;
      time: string;
      timestamp?: string;
    }
  | { kind: 'typing' };

const DAY = (label: string): ChatMessage => ({ kind: 'day', label });

// ─── Buyer-role chats — I'm interested in their listing ────────────────

const SEED_KARIM: ChatMessage[] = [
  DAY('Today'),
  { kind: 'text', from: 'me',   text: "Bonjour, ça m'intéresse ! Tout fonctionne bien ?", time: '14:08' },
  { kind: 'text', from: 'them', text: "Salut ! Oui tout marche, je l'utilise encore de temps en temps. Les manettes sont en bon état aussi.", time: '14:14' },
  { kind: 'text', from: 'me',   text: "Top. Je serais à €165 — c'est un peu mon budget max. Possible ?", time: '14:20' },
  { kind: 'offer', from: 'me', status: 'pending', amount: '€165', listingPrice: '€180', time: '14:20 · sent' },
  { kind: 'text', from: 'them', text: 'Je regarde et je te dis dans 5 min.', time: '14:32' },
];

const SEED_LEA: ChatMessage[] = [
  DAY('Yesterday'),
  { kind: 'text', from: 'me',   text: 'Hello ! Toujours dispo la machine ?', time: '11:02' },
  { kind: 'text', from: 'them', text: "Yes ! Avec les 40 capsules, tout fonctionne nickel.", time: '11:08' },
  { kind: 'text', from: 'me',   text: 'Parfait, je la prends à €45. On peut se voir aujourd\'hui ?', time: '11:09' },
  { kind: 'offer', from: 'me', status: 'accepted', amount: '€45', listingPrice: '€45', time: 'Accepted at 11:14' },
  { kind: 'text', from: 'them', text: 'Génial ! Tu peux passer ce soir vers 18h ?', time: '11:15' },
  { kind: 'pickup', from: 'them', status: 'confirmed', address: '8 rue Saint-Étienne, Vieux-Lille', time: 'Today, 18:00', timestamp: '11:16' },
  { kind: 'text', from: 'me',   text: 'Parfait, à ce soir.', time: '11:17' },
];

const SEED_OLIVIER: ChatMessage[] = [
  DAY('Today'),
  { kind: 'text', from: 'me',   text: 'Hello, le canapé est toujours dispo ? Et le tissu se nettoie bien ?', time: '13:02' },
  { kind: 'text', from: 'them', text: 'Oui dispo ! La housse passe en machine à 30°.', time: '13:08' },
  { kind: 'text', from: 'them', text: 'Tu peux passer le voir si tu veux.', time: '13:08' },
];

// ─── Seller-role chats — they want MY listing (the bike) ───────────────

const SEED_AMELIE: ChatMessage[] = [
  DAY('Today'),
  { kind: 'text', from: 'them', text: "Bonjour ! Le vélo m'intéresse beaucoup. Disponible vendredi soir ?", time: '09:42' },
  { kind: 'text', from: 'me',   text: 'Hello, oui dispo. Tu connais Vieux-Lille ?', time: '10:01' },
  { kind: 'text', from: 'them', text: "Oui je suis à 350m. Tu accepterais €95 ? J'ai un budget serré.", time: '10:05' },
  { kind: 'offer', from: 'them', status: 'pending', amount: '€95', listingPrice: '€120', time: '10:05 · received' },
];

const SEED_THOMAS: ChatMessage[] = [
  DAY('Yesterday'),
  { kind: 'text', from: 'them', text: 'Salut, je peux passer le récupérer ce week-end. Toujours dispo ?', time: '15:30' },
  { kind: 'text', from: 'me',   text: 'Yes, encore là. Tu pensais à quel jour ?', time: '15:42' },
  { kind: 'text', from: 'them', text: 'Samedi matin si possible. Je peux faire €110 ?', time: '15:43' },
  { kind: 'offer', from: 'them', status: 'accepted', amount: '€110', listingPrice: '€120', time: 'Accepted at 16:02' },
  { kind: 'text', from: 'me',   text: 'OK pour €110, on dit samedi 10h ?', time: '16:02' },
  { kind: 'pickup', from: 'me', status: 'confirmed', address: '14 Rue du 14 Juillet, Lille', time: 'Saturday, 10:00', timestamp: '16:03' },
];

const SEED_MARC: ChatMessage[] = [
  DAY('3 days ago'),
  { kind: 'text', from: 'them', text: 'Bonjour, vélo intéressant. Tu accepterais €70 ?', time: '18:11' },
  { kind: 'offer', from: 'them', status: 'declined', amount: '€70', listingPrice: '€120', time: 'Declined at 18:14' },
  { kind: 'text', from: 'me',   text: "Désolé, c'est en dessous de mon minimum. Bonne continuation !", time: '18:14' },
];

export const THREADS: Thread[] = [
  // Buyer-role
  {
    id: 'karim',
    iAmSeller: false,
    seller: SELLERS.karim,
    listing: LISTINGS[3],
    lastMessage: 'Je regarde et je te dis dans 5 min.',
    lastFromMe: false,
    time: '14:32',
    unread: 2,
    online: true,
    offerStatus: 'pending',
    offerAmount: '€165',
    seed: SEED_KARIM,
  },
  {
    id: 'lea',
    iAmSeller: false,
    seller: SELLERS.lea,
    listing: LISTINGS[2],
    lastMessage: 'Parfait, à ce soir.',
    lastFromMe: true,
    time: 'Yest.',
    unread: 0,
    online: false,
    offerStatus: 'accepted',
    offerAmount: '€45',
    seed: SEED_LEA,
  },
  {
    id: 'olivier',
    iAmSeller: false,
    seller: SELLERS.olivier,
    listing: LISTINGS[5],
    lastMessage: 'Tu peux passer le voir si tu veux.',
    lastFromMe: false,
    time: '13:08',
    unread: 1,
    online: false,
    offerStatus: null,
    seed: SEED_OLIVIER,
  },
  // Seller-role
  {
    id: 'amelie',
    iAmSeller: true,
    seller: BUYERS.amelie,
    listing: MY_LISTING.base,
    lastMessage: 'Tu accepterais €95 ?',
    lastFromMe: false,
    time: '10:05',
    unread: 1,
    online: true,
    offerStatus: 'pending',
    offerAmount: '€95',
    seed: SEED_AMELIE,
  },
  {
    id: 'thomas',
    iAmSeller: true,
    seller: BUYERS.thomas,
    listing: MY_LISTING.base,
    lastMessage: 'OK pour €110, on dit samedi 10h ?',
    lastFromMe: true,
    time: 'Yest.',
    unread: 0,
    online: false,
    offerStatus: 'accepted',
    offerAmount: '€110',
    seed: SEED_THOMAS,
  },
  {
    id: 'marc',
    iAmSeller: true,
    seller: BUYERS.marc,
    listing: MY_LISTING.base,
    lastMessage: "Désolé, c'est en dessous de mon minimum.",
    lastFromMe: true,
    time: '3 days',
    unread: 0,
    online: false,
    offerStatus: 'declined',
    offerAmount: '€70',
    seed: SEED_MARC,
  },
];

export function getThread(id: string): Thread | undefined {
  return THREADS.find((t) => t.id === id);
}
