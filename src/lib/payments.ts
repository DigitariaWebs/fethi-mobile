// Payment methods + bank accounts (mock). Stripe SDK wires later.

import { create } from 'zustand';

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export type Card = {
  id: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  nickname?: string;
  isDefault?: boolean;
};

export type BankAccount = {
  id: string;
  iban: string;       // 'FR76 •••• •••• 1234'
  holder: string;
  bicHint?: string;
  isDefault?: boolean;
};

export type PayoutSchedule = {
  cadence: 'daily' | 'weekly' | 'monthly';
  minimumCents: number;
};

type PaymentsState = {
  cards: Card[];
  banks: BankAccount[];
  schedule: PayoutSchedule;
  addCard: (c: Omit<Card, 'id'>) => string;
  removeCard: (id: string) => void;
  setDefaultCard: (id: string) => void;
  addBank: (b: Omit<BankAccount, 'id'>) => string;
  removeBank: (id: string) => void;
  setDefaultBank: (id: string) => void;
  setSchedule: (s: PayoutSchedule) => void;
};

const SEED_CARDS: Card[] = [
  { id: 'c1', brand: 'visa',       last4: '4242', expMonth: 8,  expYear: 2027, nickname: 'Personal',   isDefault: true },
  { id: 'c2', brand: 'mastercard', last4: '5454', expMonth: 12, expYear: 2026, nickname: 'Joint card' },
  { id: 'c3', brand: 'amex',       last4: '0006', expMonth: 3,  expYear: 2028 },
];

const SEED_BANKS: BankAccount[] = [
  { id: 'b1', iban: 'FR76 1820 6005 3404 0123 4567 891', holder: 'Marie Lefèvre', bicHint: 'AGRIFRPP', isDefault: true },
];

export const usePayments = create<PaymentsState>((set, get) => ({
  cards: SEED_CARDS,
  banks: SEED_BANKS,
  schedule: { cadence: 'weekly', minimumCents: 1000 },
  addCard: (c) => {
    const id = `c${Date.now()}`;
    const cards = get().cards;
    set({ cards: [...cards, { id, ...c }] });
    return id;
  },
  removeCard: (id) =>
    set({ cards: get().cards.filter((c) => c.id !== id) }),
  setDefaultCard: (id) =>
    set({
      cards: get().cards.map((c) => ({ ...c, isDefault: c.id === id })),
    }),
  addBank: (b) => {
    const id = `b${Date.now()}`;
    set({ banks: [...get().banks, { id, ...b }] });
    return id;
  },
  removeBank: (id) =>
    set({ banks: get().banks.filter((b) => b.id !== id) }),
  setDefaultBank: (id) =>
    set({ banks: get().banks.map((b) => ({ ...b, isDefault: b.id === id })) }),
  setSchedule: (s) => set({ schedule: s }),
}));

// Detect brand from PAN prefix — same heuristic as Stripe's frontend.
export function detectBrand(pan: string): CardBrand {
  const digits = pan.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
}

export function formatPan(pan: string, brand: CardBrand): string {
  const d = pan.replace(/\D/g, '');
  if (brand === 'amex') {
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ');
  }
  return [d.slice(0, 4), d.slice(4, 8), d.slice(8, 12), d.slice(12, 16)].filter(Boolean).join(' ');
}
