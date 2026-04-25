import { InjectionToken } from '@angular/core';
import { TABLER_SVG_MAP } from './svg-map.generated';

/**
 * In-memory registry of icon name → SVG string. Pre-populated with the
 * Tabler icons listed in `packages/components/icon/icons.allowlist.json`.
 *
 * Consumers extend at runtime to add custom icons (or additional Tabler
 * icons not in the default allowlist):
 *
 * ```ts
 * import { KP_ICON_REGISTRY } from '@kanso-protocol/icon';
 *
 * KP_ICON_REGISTRY.register('my-logo', '<svg viewBox="0 0 24 24">...</svg>');
 * ```
 */
class IconRegistry {
  private readonly map = new Map<string, string>(Object.entries(TABLER_SVG_MAP));

  has(name: string): boolean {
    return this.map.has(name);
  }

  get(name: string): string | undefined {
    return this.map.get(name);
  }

  register(name: string, svg: string): void {
    this.map.set(name, svg);
  }

  registerMany(entries: Record<string, string>): void {
    for (const [name, svg] of Object.entries(entries)) this.map.set(name, svg);
  }

  /** Names available right now. Order is insertion order. */
  names(): string[] {
    return Array.from(this.map.keys());
  }
}

export const KP_ICON_REGISTRY = new IconRegistry();

/** DI token for advanced consumers wanting to swap registries (tests, etc). */
export const KP_ICON_REGISTRY_TOKEN = new InjectionToken<IconRegistry>('KP_ICON_REGISTRY', {
  providedIn: 'root',
  factory: () => KP_ICON_REGISTRY,
});

export type KpIconRegistry = IconRegistry;
