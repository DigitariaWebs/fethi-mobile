// Lightweight toast queue. Components call `useToast().show(...)` to
// enqueue a transient message; the `<ToastHost />` mounted at the root
// of the app subscribes to this store and animates the active toast.
//
// We intentionally only render one toast at a time (newest replaces
// older). 3 s default duration; auto-dismiss handled inside the host.

import { create } from 'zustand';

export type ToastTone = 'neutral' | 'success' | 'error' | 'warning';

export type ToastInput = {
  message: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
  action?: { label: string; onPress: () => void };
};

export type Toast = ToastInput & {
  id: string;
  tone: ToastTone;
  durationMs: number;
};

type ToastState = {
  current: Toast | null;
  show: (input: ToastInput) => string;
  dismiss: (id?: string) => void;
};

const DEFAULT_DURATION = 3000;

export const useToastStore = create<ToastState>((set, get) => ({
  current: null,
  show: (input) => {
    const id = String(Date.now() + Math.random());
    set({
      current: {
        id,
        message: input.message,
        description: input.description,
        tone: input.tone ?? 'neutral',
        durationMs: input.durationMs ?? DEFAULT_DURATION,
        action: input.action,
      },
    });
    return id;
  },
  dismiss: (id) => {
    const cur = get().current;
    if (!cur) return;
    if (id && cur.id !== id) return;
    set({ current: null });
  },
}));

// Hook used by callers — exposes `show` plus a couple of tone shortcuts.
export function useToast() {
  const show = useToastStore((s) => s.show);
  const dismiss = useToastStore((s) => s.dismiss);
  return {
    show,
    dismiss,
    success: (message: string, opts?: Omit<ToastInput, 'message' | 'tone'>) =>
      show({ ...opts, message, tone: 'success' }),
    error: (message: string, opts?: Omit<ToastInput, 'message' | 'tone'>) =>
      show({ ...opts, message, tone: 'error' }),
    info: (message: string, opts?: Omit<ToastInput, 'message' | 'tone'>) =>
      show({ ...opts, message, tone: 'neutral' }),
  };
}
