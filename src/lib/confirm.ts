// Promise-based confirmation dialog. Callers `await confirm({...})` and
// receive a boolean. The `<ConfirmHost />` mounted at the root subscribes
// to this store to render the active prompt.

import { create } from 'zustand';

export type ConfirmTone = 'neutral' | 'destructive';

export type ConfirmInput = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

type ActivePrompt = ConfirmInput & {
  id: string;
  resolve: (ok: boolean) => void;
};

type ConfirmState = {
  active: ActivePrompt | null;
  show: (input: ConfirmInput) => Promise<boolean>;
  resolveActive: (ok: boolean) => void;
};

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  active: null,
  show: (input) =>
    new Promise<boolean>((resolve) => {
      set({
        active: {
          id: String(Date.now() + Math.random()),
          resolve,
          ...input,
        },
      });
    }),
  resolveActive: (ok) => {
    const cur = get().active;
    if (!cur) return;
    cur.resolve(ok);
    set({ active: null });
  },
}));

// Imperative helper for callers that don't want the hook.
export const confirm = (input: ConfirmInput) => useConfirmStore.getState().show(input);
