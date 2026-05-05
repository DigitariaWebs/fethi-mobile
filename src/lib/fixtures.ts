// Mock data for MyStreet — reconciles the brief's listing roster with the
// design preview's set. Eight listings, anchored to Vieux-Lille (Lille, France).
// Coordinates roughly correspond to the real neighborhood.

// Listing is now a discriminated union over `listingType`. Sale listings
// have the original price; rentals carry per-day/per-week pricing and
// availability; services carry rate, area, and time slots. All three
// share the common header fields so downstream code (map, lists) can
// treat them uniformly when only basics are needed.

export type ListingType = 'sale' | 'rental' | 'service';

type ListingBase = {
  id: string;
  title: string;
  // For sale/rental: list price / per-day rate. For services: hourly or flat.
  price: number;             // EUR
  priceLabel: string;        // pre-formatted ('€120', '€12/day', '€25/h')
  distanceMeters: number;
  distanceLabel: string;     // pre-formatted ('180m')
  photo: string;
  thumb: string;
  condition: string;
  category: string;
  description: string;
  postedAt: string;          // ISO
  // Map placement.
  x: number; y: number;
  lat: number; lng: number;
  sellerId: string;
};

export type SaleListing = ListingBase & { listingType: 'sale' };

export type RentalListing = ListingBase & {
  listingType: 'rental';
  pricePerDay: number;
  pricePerWeek?: number;
  deposit: number;
  pickupReturnPolicy: 'in-person' | 'flexible';
  unavailableDates: string[]; // ISO YYYY-MM-DD
};

export type ServiceListing = ListingBase & {
  listingType: 'service';
  hourlyRate?: number;
  flatRate?: number;
  serviceRadiusKm: number;
  // Recurring weekly availability: weekday is 0 (Sun) – 6 (Sat).
  availabilityWindows: { weekday: number; from: string; to: string }[];
  qualifications?: string[];
  requiresQualification?: boolean;
};

export type Listing = SaleListing | RentalListing | ServiceListing;

export type Seller = {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  transactions: number;
  joined: string; // 'Jan 2024'
  verified: boolean;
};

// Vieux-Lille center — 50.6418° N, 3.0639° E
const CENTER = { lat: 50.6418, lng: 3.0639 };

export const SELLERS: Record<string, Seller> = {
  marie:    { id: 'marie',    name: 'Marie L.',   rating: 4.8, transactions: 23, joined: 'Mar 2024', verified: true },
  tom:      { id: 'tom',      name: 'Tom R.',     rating: 5.0, transactions: 7,  joined: 'Aug 2024', verified: false },
  lea:      { id: 'lea',      name: 'Léa M.',     rating: 4.9, transactions: 12, joined: 'Jan 2024', verified: true },
  karim:    { id: 'karim',    name: 'Karim B.',   rating: 4.7, transactions: 31, joined: 'Sep 2023', verified: true },
  anais:    { id: 'anais',    name: 'Anaïs C.',   rating: 4.6, transactions: 4,  joined: 'Oct 2024', verified: false },
  olivier:  { id: 'olivier',  name: 'Olivier T.', rating: 4.9, transactions: 18, joined: 'Feb 2024', verified: true },
  sophie:   { id: 'sophie',   name: 'Sophie D.',  rating: 5.0, transactions: 9,  joined: 'May 2024', verified: false },
  hugo:     { id: 'hugo',     name: 'Hugo F.',    rating: 4.5, transactions: 3,  joined: 'Nov 2024', verified: false },
};

const PHOTO = {
  bike:      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80',
  baby:      'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80',
  nespresso: 'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=800&q=80',
  ps4:       'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
  mower:     'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
  couch:     'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
  books:     'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80',
  tent:      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
};

export const LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Vélo de ville Peugeot, années 80, bon état',
    price: 120, priceLabel: '€120',
    distanceMeters: 180, distanceLabel: '180m',
    photo: PHOTO.bike, thumb: PHOTO.bike,
    condition: 'Bon état', category: 'Vélos',
    description: "Vélo Peugeot des années 80, restauré l'année dernière. Pneus neufs, freins révisés. Parfait pour la ville. Vendu avec antivol.",
    postedAt: '2026-04-29T10:12:00Z',
    x: 110, y: 320,
    lat: CENTER.lat + 0.0008, lng: CENTER.lng - 0.0014,
    sellerId: 'marie',
    listingType: 'sale',
  },
  {
    id: '2',
    title: 'Lot vêtements bébé 6–9 mois',
    price: 15, priceLabel: '€15',
    distanceMeters: 320, distanceLabel: '320m',
    photo: PHOTO.baby, thumb: PHOTO.baby,
    condition: 'Très bon', category: 'Enfants',
    description: 'Lot de 12 pièces, garçon, tailles 6 à 9 mois. Très peu portés, lavés et pliés.',
    postedAt: '2026-05-01T14:40:00Z',
    x: 80, y: 450,
    lat: CENTER.lat - 0.0011, lng: CENTER.lng - 0.0021,
    sellerId: 'tom',
    listingType: 'sale',
  },
  {
    id: '3',
    title: 'Machine Nespresso + 40 capsules',
    price: 45, priceLabel: '€45',
    distanceMeters: 410, distanceLabel: '410m',
    photo: PHOTO.nespresso, thumb: PHOTO.nespresso,
    condition: 'Comme neuf', category: 'Cuisine',
    description: 'Nespresso Pixie noire, achetée il y a 1 an. Parfait état de fonctionnement. 40 capsules variées offertes.',
    postedAt: '2026-04-30T09:05:00Z',
    x: 280, y: 330,
    lat: CENTER.lat + 0.0006, lng: CENTER.lng + 0.0019,
    sellerId: 'lea',
    listingType: 'sale',
  },
  {
    id: '4',
    title: 'PS4 + 5 jeux + 2 manettes',
    price: 180, priceLabel: '€180',
    distanceMeters: 240, distanceLabel: '240m',
    photo: PHOTO.ps4, thumb: PHOTO.ps4,
    condition: 'Bon état', category: 'Électronique',
    description: 'PS4 1To avec 2 manettes (1 neuve), câbles, 5 jeux : FIFA 22, GTA V, Last of Us, Spider-Man, Horizon Zero Dawn.',
    postedAt: '2026-05-02T18:20:00Z',
    x: 250, y: 460,
    lat: CENTER.lat - 0.0005, lng: CENTER.lng + 0.0012,
    sellerId: 'karim',
    listingType: 'sale',
  },
  {
    id: '5',
    title: 'Tondeuse électrique Bosch',
    price: 60, priceLabel: '€60',
    distanceMeters: 510, distanceLabel: '510m',
    photo: PHOTO.mower, thumb: PHOTO.mower,
    condition: 'Bon état', category: 'Maison',
    description: 'Tondeuse Bosch Rotak 32, fonctionne bien. Petit jardin, peu utilisée. Câble 10m.',
    postedAt: '2026-04-26T11:30:00Z',
    x: 320, y: 540,
    lat: CENTER.lat - 0.0028, lng: CENTER.lng + 0.0024,
    sellerId: 'anais',
    listingType: 'sale',
  },
  {
    id: '6',
    title: 'Canapé 2 places, IKEA, beige',
    price: 90, priceLabel: '€90',
    distanceMeters: 690, distanceLabel: '690m',
    photo: PHOTO.couch, thumb: PHOTO.couch,
    condition: 'Bon état', category: 'Maison',
    description: 'Canapé IKEA Klippan 2 places, housse beige lavable. Quelques marques d’usure mais structure impeccable. À récupérer sur place.',
    postedAt: '2026-04-22T15:00:00Z',
    x: 60, y: 600,
    lat: CENTER.lat - 0.0034, lng: CENTER.lng - 0.0028,
    sellerId: 'olivier',
    listingType: 'sale',
  },
  {
    id: '7',
    title: 'Lot de 12 livres de poche',
    price: 20, priceLabel: '€20',
    distanceMeters: 280, distanceLabel: '280m',
    photo: PHOTO.books, thumb: PHOTO.books,
    condition: 'Très bon', category: 'Livres',
    description: '12 romans en bon état : Modiano, Houellebecq, Ernaux, Despentes… liste complète sur demande.',
    postedAt: '2026-05-02T08:10:00Z',
    x: 200, y: 620,
    lat: CENTER.lat - 0.0036, lng: CENTER.lng + 0.0002,
    sellerId: 'sophie',
    listingType: 'sale',
  },
  {
    id: '8',
    title: 'Tente 4 places, état neuf',
    price: 75, priceLabel: '€75',
    distanceMeters: 450, distanceLabel: '450m',
    photo: PHOTO.tent, thumb: PHOTO.tent,
    condition: 'Comme neuf', category: 'Sport',
    description: 'Tente Quechua 4 places, montée 2 fois. Avec sac de rangement et sardines. Imperméable.',
    postedAt: '2026-04-28T16:45:00Z',
    x: 340, y: 680,
    lat: CENTER.lat - 0.0044, lng: CENTER.lng + 0.0030,
    sellerId: 'hugo',
    listingType: 'sale',
  },
  // ─── Rental fixtures ────────────────────────────────────────────────
  {
    id: 'r1',
    listingType: 'rental',
    title: 'Perceuse Bosch Pro + visserie',
    price: 8, priceLabel: '€8/day',
    pricePerDay: 8, pricePerWeek: 35, deposit: 60,
    pickupReturnPolicy: 'in-person',
    unavailableDates: [],
    distanceMeters: 220, distanceLabel: '220m',
    photo: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&q=80',
    condition: 'Très bon', category: 'Bricolage',
    description: 'Perceuse-visseuse Bosch Professional, 2 batteries, mallette, set de mèches. Idéale pour un week-end de bricolage.',
    postedAt: '2026-04-25T11:00:00Z',
    x: 200, y: 380,
    lat: CENTER.lat + 0.0011, lng: CENTER.lng + 0.0006,
    sellerId: 'olivier',
  },
  {
    id: 'r2',
    listingType: 'rental',
    title: 'Tente 4 places + matériel camping',
    price: 12, priceLabel: '€12/day',
    pricePerDay: 12, pricePerWeek: 60, deposit: 80,
    pickupReturnPolicy: 'flexible',
    unavailableDates: [],
    distanceMeters: 480, distanceLabel: '480m',
    photo: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80',
    condition: 'Comme neuf', category: 'Camping',
    description: 'Tente Quechua 4 places + 4 matelas + lampe + réchaud. Tout pour partir le week-end.',
    postedAt: '2026-04-20T08:30:00Z',
    x: 130, y: 600,
    lat: CENTER.lat - 0.0030, lng: CENTER.lng - 0.0011,
    sellerId: 'hugo',
  },
  // ─── Service fixtures ───────────────────────────────────────────────
  {
    id: 's1',
    listingType: 'service',
    title: 'Cours de guitare pour débutants',
    price: 25, priceLabel: '€25/h',
    hourlyRate: 25,
    serviceRadiusKm: 3,
    availabilityWindows: [
      { weekday: 2, from: '17:00', to: '20:00' },
      { weekday: 4, from: '17:00', to: '20:00' },
      { weekday: 6, from: '10:00', to: '14:00' },
    ],
    qualifications: ['10 ans d\'expérience', 'Diplômée du CNSM Lille'],
    requiresQualification: true,
    distanceMeters: 350, distanceLabel: '350m',
    photo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
    condition: '—', category: 'Lessons',
    description: 'Cours de guitare acoustique / électrique à domicile. Tous niveaux, méthode adaptée à chacun.',
    postedAt: '2026-04-18T14:00:00Z',
    x: 220, y: 250,
    lat: CENTER.lat + 0.0019, lng: CENTER.lng + 0.0008,
    sellerId: 'lea',
  },
  {
    id: 's2',
    listingType: 'service',
    title: 'Garde de chien — promenades quotidiennes',
    price: 15, priceLabel: '€15/walk',
    flatRate: 15,
    serviceRadiusKm: 2,
    availabilityWindows: [
      { weekday: 1, from: '08:00', to: '20:00' },
      { weekday: 2, from: '08:00', to: '20:00' },
      { weekday: 3, from: '08:00', to: '20:00' },
      { weekday: 4, from: '08:00', to: '20:00' },
      { weekday: 5, from: '08:00', to: '20:00' },
    ],
    distanceMeters: 180, distanceLabel: '180m',
    photo: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80',
    condition: '—', category: 'Pets',
    description: 'Promenades de 45 minutes dans le Vieux-Lille. Disponible en semaine.',
    postedAt: '2026-04-22T09:30:00Z',
    x: 90, y: 320,
    lat: CENTER.lat + 0.0005, lng: CENTER.lng - 0.0009,
    sellerId: 'sophie',
  },
];

export const CURRENT_USER = {
  name: 'Marie',
  fullName: 'Marie Lefèvre',
  neighborhood: 'Vieux-Lille',
  lat: CENTER.lat,
  lng: CENTER.lng,
};

export const CATEGORIES = [
  'Maison', 'Vélos', 'Vêtements', 'Électronique',
  'Livres', 'Plantes', 'Enfants', 'Sport', 'Cuisine',
] as const;

export const CONDITIONS = ['Neuf', 'Comme neuf', 'Bon état', 'Correct'] as const;

export function getListing(id: string) {
  return LISTINGS.find((l) => l.id === id);
}

export function getSeller(id: string) {
  return SELLERS[id];
}

export function listingWithSeller(l: Listing) {
  return { ...l, seller: SELLERS[l.sellerId] };
}
