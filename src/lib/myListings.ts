// Demo state for the seller-side flows. The "user's own listing" is a single
// record (the bike from fixtures) with seller-side metrics layered on top.

import { LISTINGS } from './fixtures';

export type SellerListingState = {
  base: (typeof LISTINGS)[number];
  views: number;
  saves: number;
  messages: number;
  offers: number;
  postedDaysAgo: number;
  status: 'live' | 'paused' | 'sold';
};

export const MY_LISTING: SellerListingState = {
  base: LISTINGS[0], // Vélo Peugeot
  views: 127,
  saves: 14,
  messages: 4,
  offers: 2,
  postedDaysAgo: 2,
  status: 'live',
};

export type IncomingOffer = {
  id: string;
  buyerName: string;
  buyerAvatar: string;
  price: number;
  original: number;
  time: string;
  message: string;
  rating: number;
  sales: number;
  distance: string;
  belowMin?: boolean;
};

export const INCOMING_OFFERS: IncomingOffer[] = [
  {
    id: '1',
    buyerName: 'Amélie',
    buyerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80',
    price: 95,
    original: 120,
    time: '2h ago',
    message: "Bonjour ! Le vélo m'intéresse beaucoup. Disponible vendredi soir ?",
    rating: 4.9,
    sales: 12,
    distance: '350m',
    belowMin: true,
  },
  {
    id: '2',
    buyerName: 'Thomas R.',
    buyerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80',
    price: 110,
    original: 120,
    time: 'Yesterday',
    message: 'Salut, je peux passer le récupérer ce week-end. Toujours dispo ?',
    rating: 4.7,
    sales: 8,
    distance: '600m',
  },
];

export const DECLINED_OFFERS = [
  {
    id: 'd1',
    buyerName: 'Marc',
    buyerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&q=80',
    price: 70,
    time: '3d ago',
    reason: 'Below minimum',
  },
];
