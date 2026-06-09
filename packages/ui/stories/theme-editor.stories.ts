import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  OnDestroy,
} from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

import { KpButtonComponent } from '@kanso-protocol/ui/button';
import { KpBadgeComponent } from '@kanso-protocol/ui/badge';
import { KpAlertComponent } from '@kanso-protocol/ui/alert';
import { KpInputComponent } from '@kanso-protocol/ui/input';
import { KpCheckboxComponent } from '@kanso-protocol/ui/checkbox';
import { KpToggleComponent } from '@kanso-protocol/ui/toggle';
import { KpNumberStepperComponent } from '@kanso-protocol/ui/number-stepper';
import { KpPaginationComponent } from '@kanso-protocol/ui/pagination';
import { KpTableComponent, KpTableColumn } from '@kanso-protocol/ui/table';
import { KpSelectComponent, KpSelectOption } from '@kanso-protocol/ui/select';
import { KpDropdownMenuComponent, KpMenuItemComponent, KpMenuDividerComponent } from '@kanso-protocol/ui/menu';

/**
 * Foundations / Theme Editor
 *
 * Generate a custom Kanso theme by recoloring the brand ramp (every
 * semantic token aliases the `blue` accent ramp via `var()`, so changing
 * the 11 brand stops cascades to all ~114 brand-derived tokens with no
 * rebuild), or hand-tune any stop of any ramp. Edits apply live to the
 * preview on the right, in light and dark independently. Export the result
 * as a CSS override block (load after tokens.css) or DTCG JSON.
 *
 * This is the same color math as `scripts/generate-brand-theme.js`, ported
 * to the browser — the brand swap keeps each stop's lightness + saturation
 * and only rotates the hue, so WCAG-AA contrast relationships are preserved.
 */

// ─── color math (ported from scripts/generate-brand-theme.js) ──────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').trim();
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)].map(
    (v) => Math.round(v * 255),
  ) as [number, number, number];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

/** Normalize any computed CSS color (hex or rgb()) to lowercase #rrggbb. */
function normalizeHex(css: string): string | null {
  const v = css.trim();
  if (!v) return null;
  if (v.startsWith('#')) {
    const h = v.slice(1);
    if (h.length === 3) return '#' + h.split('').map((c) => c + c).join('').toLowerCase();
    if (h.length === 6 || h.length === 8) return '#' + h.slice(0, 6).toLowerCase();
    return null;
  }
  const m = v.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const parts = m[1].split(/[,\s/]+/).map(Number);
    if (parts.length >= 3) return rgbToHex([parts[0], parts[1], parts[2]]);
  }
  return null;
}

// ─── ramp model ────────────────────────────────────────────────────────────

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];
const STOPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const RAMPS: { key: string; label: string }[] = [
  { key: 'blue', label: 'Accent / brand' },
  { key: 'gray', label: 'Neutral' },
  { key: 'red', label: 'Danger' },
  { key: 'green', label: 'Success' },
  { key: 'amber', label: 'Warning' },
  { key: 'cyan', label: 'Info' },
];

type RampMap = Record<string, Record<string, string>>;     // ramp → stop → hex
type Model = Record<Mode, RampMap>;

/** Read a mode's ramp values live via a hidden probe (so we never hardcode). */
function readModel(): Model {
  const out = { light: {}, dark: {} } as Model;
  for (const mode of MODES) {
    const probe = document.createElement('div');
    if (mode === 'dark') probe.setAttribute('data-theme', 'dark');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    for (const { key } of RAMPS) {
      out[mode][key] = {};
      for (const stop of STOPS) {
        const hex = normalizeHex(cs.getPropertyValue(`--kp-color-${key}-${stop}`));
        if (hex) out[mode][key][stop] = hex;
      }
    }
    probe.remove();
  }
  return out;
}

function cloneModel(m: Model): Model {
  return JSON.parse(JSON.stringify(m));
}

@Component({
  selector: 'kp-theme-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    KpButtonComponent,
    KpBadgeComponent,
    KpAlertComponent,
    KpInputComponent,
    KpCheckboxComponent,
    KpToggleComponent,
    KpNumberStepperComponent,
    KpPaginationComponent,
    KpTableComponent,
    KpSelectComponent,
    KpDropdownMenuComponent,
    KpMenuItemComponent,
    KpMenuDividerComponent,
  ],
  template: `
    <div class="te">
      <!-- ── controls ───────────────────────────────────────────── -->
      <div class="te__panel">
        <div class="te__row te__row--top">
          <h2 class="te__title">Theme Editor</h2>
          <div class="te__modes" role="group" aria-label="Theme mode">
            @for (m of modes; track m) {
              <button
                type="button"
                class="te__mode"
                [class.te__mode--on]="mode() === m"
                [attr.aria-pressed]="mode() === m"
                (click)="setMode(m)">{{ m }}</button>
            }
          </div>
        </div>

        <div class="te__brand">
          <label class="te__brand-label" for="te-brand">Brand color</label>
          <input id="te-brand" type="color" class="te__brand-swatch" aria-label="Brand color picker"
                 [value]="brand()" (input)="onBrand($any($event.target).value)"/>
          <kp-input class="te__brand-hex" size="sm" [showClear]="false" ariaLabel="Brand color hex"
                    [value]="brand()" (input)="onBrand($any($event.target).value)"/>
          <button kpButton variant="default" color="primary" size="sm" (click)="applyBrand()">Recolor brand</button>
          <span class="te__hint">rotates the accent ramp hue — light + dark</span>
          <button kpButton variant="subtle" color="neutral" size="sm" class="te__reset" (click)="reset()">Reset</button>
        </div>

        <p class="te__section">Ramps — {{ mode() }} (click a swatch to edit)</p>
        <div class="te__ramps">
          @for (ramp of ramps; track ramp.key) {
            <div class="te__ramp">
              <span class="te__ramp-name">{{ ramp.label }}</span>
              <div class="te__stops">
                @for (stop of stops; track stop) {
                  <label class="te__stop" [title]="ramp.key + '-' + stop + ': ' + value(ramp.key, stop)">
                    <input type="color" class="te__stop-input"
                           [value]="value(ramp.key, stop)"
                           (input)="onStop(ramp.key, stop, $any($event.target).value)"/>
                    <span class="te__stop-chip" [style.background]="value(ramp.key, stop)"></span>
                    <span class="te__stop-num">{{ stop }}</span>
                  </label>
                }
              </div>
            </div>
          }
        </div>

        <div class="te__row te__actions">
          <button kpButton variant="subtle" color="neutral" size="sm" (click)="copy('css')">Copy CSS</button>
          <button kpButton variant="subtle" color="neutral" size="sm" (click)="download('css')">Download .css</button>
          <button kpButton variant="subtle" color="neutral" size="sm" (click)="copy('json')">Copy JSON</button>
          <button kpButton variant="subtle" color="neutral" size="sm" (click)="download('json')">Download .json</button>
        </div>
        <span class="te__status" aria-live="polite">{{ status() }}</span>
      </div>

      <!-- ── live preview ───────────────────────────────────────── -->
      <div class="te__preview">
        <p class="te__section">Live preview — {{ mode() }}</p>
        <div class="te__pv">
            <!-- narrow form: input + select + stepper grouped -->
            <form class="te__pv-form" (submit)="$event.preventDefault()">
              <span class="te__pv-h">Form</span>
              <kp-input placeholder="Your name" ariaLabel="Your name"/>
              <kp-select placeholder="Pick one" [options]="selectOptions" label="Status" [floatingLabel]="true"/>
              <kp-number-stepper [min]="0" [max]="10" suffix=" pt" ariaLabel="Amount"/>
              <div class="te__pv-wrap">
                <kp-checkbox [checked]="true">Remember me</kp-checkbox>
                <kp-toggle [on]="true" ariaLabel="Notifications"/>
              </div>
              <button kpButton variant="default" color="primary">Submit</button>
            </form>

            <!-- buttons + badges + pagination spread across the rest -->
            <section class="te__pv-cell te__pv-cell--wide">
              <span class="te__pv-h">Actions</span>
              <div class="te__pv-wrap">
                <button kpButton variant="default" color="primary">Primary</button>
                <button kpButton variant="outline" color="primary">Outline</button>
                <button kpButton variant="ghost" color="primary">Ghost</button>
                <button kpButton variant="default" color="danger">Danger</button>
                <button kpButton variant="default" color="neutral">Neutral</button>
              </div>
              <div class="te__pv-wrap">
                <kp-badge color="primary">Primary</kp-badge>
                <kp-badge color="success" appearance="subtle">Success</kp-badge>
                <kp-badge color="warning" appearance="subtle">Warning</kp-badge>
                <kp-badge color="danger">Danger</kp-badge>
                <kp-badge color="primary" [counter]="5">Inbox</kp-badge>
                <kp-badge color="danger" [count]="true">9</kp-badge>
              </div>
              <kp-pagination [currentPage]="2" [totalPages]="6"/>
            </section>

            <!-- menu -->
            <section class="te__pv-cell">
              <span class="te__pv-h">Menu</span>
              <kp-dropdown-menu>
                <kp-menu-item label="Profile" [selected]="true"></kp-menu-item>
                <kp-menu-item label="Settings"></kp-menu-item>
                <kp-menu-divider></kp-menu-divider>
                <kp-menu-item label="Sign out"></kp-menu-item>
              </kp-dropdown-menu>
            </section>

            <!-- table spans wide -->
            <section class="te__pv-cell te__pv-cell--wide">
              <span class="te__pv-h">Table</span>
              <kp-table
                [columns]="tableColumns"
                [data]="tableData"
                [selectable]="true"
                [(selected)]="tableSelected"
                size="sm"/>
            </section>

            <!-- alerts span full width, 3 across -->
            <section class="te__pv-alerts">
              <kp-alert color="primary" appearance="subtle" title="Heads up" description="Primary accent alert."/>
              <kp-alert color="success" appearance="subtle" title="Saved" description="Everything looks good."/>
              <kp-alert color="danger" appearance="subtle" title="Error" description="Something went wrong."/>
            </section>
          </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: var(--kp-font-family-sans, system-ui, sans-serif); }
    /* Single column — editor on top, examples below. Storybook's canvas is
       narrow, so stacking reads better than a side-by-side split. */
    .te { display: flex; flex-direction: column; gap: 20px; padding: 16px; }

    .te__panel, .te__preview {
      border: 1px solid var(--kp-color-border-subtle);
      border-radius: 12px;
      padding: 16px;
      background: var(--kp-color-surface-base);
    }
    .te__row { display: flex; align-items: center; gap: 12px; }
    .te__row--top { justify-content: space-between; margin-bottom: 16px; }
    .te__title { margin: 0; font-size: 16px; font-weight: 600; color: var(--kp-color-text-strong); }

    .te__modes { display: inline-flex; gap: 4px; padding: 2px; border-radius: 8px; background: var(--kp-color-surface-muted); }
    .te__mode {
      all: unset; cursor: pointer; padding: 4px 12px; border-radius: 6px; font-size: 13px; text-transform: capitalize;
      color: var(--kp-color-text-default);
    }
    .te__mode--on { background: var(--kp-color-surface-base); color: var(--kp-color-text-strong); box-shadow: var(--kp-elevation-overlay); }

    .te__brand { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 12px; border-radius: 8px; background: var(--kp-color-surface-subtle); margin-bottom: 16px; }
    .te__brand-label { font-size: 13px; color: var(--kp-color-text-default); }
    /* match the kp-input border token so the swatch reads like a Kanso field */
    .te__brand-swatch { width: 36px; height: 28px; border: 1px solid var(--kp-color-input-border-rest); border-radius: 6px; background: none; cursor: pointer; padding: 0; }
    .te__brand-hex { width: 120px; }
    .te__hint { font-size: 11px; color: var(--kp-color-text-muted); }

    .te__section { margin: 0 0 8px; font-size: 12px; font-weight: 600; color: var(--kp-color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }

    .te__ramps { display: flex; flex-direction: column; gap: 10px; }
    .te__ramp { display: grid; grid-template-columns: 96px 1fr; align-items: center; gap: 10px; }
    .te__ramp-name { font-size: 12px; color: var(--kp-color-text-default); }
    .te__stops { display: grid; grid-template-columns: repeat(11, 1fr); gap: 3px; }
    .te__stop { position: relative; display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; }
    .te__stop-input { position: absolute; inset: 0; width: 100%; height: 22px; opacity: 0; cursor: pointer; }
    .te__stop-chip { width: 100%; height: 22px; border-radius: 4px; border: 1px solid var(--kp-color-overlay-hover-medium); }
    .te__stop-num { font-size: 9px; color: var(--kp-color-text-muted); font-variant-numeric: tabular-nums; }

    .te__actions { flex-wrap: wrap; margin-top: 16px; }
    /* Buttons are real kp-button instances (primary = Recolor, subtle/neutral
       = secondary for copy/download/reset) so their colors + borders track the
       Kanso tokens in both themes. Reset just gets pushed to the right. */
    .te__reset { margin-inline-start: auto; }
    .te__status { display: block; margin-top: 8px; font-size: 12px; color: var(--kp-color-text-muted); min-height: 16px; }

    /* Distribute previews across the full width. The input/select/stepper
       form is one narrow cell; everything else spreads via auto-fit. */
    .te__pv { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; align-items: start; }
    .te__pv-cell, .te__pv-form { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
    .te__pv-form { max-width: 280px; }
    .te__pv-cell--wide { grid-column: span 2; }
    .te__pv-alerts { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; }
    .te__pv-h { font-size: 11px; font-weight: 600; color: var(--kp-color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .te__pv-wrap { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .te__pv kp-table { width: 100%; }
    @media (max-width: 720px) { .te__pv-cell--wide { grid-column: auto; } }
  `],
})
export class KpThemeEditorComponent implements OnDestroy {
  readonly modes = MODES;
  readonly ramps = RAMPS;
  readonly stops = STOPS;

  // ── preview-only sample data ──────────────────────────────────────────
  readonly selectOptions: KpSelectOption[] = [
    { value: 'a', label: 'Active' },
    { value: 'p', label: 'Pending' },
    { value: 'd', label: 'Done' },
  ];
  readonly tableColumns: KpTableColumn<{ name: string; role: string; status: string }>[] = [
    { id: 'name', label: 'Name', accessor: (r) => r.name },
    { id: 'role', label: 'Role', accessor: (r) => r.role },
    { id: 'status', label: 'Status', accessor: (r) => r.status },
  ];
  readonly tableData = [
    { name: 'Greg Black', role: 'Admin', status: 'Active' },
    { name: 'Dana Lee', role: 'Editor', status: 'Pending' },
    { name: 'Sam Park', role: 'Viewer', status: 'Active' },
  ];
  tableSelected: unknown[] = [this.tableData[0]];

  private readonly base = readModel();
  readonly model = signal<Model>(cloneModel(this.base));
  readonly mode = signal<Mode>(
    (document.documentElement.getAttribute('data-theme') as Mode) || 'light',
  );
  readonly brand = signal<string>(this.base.light.blue['500'] || '#2563eb');
  readonly status = signal<string>('');

  /** CSS override text (only stops that differ from the base), per mode. */
  readonly css = computed(() => this.buildCss(this.model()));
  private styleEl: HTMLStyleElement | null = null;

  constructor() {
    // Apply the live overrides whenever the model changes.
    effect(() => {
      const text = this.css();
      if (!this.styleEl) {
        this.styleEl = document.createElement('style');
        this.styleEl.id = 'kp-theme-editor-overrides';
        document.head.appendChild(this.styleEl);
      }
      this.styleEl.textContent = text;
    });
  }

  ngOnDestroy(): void {
    this.styleEl?.remove();
  }

  value(ramp: string, stop: string): string {
    return this.model()[this.mode()][ramp]?.[stop] || '#000000';
  }

  setMode(m: Mode): void {
    this.mode.set(m);
    document.documentElement.setAttribute('data-theme', m);
    document.body.setAttribute('data-theme', m);
    // Brand is global (applies to both modes), so it stays as the user chose
    // it — don't reset it to the per-mode stop on switch.
  }

  onBrand(hex: string): void {
    const norm = normalizeHex(hex);
    if (norm) this.brand.set(norm);
  }

  /**
   * Rotate the accent ramp to the brand hue for BOTH light and dark at once —
   * a brand is one identity, so recoloring should hit both themes. Each mode
   * keeps its own stops' lightness + saturation (so dark stays dark-tuned) and
   * only the hue is swapped.
   */
  applyBrand(): void {
    const norm = normalizeHex(this.brand());
    if (!norm) { this.status.set('Invalid brand hex'); return; }
    const [hue] = rgbToHsl(hexToRgb(norm));
    const next = cloneModel(this.model());
    for (const mode of MODES) {
      for (const stop of STOPS) {
        const refHex = this.base[mode].blue[stop];
        if (!refHex) continue;
        const [, s, l] = rgbToHsl(hexToRgb(refHex));
        next[mode].blue[stop] = rgbToHex(hslToRgb(hue, s, l));
      }
    }
    this.model.set(next);
    this.status.set(`Accent recolored to ${norm} (light + dark)`);
  }

  onStop(ramp: string, stop: string, hex: string): void {
    const norm = normalizeHex(hex);
    if (!norm) return;
    const next = cloneModel(this.model());
    next[this.mode()][ramp][stop] = norm;
    this.model.set(next);
  }

  reset(): void {
    this.model.set(cloneModel(this.base));
    this.brand.set(this.base[this.mode()].blue['500'] || '#2563eb');
    this.status.set('Reset to defaults');
  }

  // ── export ────────────────────────────────────────────────────────────

  private diffs(model: Model, mode: Mode): [string, string, string][] {
    const out: [string, string, string][] = [];
    for (const { key } of RAMPS) {
      for (const stop of STOPS) {
        const v = model[mode][key]?.[stop];
        if (v && v !== this.base[mode][key]?.[stop]) out.push([key, stop, v]);
      }
    }
    return out;
  }

  private buildCss(model: Model): string {
    const block = (mode: Mode, selector: string): string => {
      const d = this.diffs(model, mode);
      if (!d.length) return '';
      const body = d.map(([k, s, v]) => `  --kp-color-${k}-${s}: ${v};`).join('\n');
      return `${selector} {\n${body}\n}`;
    };
    // Match the base token selectors' specificity (tokens.css uses
    // `:root[data-theme="light"]` = (0,2,0); a bare `:root` (0,1,0) would
    // lose to it). Same selector list + appended later → our overrides win.
    const light = block('light', ':root,\n:root[data-theme="light"],\n[data-theme="light"]');
    const dark = block('dark', ':root[data-theme="dark"],\n[data-theme="dark"]');
    return [light, dark].filter(Boolean).join('\n\n');
  }

  private buildJson(model: Model): string {
    const tree = (mode: Mode) => {
      const color: Record<string, Record<string, { $value: string }>> = {};
      for (const [k, s, v] of this.diffs(model, mode)) {
        (color[k] ??= {})[s] = { $value: v };
      }
      return { color };
    };
    return JSON.stringify(
      {
        $description: 'Kanso custom theme — generated by the Storybook Theme Editor.',
        light: tree('light'),
        dark: tree('dark'),
      },
      null,
      2,
    );
  }

  private payload(kind: 'css' | 'json'): string {
    if (kind === 'json') return this.buildJson(this.model());
    const header =
      '/* Kanso custom theme — generated by the Storybook Theme Editor.\n' +
      ' * Load after @kanso-protocol/ui/styles/tokens.css. The accent swap keeps\n' +
      ' * each stop\'s lightness + saturation, so AA relationships hold; re-verify\n' +
      ' * contrast for custom hand-tuned values. */\n';
    const body = this.buildCss(this.model());
    return body ? header + body + '\n' : header + '/* no changes from defaults */\n';
  }

  copy(kind: 'css' | 'json'): void {
    const text = this.payload(kind);
    navigator.clipboard?.writeText(text).then(
      () => this.status.set(`${kind.toUpperCase()} copied to clipboard`),
      () => this.status.set('Clipboard blocked — use Download'),
    );
  }

  download(kind: 'css' | 'json'): void {
    const text = this.payload(kind);
    const blob = new Blob([text], { type: kind === 'json' ? 'application/json' : 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = kind === 'json' ? 'kanso-theme.json' : 'kanso-theme.css';
    a.click();
    URL.revokeObjectURL(url);
    this.status.set(`Downloaded kanso-theme.${kind}`);
  }
}

const meta: Meta<KpThemeEditorComponent> = {
  title: 'Foundations/Theme Editor',
  component: KpThemeEditorComponent,
  // Opt out of the global autodocs: this is an interactive tool, so the
  // single fullscreen story IS the page. Autodocs would add a redundant
  // "Docs" entry + a "STORIES" subgroup that just re-render the editor.
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    // Dynamic color-picker tool — exclude from visual-regression snapshots.
    chromatic: { disable: true },
  },
};
export default meta;

type Story = StoryObj<KpThemeEditorComponent>;

export const Editor: Story = {};
