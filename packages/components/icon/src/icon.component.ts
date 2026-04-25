import {
  Component,
  Input,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import type { KpSize } from '@kanso-protocol/core';

import { KP_ICON_REGISTRY_TOKEN } from './icon-registry';

/** Icon dimensions (px) per Kanso size ramp — pairs with `tokens/primitive/icon.json`. */
const ICON_SIZE_PX: Readonly<Record<KpSize, number>> = Object.freeze({
  xs: 14,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 24,
});

/** Stroke width per size — matches `tokens/primitive/icon.json` for optical compensation. */
const ICON_STROKE: Readonly<Record<KpSize, number>> = Object.freeze({
  xs: 1.25,
  sm: 1.35,
  md: 1.5,
  lg: 1.75,
  xl: 2,
});

/**
 * Kanso Protocol — Icon Component
 *
 * Renders Tabler Icons SVGs inline with stroke-width auto-tuned per size.
 * The same `name` strings work in code and Figma (the `tabler/{name}` master
 * components on the Foundations » Tabler Icons page mirror this set).
 *
 * @example
 * <kp-icon name="search" size="md" />
 * <kp-icon name="star-filled" size="sm" />
 * <kp-icon [name]="dynamicName" size="lg" />
 *
 * Need an icon outside the default set? Register at startup:
 *
 *   KP_ICON_REGISTRY.register('my-logo', '<svg viewBox="0 0 24 24">…</svg>');
 */
@Component({
  selector: 'kp-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class]': 'hostClasses()',
    '[innerHTML]': 'safeSvg()',
  },
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: var(--kp-icon-size);
      height: var(--kp-icon-size);
      color: currentColor;
    }
    :host > svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `],
  template: '',
})
export class KpIconComponent {
  /** Icon name. Outline names are bare (`search`); filled names take the `-filled` suffix (`star-filled`). */
  @Input({ required: true })
  set name(v: string) { this._name.set(v); }
  get name(): string { return this._name(); }

  /** Size ramp — drives both width/height and stroke-width. */
  @Input()
  set size(v: KpSize) { this._size.set(v); }
  get size(): KpSize { return this._size(); }

  private readonly _name = signal<string>('');
  private readonly _size = signal<KpSize>('md');
  private readonly registry = inject(KP_ICON_REGISTRY_TOKEN);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly hostClasses = computed(() => `kp-icon kp-icon--${this._size()}`);

  protected readonly safeSvg = computed<SafeHtml>(() => {
    const name = this._name();
    if (!name) return '';
    const raw = this.registry.get(name);
    if (!raw) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(`[kp-icon] Unknown icon "${name}". Register it via KP_ICON_REGISTRY.register().`);
      }
      return '';
    }
    const sized = this.applyDimensions(raw, this._size());
    return this.sanitizer.bypassSecurityTrustHtml(sized);
  });

  /**
   * Rewrite the root <svg> attributes so the rendered icon matches the
   * Kanso size + stroke-width ramp. Width/height = pixel size; stroke-width
   * is overridden when the SVG carries one. Filled variants ignore stroke.
   */
  private applyDimensions(svg: string, size: KpSize): string {
    const sizePx = ICON_SIZE_PX[size];
    const strokePx = ICON_STROKE[size];
    return svg
      .replace(/<svg([^>]*)>/, (_, attrs) => {
        let next = attrs as string;
        next = next.replace(/\swidth="[^"]*"/, '').replace(/\sheight="[^"]*"/, '');
        next = next.replace(/\sstroke-width="[^"]*"/, '');
        next += ` width="${sizePx}" height="${sizePx}"`;
        if (/stroke="(?!none)/.test(attrs)) next += ` stroke-width="${strokePx}"`;
        return `<svg${next}>`;
      });
  }
}
