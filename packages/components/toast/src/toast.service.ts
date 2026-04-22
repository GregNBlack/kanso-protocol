import { Injectable, signal } from '@angular/core';

import { KpToast, KpToastAppearance, KpToastShowInput } from './toast.types';

/**
 * Kanso Protocol — ToastService
 *
 * Signal-backed queue of active toasts. Render them anywhere with one
 * `<kp-toast-host/>` (or several, one per corner). Auto-dismiss timers
 * live here so callers can't accidentally leak timers by destroying a
 * host component mid-toast.
 */
@Injectable({ providedIn: 'root' })
export class KpToastService {
  private readonly _toasts = signal<KpToast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(input: KpToastShowInput): number {
    const id = this.nextId++;
    const toast: KpToast = {
      id,
      appearance: input.appearance ?? 'neutral',
      title: input.title,
      description: input.description,
      action: input.action,
      duration: input.duration ?? 5000,
    };
    this._toasts.update((list) => [...list, toast]);
    if (toast.duration > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), toast.duration),
      );
    }
    return id;
  }

  // Convenience methods — match the appearance names for cleaner call sites.
  primary(title: string, description?: string, opts?: Partial<KpToastShowInput>): number {
    return this.show({ ...opts, appearance: 'primary', title, description });
  }
  success(title: string, description?: string, opts?: Partial<KpToastShowInput>): number {
    return this.show({ ...opts, appearance: 'success', title, description });
  }
  danger(title: string, description?: string, opts?: Partial<KpToastShowInput>): number {
    return this.show({ ...opts, appearance: 'danger', title, description });
  }
  warning(title: string, description?: string, opts?: Partial<KpToastShowInput>): number {
    return this.show({ ...opts, appearance: 'warning', title, description });
  }
  info(title: string, description?: string, opts?: Partial<KpToastShowInput>): number {
    return this.show({ ...opts, appearance: 'info', title, description });
  }
  neutral(title: string, description?: string, opts?: Partial<KpToastShowInput>): number {
    return this.show({ ...opts, appearance: 'neutral', title, description });
  }

  dismiss(id: number): void {
    const t = this.timers.get(id);
    if (t != null) { clearTimeout(t); this.timers.delete(id); }
    this._toasts.update((list) => list.filter((toast) => toast.id !== id));
  }

  dismissAll(): void {
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
    this._toasts.set([]);
  }
}
