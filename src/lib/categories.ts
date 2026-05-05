// Marketplace category catalog. Used by the sell flow's category picker
// and (eventually) by feed filters. Section order maps to the order on
// the picker screen; within each section items are listed top-to-bottom.

export type CategoryGlyph =
  | 'home'
  | 'kitchen'
  | 'tool'
  | 'leaf'
  | 'pet'
  | 'garment'
  | 'shoe'
  | 'bag'
  | 'jewelry'
  | 'beauty'
  | 'baby'
  | 'toy'
  | 'office'
  | 'chip'
  | 'phone'
  | 'laptop'
  | 'tv'
  | 'camera'
  | 'gamepad'
  | 'book'
  | 'music'
  | 'sport'
  | 'tent'
  | 'bike'
  | 'car'
  | 'art'
  | 'gift'
  | 'service'
  | 'other';

export type Category = {
  id: string;
  label: string;
  glyph: CategoryGlyph;
  subtitle?: string;
};

export type CategorySection = {
  title: string;
  items: Category[];
};

export const CATEGORY_SECTIONS: CategorySection[] = [
  {
    title: 'Maison & jardin',
    items: [
      { id: 'maison-deco',  label: 'Maison & déco',          glyph: 'home',    subtitle: 'Mobilier, déco, linge' },
      { id: 'cuisine',      label: 'Cuisine & électroménager', glyph: 'kitchen', subtitle: 'Vaisselle, petit électro' },
      { id: 'bricolage',    label: 'Bricolage & outils',     glyph: 'tool',    subtitle: 'Outillage, quincaillerie' },
      { id: 'jardin',       label: 'Jardin & extérieur',     glyph: 'leaf',    subtitle: 'Mobilier, outils, déco' },
      { id: 'plantes',      label: 'Plantes',                 glyph: 'leaf',    subtitle: 'Intérieur & extérieur' },
      { id: 'animaux',      label: 'Animaux',                 glyph: 'pet',     subtitle: 'Accessoires, alimentation' },
    ],
  },
  {
    title: 'Mode',
    items: [
      { id: 'mode-femme',     label: 'Mode femme',          glyph: 'garment', subtitle: 'Vêtements, robes, manteaux' },
      { id: 'mode-homme',     label: 'Mode homme',          glyph: 'garment', subtitle: 'Vêtements, costumes' },
      { id: 'mode-enfant',    label: 'Mode enfant',         glyph: 'garment', subtitle: '0–12 ans' },
      { id: 'chaussures',     label: 'Chaussures',          glyph: 'shoe',    subtitle: 'Femme, homme, enfant' },
      { id: 'sacs',           label: 'Sacs & maroquinerie', glyph: 'bag',     subtitle: 'Sacs à main, sacs à dos' },
    ],
  },
  {
    title: 'Beauté, bijoux & accessoires',
    items: [
      { id: 'bijoux',     label: 'Bijoux & montres',          glyph: 'jewelry' },
      { id: 'beaute',     label: 'Beauté & soin',             glyph: 'beauty', subtitle: 'Maquillage, parfum, soin' },
      { id: 'lunettes',   label: 'Lunettes & accessoires',    glyph: 'bag' },
    ],
  },
  {
    title: 'Famille & enfants',
    items: [
      { id: 'bebe',     label: 'Bébé & puériculture', glyph: 'baby',   subtitle: 'Poussettes, sièges, lits' },
      { id: 'jouets',   label: 'Jouets & jeux',       glyph: 'toy',    subtitle: 'Tout âge' },
      { id: 'ecole',    label: 'École & papeterie',   glyph: 'office', subtitle: 'Livres scolaires, fournitures' },
    ],
  },
  {
    title: 'Tech & multimédia',
    items: [
      { id: 'electronique', label: 'Électronique',  glyph: 'chip',     subtitle: 'Petits appareils' },
      { id: 'telephonie',   label: 'Téléphonie',    glyph: 'phone',    subtitle: 'Smartphones, accessoires' },
      { id: 'informatique', label: 'Informatique',  glyph: 'laptop',   subtitle: 'Ordinateurs, périphériques' },
      { id: 'audio-tv',     label: 'Audio & TV',    glyph: 'tv',       subtitle: 'Casques, enceintes, télés' },
      { id: 'photo',        label: 'Photo & vidéo', glyph: 'camera',   subtitle: 'Appareils, objectifs' },
      { id: 'jeux-video',   label: 'Jeux vidéo',    glyph: 'gamepad',  subtitle: 'Consoles, jeux, accessoires' },
    ],
  },
  {
    title: 'Loisirs & culture',
    items: [
      { id: 'livres',      label: 'Livres',                glyph: 'book' },
      { id: 'films-musique', label: 'Films & musique',     glyph: 'book',   subtitle: 'CD, DVD, vinyles' },
      { id: 'instruments', label: 'Instruments de musique', glyph: 'music' },
      { id: 'sport',       label: 'Sport & fitness',       glyph: 'sport' },
      { id: 'camping',     label: 'Camping & plein air',   glyph: 'tent' },
    ],
  },
  {
    title: 'Mobilité',
    items: [
      { id: 'velos',     label: 'Vélos & mobilité',     glyph: 'bike',  subtitle: 'Vélos, trottinettes' },
      { id: 'auto-moto', label: 'Auto & moto',          glyph: 'car',   subtitle: 'Voitures, scooters' },
      { id: 'pieces',    label: 'Pièces auto & moto',   glyph: 'tool' },
      { id: 'bagages',   label: 'Bagages & voyages',    glyph: 'bag' },
    ],
  },
  {
    title: 'Art, collection & autres',
    items: [
      { id: 'art',          label: 'Art & collections',          glyph: 'art' },
      { id: 'antiquites',   label: 'Antiquités',                  glyph: 'art' },
      { id: 'evenementiel', label: 'Événementiel & déguisements', glyph: 'gift' },
      { id: 'services',     label: 'Services & échanges',         glyph: 'service' },
      { id: 'autre',        label: 'Autre',                       glyph: 'other' },
    ],
  },
];

export const CATEGORIES_FLAT: Category[] = CATEGORY_SECTIONS.flatMap((s) => s.items);

// Rental-specific categories. Reuse the existing glyph atlas where it
// fits (tools/tent/etc.) so we don't bloat the SVG set.
export const RENTAL_CATEGORIES: Category[] = [
  { id: 'rent-tools',     label: 'Tools',          glyph: 'tool',  subtitle: 'Drills, saws, sanders' },
  { id: 'rent-outdoor',   label: 'Outdoor gear',   glyph: 'tent',  subtitle: 'Tents, packs, bikes' },
  { id: 'rent-events',    label: 'Events',         glyph: 'gift',  subtitle: 'Speakers, lights, deco' },
  { id: 'rent-vehicles',  label: 'Vehicles',       glyph: 'car',   subtitle: 'Cargo bikes, trailers' },
  { id: 'rent-electronics', label: 'Electronics',  glyph: 'chip',  subtitle: 'Cameras, mics, projectors' },
];

// Service categories.
export const SERVICE_CATEGORIES: Category[] = [
  { id: 'svc-home',     label: 'Home',       glyph: 'home',     subtitle: 'Cleaning, gardening' },
  { id: 'svc-lessons',  label: 'Lessons',    glyph: 'book',     subtitle: 'Music, language, sport' },
  { id: 'svc-care',     label: 'Care',       glyph: 'baby',     subtitle: 'Childcare, elder' },
  { id: 'svc-beauty',   label: 'Beauty',     glyph: 'beauty',   subtitle: 'Hair, nails, esthetic' },
  { id: 'svc-pets',     label: 'Pets',       glyph: 'pet',      subtitle: 'Walking, sitting' },
  { id: 'svc-repairs',  label: 'Repairs',    glyph: 'tool',     subtitle: 'Bike, plumbing, IT' },
  { id: 'svc-moving',   label: 'Moving',     glyph: 'car',      subtitle: 'Hauling, help' },
  { id: 'svc-childcare', label: 'Childcare', glyph: 'baby',     subtitle: 'Babysitting, schooling' },
];

export function categoriesFor(listingType: 'sale' | 'rental' | 'service'): Category[] {
  if (listingType === 'rental') return RENTAL_CATEGORIES;
  if (listingType === 'service') return SERVICE_CATEGORIES;
  return CATEGORIES_FLAT;
}

export function findCategoryByLabel(label: string): Category | undefined {
  return CATEGORIES_FLAT.find((c) => c.label === label);
}
