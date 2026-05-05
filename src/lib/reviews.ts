// Mock review pool, keyed by seller id. Each entry is a single rating +
// short comment from another buyer. Real backend would replace this with
// `/sellers/{id}/reviews`.

export type Review = {
  id: string;
  buyerName: string;
  rating: number;
  text: string;
  daysAgo: number;
  itemTitle: string;
};

const POOL: Review[] = [
  { id: 'r1', buyerName: 'Élise M.', rating: 5, text: 'Super sympa, vélo en parfait état. Je recommande !',                   daysAgo: 4,  itemTitle: 'Vélo Peugeot' },
  { id: 'r2', buyerName: 'Jean P.',  rating: 5, text: 'Échange rapide et tout est conforme à l’annonce.',                     daysAgo: 12, itemTitle: 'Console PS4' },
  { id: 'r3', buyerName: 'Inès K.',  rating: 4, text: 'Bonne transaction, juste un peu de retard sur l’horaire.',             daysAgo: 22, itemTitle: 'Lampe vintage' },
  { id: 'r4', buyerName: 'Mathieu B.', rating: 5, text: 'Communication impeccable, l’objet est nickel.',                       daysAgo: 35, itemTitle: 'Casque audio' },
  { id: 'r5', buyerName: 'Sarah L.', rating: 5, text: 'Très réactif, et l’objet est exactement comme décrit. Merci !',        daysAgo: 48, itemTitle: 'Robe vintage' },
  { id: 'r6', buyerName: 'Thomas C.', rating: 4, text: 'Bon contact, RDV un peu compliqué à caler mais tout s’est bien passé.', daysAgo: 70, itemTitle: 'Vélo électrique' },
];

// Deterministic per-seller slice — same seller always sees the same set.
export function reviewsFor(sellerId: string, count = 4): Review[] {
  let h = 0;
  for (let i = 0; i < sellerId.length; i++) h = (h * 31 + sellerId.charCodeAt(i)) >>> 0;
  const start = h % POOL.length;
  return Array.from({ length: count }, (_, i) => {
    const r = POOL[(start + i) % POOL.length];
    return { ...r, id: `${sellerId}-${r.id}` };
  });
}

const BIOS: Record<string, string> = {
  marie:
    "J'écume les vide-greniers du Vieux-Lille depuis dix ans. Tout ce que je vends est en bon état et lavé.",
  tom:
    'Jeune papa, je revends les affaires de bébé qui ne servent plus. Disponible le soir.',
  lea:
    'Café et bouquins. Je trie ma collection régulièrement, fais-moi signe si tu cherches un titre précis.',
  karim:
    "Joueur passionné depuis l'enfance. Tout mon matériel est testé et fonctionne avant la mise en vente.",
  anais:
    "J'aime la déco brocante et les objets qui ont une histoire.",
  olivier:
    "Rénovateur du dimanche, je revends ce qui ne sert plus. Réponses rapides et négociation possible.",
  sophie:
    "Je lis énormément. Mes livres sont annotés au crayon mais en très bon état général.",
  hugo:
    'Outdoor, randonnée, vélo. Toujours partant pour échanger ou rencontrer du monde.',
  amelie:
    "Étudiante en archi à Lille. Je cherche surtout des vélos et du mobilier seconde main.",
  thomas:
    "Père de famille, je récupère ce qui peut servir aux enfants ou au garage.",
  marc:
    "Touche-à-tout, je négocie tout. Désolé d'avance pour les offres basses.",
};

export function bioFor(sellerId: string): string {
  return (
    BIOS[sellerId] ?? "Vendeur sur MyStreet. Bienvenue sur mon profil !"
  );
}
