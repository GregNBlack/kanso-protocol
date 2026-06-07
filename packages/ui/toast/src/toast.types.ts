export type KpToastAppearance = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
export type KpToastSize = 'sm' | 'md';
export type KpToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface KpToast {
  id: number;
  appearance: KpToastAppearance;
  title: string;
  description?: string;
  /** When set, shows an action button. The callback receives the toast id
   *  so the handler can dismiss or replace the toast if needed. */
  action?: { label: string; handler: (id: number) => void };
  /** Auto-dismiss duration in ms. `0` keeps the toast up until it's
   *  dismissed explicitly. Defaults to 5000. */
  duration: number;
}

/** Convenience — the arg shape callers pass to `KpToastService.show()`. */
export interface KpToastShowInput {
  appearance?: KpToastAppearance;
  title: string;
  description?: string;
  action?: { label: string; handler: (id: number) => void };
  duration?: number;
}
