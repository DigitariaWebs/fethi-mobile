// Tiered KYC. Tier 0 = signed up. Tier 1 = identity verified (allows
// payouts up to €X). Tier 2 = address verified (no caps).

import { create } from 'zustand';

export type KYCTier = 0 | 1 | 2;
export type KYCStatus = 'idle' | 'pending' | 'approved' | 'rejected';

type KYCState = {
  tier: KYCTier;
  status: KYCStatus;
  rejectionReason?: string;
  // Per-step capture state.
  identityFront: string | null; // local URI
  identityBack: string | null;
  selfie: string | null;
  addressProof: string | null;
  setCapture: (key: 'identityFront' | 'identityBack' | 'selfie' | 'addressProof', uri: string | null) => void;
  submit: () => Promise<void>;
  reset: () => void;
};

export const useKYC = create<KYCState>((set, get) => ({
  tier: 0,
  status: 'idle',
  identityFront: null,
  identityBack: null,
  selfie: null,
  addressProof: null,
  setCapture: (key, uri) => set({ [key]: uri } as any),
  submit: async () => {
    set({ status: 'pending' });
    // Simulate review.
    await new Promise((r) => setTimeout(r, 1800));
    const ok = Math.random() > 0.05;
    if (ok) {
      const next: KYCTier = get().addressProof ? 2 : 1;
      set({ status: 'approved', tier: next });
    } else {
      set({
        status: 'rejected',
        rejectionReason: "We couldn't read your ID — please try again with better lighting.",
      });
    }
  },
  reset: () =>
    set({
      tier: 0,
      status: 'idle',
      rejectionReason: undefined,
      identityFront: null,
      identityBack: null,
      selfie: null,
      addressProof: null,
    }),
}));
