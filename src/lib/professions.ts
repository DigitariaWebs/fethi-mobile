// Professions list — French labels, ~100 entries spanning common fields the
// MyStreet user base is likely to come from in Lille (students, médical,
// éducation, retail, tech, créatif, métiers manuels, etc.).
//
// Used as the typeahead source on the onboarding profile screen. Users can
// also free-type and submit a custom value if their job isn't in the list.

export const PROFESSIONS: string[] = [
  'Étudiant·e',
  'Lycéen·ne',
  'Apprenti·e',
  'En recherche d’emploi',
  'Retraité·e',
  'Sans profession',

  // Santé & médical
  'Médecin',
  'Infirmier·ère',
  'Aide-soignant·e',
  'Sage-femme',
  'Pharmacien·ne',
  'Kinésithérapeute',
  'Ostéopathe',
  'Dentiste',
  'Orthophoniste',
  'Psychologue',
  'Vétérinaire',

  // Éducation & recherche
  'Enseignant·e',
  'Professeur·e des écoles',
  'Enseignant·e du secondaire',
  'Enseignant·e-chercheur·euse',
  'Chercheur·euse',
  'Doctorant·e',
  'Bibliothécaire',
  'Documentaliste',
  'Éducateur·trice',
  'Animateur·trice',

  // Tech & data
  'Développeur·euse',
  'Développeur·euse front-end',
  'Développeur·euse back-end',
  'Développeur·euse full-stack',
  'Ingénieur·e logiciel',
  'Ingénieur·e DevOps',
  'Data analyst',
  'Data scientist',
  'Data engineer',
  'Product manager',
  'Product owner',
  'Designer UX/UI',
  'Designer graphique',
  'Chef·fe de projet digital',

  // Ingénierie & sciences
  'Ingénieur·e civil·e',
  'Ingénieur·e mécanique',
  'Ingénieur·e électrique',
  'Architecte',
  'Architecte d’intérieur',
  'Urbaniste',
  'Géomètre',

  // Finance, juridique, gestion
  'Comptable',
  'Expert-comptable',
  'Auditeur·trice',
  'Contrôleur·euse de gestion',
  'Conseiller·ère bancaire',
  'Avocat·e',
  'Notaire',
  'Juriste',
  'Huissier·ère',

  // Marketing, comm, médias
  'Chargé·e de communication',
  'Chargé·e de marketing',
  'Community manager',
  'Journaliste',
  'Rédacteur·trice',
  'Photographe',
  'Vidéaste',
  'Réalisateur·trice',
  'Producteur·trice',

  // Commerce, vente, accueil
  'Commerçant·e',
  'Vendeur·euse',
  'Caissier·ère',
  'Hôte·sse d’accueil',
  'Réceptionniste',
  'Conseiller·ère en magasin',
  'Manager retail',

  // Restauration, hôtellerie
  'Cuisinier·ère',
  'Chef·fe de cuisine',
  'Pâtissier·ère',
  'Boulanger·ère',
  'Serveur·euse',
  'Barista',
  'Sommelier·ère',
  'Restaurateur·trice',

  // Métiers manuels & bâtiment
  'Artisan·e',
  'Menuisier·ère',
  'Plombier·ère',
  'Électricien·ne',
  'Peintre en bâtiment',
  'Maçon·ne',
  'Couturier·ère',
  'Coiffeur·euse',
  'Esthéticien·ne',
  'Tatoueur·euse',

  // Transport & logistique
  'Chauffeur·euse',
  'Chauffeur·euse VTC',
  'Livreur·euse',
  'Coursier·ère vélo',
  'Conducteur·trice de train',

  // Public, social, sécurité
  'Fonctionnaire',
  'Agent·e administratif·ve',
  'Travailleur·euse social·e',
  'Pompier·ère',
  'Policier·ère',
  'Gendarme',
  'Militaire',
  'Surveillant·e pénitentiaire',

  // Culture, art, sport
  'Artiste',
  'Musicien·ne',
  'Comédien·ne',
  'Danseur·euse',
  'Coach sportif·ve',
  'Sportif·ve professionnel·le',

  // Direction, conseil, indépendant
  'Entrepreneur·e',
  'Freelance',
  'Consultant·e',
  'Dirigeant·e',
  'Cadre',

  // Autre
  'Autre',
];

// Diacritic-insensitive substring match. We don't import a normalize lib —
// `String.prototype.normalize('NFD')` + a regex is enough for FR strings.
export function searchProfessions(query: string, limit = 8): string[] {
  const q = normalize(query.trim());
  if (!q) return PROFESSIONS.slice(0, limit);
  const startsWith: string[] = [];
  const contains: string[] = [];
  for (const p of PROFESSIONS) {
    const n = normalize(p);
    if (n.startsWith(q)) startsWith.push(p);
    else if (n.includes(q)) contains.push(p);
    if (startsWith.length >= limit) break;
  }
  return [...startsWith, ...contains].slice(0, limit);
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
