// Catalog of testable end-to-end scenarios. Each entry has a label, a
// short blurb explaining what will happen, and a `run(api)` function
// that drives the app through the journey using existing stores +
// imperative router calls.
//
// `api` is built per-run with hooks the scenario can call: navigate,
// toast, confirm, set sell draft, push notifications, mutate the orders
// store, etc. Keeping this catalog data-driven means the Scenarios
// screen is just a list — no need to hand-write each runner inline.

import type { Router } from 'expo-router';

import { useOrders, type Order } from './orders';
import { useNotifications } from './notifications';
import { useSellDraft } from './sellDraft';
import { useSession } from './session';
import { useSubscription } from './subscription';

export type ScenarioCategory =
  | 'Posting'
  | 'Buyer'
  | 'Seller'
  | 'Subscription'
  | 'Account'
  | 'Edge cases';

export type ScenarioApi = {
  router: Router;
  toast: { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void };
  // Helper to bounce a notification into the inbox.
  pushNotification: (n: {
    kind: 'message' | 'offer' | 'booking-request' | 'listing-sold' | 'order-update' | 'review' | 'payout' | 'system';
    title: string;
    body?: string;
    href?: string;
  }) => void;
  // Sleep for `ms`. Sequential awaits make scenarios read like a script.
  wait: (ms: number) => Promise<void>;
};

export type Scenario = {
  id: string;
  category: ScenarioCategory;
  title: string;
  blurb: string;
  // Returning a Promise lets the runner show a "running…" pill in the UI.
  run: (api: ScenarioApi) => Promise<void>;
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────────────
// Scenarios
// ─────────────────────────────────────────────────────────────────────

export const SCENARIOS: Scenario[] = [
  // ── Posting ────────────────────────────────────────────────────────
  {
    id: 'post-sale',
    category: 'Posting',
    title: 'Publier une annonce de vente',
    blurb: 'Type → photos → titre → prix → remise → relecture → publication.',
    run: async ({ router }) => {
      router.push('/sell/type' as any);
    },
  },
  {
    id: 'post-rental',
    category: 'Posting',
    title: 'Publier une location',
    blurb: 'Ajoute le tarif jour/semaine, la caution et le calendrier de disponibilité.',
    run: async ({ router }) => {
      useSellDraft.getState().set({ listingType: 'rental' });
      router.push('/sell' as any);
    },
  },
  {
    id: 'post-service',
    category: 'Posting',
    title: 'Publier un service',
    blurb: 'Titre + catégorie de service + description + tarif horaire ou forfait.',
    run: async ({ router }) => {
      useSellDraft.getState().set({ listingType: 'service' });
      router.push('/sell/service/details' as any);
    },
  },
  {
    id: 'save-draft',
    category: 'Posting',
    title: 'Sauvegarder un brouillon et reprendre',
    blurb: 'Ouvre le flux de vente, sauvegarde et quitte à l\'étape 2, et retrouve le brouillon sur la carte.',
    run: async ({ router }) => {
      router.push('/sell/title' as any);
    },
  },
  {
    id: 'mark-sold',
    category: 'Posting',
    title: 'Marquer une annonce comme vendue',
    blurb: 'Ouvre une de tes annonces actives → marque-la comme vendue.',
    run: async ({ router, toast }) => {
      router.push('/my-listings' as any);
      toast.info('Appuie sur une ligne pour la gérer.');
    },
  },
  {
    id: 'boost',
    category: 'Posting',
    title: 'Booster une annonce',
    blurb: 'Sélection du niveau → paiement simulé → toast de succès.',
    run: async ({ router }) => {
      router.push('/my-listings/1/promote' as any);
    },
  },

  // ── Buyer ──────────────────────────────────────────────────────────
  {
    id: 'buyer-offer-accepted',
    category: 'Buyer',
    title: 'L\'acheteur fait une offre → acceptée',
    blurb:
      'Une offre déjà préparée dans le chat de Karim. Appuie sur Accepter dans la carte d\'offre ; la remise est proposée ; les deux confirment.',
    run: async ({ router, toast }) => {
      router.push('/(tabs)/messages/karim' as any);
      await wait(150);
      toast.info('Appuie sur « Accepter 165 € » dans la carte d\'offre.');
    },
  },
  {
    id: 'buyer-checkout-sale',
    category: 'Buyer',
    title: 'L\'acheteur paie une vente',
    blurb: 'Accès direct au paiement de la PS4 → traitement → succès.',
    run: async ({ router }) => {
      router.push('/payment/checkout/4' as any);
    },
  },
  {
    id: 'buyer-rental',
    category: 'Buyer',
    title: 'Réserver une location',
    blurb: 'Choix des dates → paiement avec caution retenue → succès.',
    run: async ({ router }) => {
      router.push('/booking/rental/r1/dates' as any);
    },
  },
  {
    id: 'buyer-service',
    category: 'Buyer',
    title: 'Réserver un créneau de service',
    blurb: 'Choix date/heure → détails → paiement.',
    run: async ({ router }) => {
      router.push('/booking/service/s1/slot' as any);
    },
  },
  {
    id: 'buyer-counter',
    category: 'Buyer',
    title: 'Faire une contre-offre à une contre-offre',
    blurb: 'Ouvre un chat côté acheteur avec une offre en attente.',
    run: async ({ router }) => {
      router.push('/(tabs)/messages/karim' as any);
    },
  },
  {
    id: 'buyer-3ds',
    category: 'Buyer',
    title: 'Carte refusée → challenge 3DS → nouvel essai',
    blurb: 'Traite le paiement plusieurs fois — ~30 % passent par 3DS, qui simule la vérification bancaire.',
    run: async ({ router }) => {
      router.push('/payment/processing?orderId=o1' as any);
    },
  },
  {
    id: 'buyer-refund',
    category: 'Buyer',
    title: 'Demander un remboursement',
    blurb: 'Ouvre une commande terminée → demande un remboursement partiel → toast.',
    run: async ({ router }) => {
      router.push('/orders/o2/refund-request' as any);
    },
  },
  {
    id: 'buyer-dispute',
    category: 'Buyer',
    title: 'Ouvrir un litige',
    blurb: 'Choix de la raison → détails → envoi ; le statut de la commande passe à « en litige ».',
    run: async ({ router }) => {
      router.push('/orders/o1/dispute' as any);
    },
  },
  {
    id: 'buyer-share-loc',
    category: 'Buyer',
    title: 'Partager sa position dans le chat',
    blurb: 'Ouvre le chat → « + » → Position → la bulle de position apparaît.',
    run: async ({ router, toast }) => {
      router.push('/(tabs)/messages/lea' as any);
      toast.info('Appuie sur « + » → Position.');
    },
  },
  {
    id: 'buyer-report',
    category: 'Buyer',
    title: 'Signaler une annonce',
    blurb: 'Choix de la raison + détails + toast d\'envoi.',
    run: async ({ router }) => {
      router.push('/report/listing/1' as any);
    },
  },

  // ── Seller ─────────────────────────────────────────────────────────
  {
    id: 'seller-incoming-offer',
    category: 'Seller',
    title: 'Recevoir une offre → accepter',
    blurb: "Ouvre le chat côté vendeur d'Amélie avec la carte d'offre en attente.",
    run: async ({ router, toast }) => {
      router.push('/(tabs)/messages/amelie' as any);
      toast.info('Appuie sur « Accepter 95 € » pour passer à la remise.');
    },
  },
  {
    id: 'seller-low-ball',
    category: 'Seller',
    title: 'Refuser une offre sous le minimum',
    blurb: 'Le fil de Marc affiche un 70 € refusé (sous ton minimum) — fait apparaître la pastille d\'avertissement.',
    run: async ({ router }) => {
      router.push('/(tabs)/messages/marc' as any);
    },
  },
  {
    id: 'seller-pickup-stuck',
    category: 'Seller',
    title: 'L\'acheteur disparaît au moment de la remise',
    blurb:
      "La commande est payée mais aucun des deux n'a confirmé. Nous envoyons 3 notifications de rappel + un toast et épinglons la pastille de reprise.",
    run: async ({ router, toast, pushNotification, wait }) => {
      // Bump the existing PS4 order back to handoff-pending.
      useOrders.getState().patch('o1', { status: 'handoff-pending' });
      pushNotification({
        kind: 'order-update',
        title: 'Vous vous êtes rencontrés ?',
        body: 'Appuie pour confirmer ou ouvrir un litige.',
        href: '/orders/o1',
      });
      await wait(800);
      toast.error("Karim n'a toujours pas confirmé — le relancer ?");
      await wait(800);
      pushNotification({
        kind: 'order-update',
        title: 'Rappel : confirme la remise',
        body: 'Les fonds sont libérés quand les deux parties confirment.',
        href: '/orders/o1/handoff',
      });
      await wait(400);
      router.push('/orders/o1' as any);
    },
  },
  {
    id: 'seller-release-deposit',
    category: 'Seller',
    title: 'Rendre une caution de location',
    blurb: 'Ouvre la commande de location → checklist de restitution de caution → confirme.',
    run: async ({ router }) => {
      // Make sure the rental order is in a state where releasing makes sense.
      useOrders.getState().patch('o3', {
        buyerConfirmed: true,
        sellerConfirmed: true,
        status: 'awaiting-pickup',
      });
      router.push('/orders/o3/release-deposit' as any);
    },
  },
  {
    id: 'seller-payout',
    category: 'Seller',
    title: 'Voir un versement',
    blurb: 'Tableau des revenus → appuie sur une transaction → détail brut/commission/net.',
    run: async ({ router }) => {
      router.push('/payouts/transaction/p1' as any);
    },
  },
  {
    id: 'seller-stripe-connect',
    category: 'Seller',
    title: 'Onboarding Stripe Connect',
    blurb: 'Simulation de KYB multi-étapes → toast « vérification ».',
    run: async ({ router }) => {
      router.push('/payouts/connect' as any);
    },
  },

  // ── Subscription ───────────────────────────────────────────────────
  {
    id: 'sub-paywall-custom',
    category: 'Subscription',
    title: 'Atteindre le paywall via le rayon personnalisé',
    blurb: 'Ouvre les filtres → appuie sur un rayon verrouillé (5 km, 10 km, Personnalisé…) → paywall.',
    run: async ({ router }) => {
      router.push('/(tabs)/map/filters' as any);
    },
  },
  {
    id: 'sub-paywall-ai',
    category: 'Subscription',
    title: 'Atteindre le paywall via la catégorie IA',
    blurb: 'Ouvre l\'étape du titre → appuie sur la pastille « IA · MyStreet+ » → paywall.',
    run: async ({ router }) => {
      useSellDraft.getState().set({ listingType: 'sale' });
      router.push('/sell/title' as any);
    },
  },
  {
    id: 'sub-paywall-help-write',
    category: 'Subscription',
    title: 'Atteindre le paywall via « Aide à la rédaction »',
    blurb: 'Ouvre l\'étape de description → appuie sur la pastille « Aide à la rédaction · MyStreet+ ».',
    run: async ({ router }) => {
      useSellDraft.getState().set({ listingType: 'sale' });
      router.push('/sell/description' as any);
    },
  },
  {
    id: 'sub-upgrade',
    category: 'Subscription',
    title: 'Passer à MyStreet+',
    blurb: 'Accès direct au paywall → simulation d\'achat → le niveau bascule, les fonctions IA s\'activent.',
    run: async ({ router }) => {
      router.push('/subscription' as any);
    },
  },
  {
    id: 'sub-downgrade',
    category: 'Subscription',
    title: 'Revenir au niveau gratuit',
    blurb: 'Annule l\'abonnement localement — les restrictions reviennent immédiatement.',
    run: async ({ toast }) => {
      await useSubscription.getState().cancel();
      toast.success('Annulé. Tu es de retour sur le niveau gratuit.');
    },
  },
  {
    id: 'sub-plus-seller-flow',
    category: 'Subscription',
    title: 'Flux de publication vendeur premium',
    blurb: 'Passage auto à MyStreet+ → arrive sur /sell/title avec la catégorie IA active et l\'aide à la rédaction.',
    run: async ({ router, toast }) => {
      await useSubscription.getState().upgrade();
      toast.success('MyStreet+ actif.');
      useSellDraft.getState().set({ listingType: 'sale' });
      router.push('/sell/title' as any);
    },
  },

  // ── Account ────────────────────────────────────────────────────────
  {
    id: 'acct-blocked',
    category: 'Account',
    title: 'Compte bloqué',
    blurb: 'Affiche un écran « ton compte est suspendu » avec un CTA de contact support.',
    run: async ({ router, pushNotification }) => {
      pushNotification({
        kind: 'system',
        title: 'Ton compte a été suspendu',
        body: 'Raison : plusieurs litiges de paiement. Contacte le support pour faire appel.',
      });
      router.push('/scenarios/account-blocked' as any);
    },
  },
  {
    id: 'acct-restricted',
    category: 'Account',
    title: 'Vente restreinte',
    blurb: 'Essaie /sell/type → un bandeau bloque la publication tant que la vérification n\'est pas faite.',
    run: async ({ router }) => {
      router.push('/scenarios/account-restricted' as any);
    },
  },
  {
    id: 'acct-kyc-rejected',
    category: 'Account',
    title: 'KYC refusé → nouvel essai',
    blurb: 'Force le store KYC à l\'état refusé et affiche l\'écran de statut.',
    run: async ({ router }) => {
      // No public setter — go through the flow which uses a 5% rejection chance.
      router.push('/kyc/intro' as any);
    },
  },
  {
    id: 'acct-delete',
    category: 'Account',
    title: 'Supprimer le compte',
    blurb: '3 cases de sécurité → confirme → efface la session → redirige vers /welcome.',
    run: async ({ router }) => {
      router.push('/settings/account/delete' as any);
    },
  },

  // ── Edge cases ─────────────────────────────────────────────────────
  {
    id: 'edge-network-banner',
    category: 'Edge cases',
    title: 'Bandeau de panne réseau',
    blurb: '(Le composant est dans le repo, pas monté — câblage à finaliser quand NetInfo arrive.)',
    run: async ({ toast }) => {
      toast.info('Câblage NetInfo TODO. Composant livré.');
    },
  },
  {
    id: 'edge-error-boundary',
    category: 'Edge cases',
    title: 'Déclencher la frontière d\'erreur',
    blurb: 'Lance une erreur pendant le rendu pour faire apparaître le fallback.',
    run: async ({ router }) => {
      router.push('/scenarios/throw' as any);
    },
  },
  {
    id: 'edge-empty-orders',
    category: 'Edge cases',
    title: 'Liste de commandes vide',
    blurb: 'Vide le store des commandes — la boîte affiche l\'EmptyState.',
    run: async ({ router, toast }) => {
      const orders = useOrders.getState().orders;
      orders.forEach((o) =>
        useOrders.getState().patch(o.id, { status: 'cancelled' }),
      );
      // No proper "remove all" — push tab.
      router.push('/orders' as any);
      toast.info('Filtre sur « achats » ou « ventes » pour voir l\'état vide.');
    },
  },
  {
    id: 'edge-reset-app',
    category: 'Edge cases',
    title: 'Réinitialiser la démo (tout)',
    blurb: 'Efface session, brouillon, abonnement. Redirige vers /welcome.',
    run: async ({ router, toast }) => {
      await useSession.getState().reset();
      useSellDraft.getState().reset();
      await useSubscription.getState().cancel();
      useNotifications.getState().clearAll();
      toast.success('Démo réinitialisée.');
      router.replace('/welcome' as any);
    },
  },
];

// Helper: synthesise a notification + add it to the store.
export function appendNotification(input: {
  kind: 'message' | 'offer' | 'booking-request' | 'listing-sold' | 'order-update' | 'review' | 'payout' | 'system';
  title: string;
  body?: string;
  href?: string;
}) {
  const id = `n-scn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  useNotifications.setState((s) => ({
    items: [
      {
        id,
        kind: input.kind,
        title: input.title,
        body: input.body,
        at: new Date().toISOString(),
        unread: true,
        href: input.href,
      },
      ...s.items,
    ],
  }));
}
