import {
  Component,
  Input,
  ChangeDetectionStrategy,
  booleanAttribute,
} from '@angular/core';

import { KpSize, KpVariant, KpState } from '@kanso-protocol/ui';

/**
 * Subset of KpColorRole that kp-button actually paints. Buttons style
 * only the three semantic-action colors; success/warning/info live on
 * Badge / Alert / Avatar where every role is rendered. Restricting the
 * type here surfaces unsupported colors at compile time instead of
 * silently rendering as default ghost.
 */
export type KpButtonColor = 'primary' | 'danger' | 'neutral';

/**
 * Kanso Protocol — Button
 *
 * Attribute-selector on a real native `<button>`. Gets `type` / `form` /
 * `name` / `value` / `formaction` / native disabled / Enter+Space /
 * form submission / HTML5 validation for free.
 *
 * @example
 * <button kpButton size="md" variant="default" color="primary">Click me</button>
 * <button kpButton type="submit" color="primary">Save</button>
 * <button kpButton variant="outline" color="danger" [loading]="true">Delete</button>
 */
@Component({
  selector: 'button[kpButton]',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
    '[attr.type]': 'type',
    /* forceState === 'disabled' also flips the real [disabled] attribute,
       not just the CSS class. Storybook stories that use forceState to
       demonstrate the disabled appearance otherwise leave the button
       interactive — and axe-core's color-contrast exemption only applies
       to actually-disabled form controls, so the visual disabled fg
       (gray.500/zinc-600) would get flagged as a contrast violation. */
    '[disabled]': 'disabled || loading || forceState === "disabled"',
    '[attr.aria-busy]': 'loading || null',
  },
  template: `
    <span class="kp-button__content">
      @if (loading || forceState === 'loading') {
        <span class="kp-button__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </span>
      }

      @if (!loading && forceState !== 'loading') {
        <span class="kp-button__icon" aria-hidden="true">
          <ng-content select="[kpButtonIconLeft]"/>
        </span>
      }

      @if (!iconOnly) {
        <span class="kp-button__label" [class.kp-button__label--hidden]="loading || forceState === 'loading'">
          <ng-content/>
        </span>
      }

      @if (!loading && forceState !== 'loading') {
        <span class="kp-button__icon" aria-hidden="true">
          <ng-content select="[kpButtonIconRight]"/>
        </span>
      }
    </span>
    `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border: 1px solid var(--kp-button-border);
      border-radius: var(--kp-button-radius);
      background: var(--kp-button-bg);
      color: var(--kp-button-fg);
      height: var(--kp-button-height);
      min-width: var(--kp-button-height);
      padding: 0 var(--kp-button-padding);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      font-weight: var(--kp-button-font-weight, 400);
      font-size: var(--kp-button-font-size);
      line-height: var(--kp-button-line-height);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      /* Native button defaults override */
      appearance: none;
      -webkit-appearance: none;
      transition:
        background var(--kp-motion-duration-fast, 100ms) var(--kp-motion-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1)),
        border-color var(--kp-motion-duration-fast, 100ms) var(--kp-motion-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1)),
        color var(--kp-motion-duration-fast, 100ms) var(--kp-motion-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
    }

    /* --- Interactive states --- */
    :host(:hover:not([disabled]):not(.kp-button--loading)),
    :host(.kp-button--hover) {
      background: var(--kp-button-bg-hover);
      border-color: var(--kp-button-border-hover);
      color: var(--kp-button-fg-hover);
    }

    :host(:active:not([disabled]):not(.kp-button--loading)),
    :host(.kp-button--active) {
      background: var(--kp-button-bg-active);
      border-color: var(--kp-button-border-active);
      color: var(--kp-button-fg-active);
    }

    :host(:focus-visible),
    :host(.kp-button--focus) {
      outline: var(--kp-focus-ring-width) solid var(--kp-color-focus-ring);
      outline-offset: var(--kp-focus-ring-offset);
    }

    :host([disabled]),
    :host(.kp-button--disabled) {
      cursor: not-allowed;
      pointer-events: none;
    }

    :host(.kp-button--loading) {
      cursor: default;
      pointer-events: none;
    }

    /* --- Content --- */
    .kp-button__content {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--kp-button-gap);
    }

    .kp-button__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .kp-button__icon ::ng-deep svg,
    .kp-button__spinner svg {
      width: var(--kp-button-icon-size);
      height: var(--kp-button-icon-size);
    }

    .kp-button__icon:empty { display: none; }

    .kp-button__label {
      display: inline-flex;
      align-items: center;
    }

    /* Loading: hide label visually but keep accessible name. */
    .kp-button__label--hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .kp-button__spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      animation: kp-spin var(--kp-motion-duration-spin) linear infinite;
    }

    @keyframes kp-spin { to { transform: rotate(360deg); } }

    @media (prefers-reduced-motion: reduce) {
      .kp-button__spinner { animation-duration: 3s; }
    }

    /* === SIZE TOKENS === */
    :host(.kp-button--xs) {
      --kp-button-height: 24px; --kp-button-radius: 8px; --kp-button-padding: 6px;
      --kp-button-font-size: 12px; --kp-button-line-height: 1.333;
      --kp-button-font-weight: 400; --kp-button-gap: 4px;
      --kp-button-icon-size: 14px;
    }
    :host(.kp-button--sm) {
      --kp-button-height: 28px; --kp-button-radius: 10px; --kp-button-padding: 8px;
      --kp-button-font-size: 14px; --kp-button-line-height: 1.428;
      --kp-button-font-weight: 400; --kp-button-gap: 5px;
      --kp-button-icon-size: 16px;
    }
    :host(.kp-button--md) {
      --kp-button-height: 36px; --kp-button-radius: 12px; --kp-button-padding: 12px;
      --kp-button-font-size: 16px; --kp-button-line-height: 1.5;
      --kp-button-font-weight: 400; --kp-button-gap: 6px;
      --kp-button-icon-size: 18px;
    }
    :host(.kp-button--lg) {
      --kp-button-height: 44px; --kp-button-radius: 14px; --kp-button-padding: 14px;
      --kp-button-font-size: 16px; --kp-button-line-height: 1.5;
      --kp-button-font-weight: 400; --kp-button-gap: 8px;
      --kp-button-icon-size: 22px;
    }
    :host(.kp-button--xl) {
      --kp-button-height: 52px; --kp-button-radius: 16px; --kp-button-padding: 16px;
      --kp-button-font-size: 20px; --kp-button-line-height: 1.4;
      --kp-button-font-weight: 500; --kp-button-gap: 8px;
      --kp-button-icon-size: 24px;
    }

    :host(.kp-button--icon-only) {
      width: var(--kp-button-height);
      min-width: var(--kp-button-height);
      padding: 0;
    }

    /* === PRIMARY DEFAULT === */
    :host(.kp-button--primary.kp-button--default) {
      --kp-button-bg: var(--kp-color-primary-default-bg-rest);
      --kp-button-bg-hover: var(--kp-color-primary-default-bg-hover);
      --kp-button-bg-active: var(--kp-color-primary-default-bg-active);
      --kp-button-fg: var(--kp-color-primary-default-fg-rest);
      --kp-button-fg-hover: var(--kp-color-primary-default-fg-hover);
      --kp-button-fg-active: var(--kp-color-primary-default-fg-active);
      --kp-button-border: var(--kp-color-primary-default-border-rest);
      --kp-button-border-hover: var(--kp-color-primary-default-border-hover);
      --kp-button-border-active: var(--kp-color-primary-default-border-active);
    }
    :host(.kp-button--primary.kp-button--default[disabled]),
    :host(.kp-button--primary.kp-button--default.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-primary-default-bg-disabled);
      --kp-button-fg: var(--kp-color-primary-default-fg-disabled);
      --kp-button-border: var(--kp-color-primary-default-border-disabled);
    }
    :host(.kp-button--primary.kp-button--default.kp-button--loading) {
      --kp-button-bg: var(--kp-color-primary-default-bg-loading);
      --kp-button-fg: var(--kp-color-primary-default-fg-loading);
      --kp-button-border: var(--kp-color-primary-default-border-loading);
    }

    /* === PRIMARY SUBTLE === */
    :host(.kp-button--primary.kp-button--subtle) {
      --kp-button-bg: var(--kp-color-primary-subtle-bg-rest);
      --kp-button-bg-hover: var(--kp-color-primary-subtle-bg-hover);
      --kp-button-bg-active: var(--kp-color-primary-subtle-bg-active);
      --kp-button-fg: var(--kp-color-primary-subtle-fg-rest);
      --kp-button-fg-hover: var(--kp-color-primary-subtle-fg-hover);
      --kp-button-fg-active: var(--kp-color-primary-subtle-fg-active);
      --kp-button-border: var(--kp-color-primary-subtle-border-rest);
      --kp-button-border-hover: var(--kp-color-primary-subtle-border-hover);
      --kp-button-border-active: var(--kp-color-primary-subtle-border-active);
    }
    :host(.kp-button--primary.kp-button--subtle[disabled]),
    :host(.kp-button--primary.kp-button--subtle.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-primary-subtle-bg-disabled);
      --kp-button-fg: var(--kp-color-primary-subtle-fg-disabled);
      --kp-button-border: var(--kp-color-primary-subtle-border-disabled);
    }

    /* === PRIMARY OUTLINE === */
    :host(.kp-button--primary.kp-button--outline) {
      --kp-button-bg: var(--kp-color-primary-outline-bg-rest);
      --kp-button-bg-hover: var(--kp-color-primary-outline-bg-hover);
      --kp-button-bg-active: var(--kp-color-primary-outline-bg-active);
      --kp-button-fg: var(--kp-color-primary-outline-fg-rest);
      --kp-button-fg-hover: var(--kp-color-primary-outline-fg-hover);
      --kp-button-fg-active: var(--kp-color-primary-outline-fg-active);
      --kp-button-border: var(--kp-color-primary-outline-border-rest);
      --kp-button-border-hover: var(--kp-color-primary-outline-border-hover);
      --kp-button-border-active: var(--kp-color-primary-outline-border-active);
    }
    :host(.kp-button--primary.kp-button--outline[disabled]),
    :host(.kp-button--primary.kp-button--outline.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-primary-outline-bg-disabled);
      --kp-button-fg: var(--kp-color-primary-outline-fg-disabled);
      --kp-button-border: var(--kp-color-primary-outline-border-disabled);
    }

    /* === PRIMARY GHOST === */
    :host(.kp-button--primary.kp-button--ghost) {
      --kp-button-bg: var(--kp-color-primary-ghost-bg-rest);
      --kp-button-bg-hover: var(--kp-color-primary-ghost-bg-hover);
      --kp-button-bg-active: var(--kp-color-primary-ghost-bg-active);
      --kp-button-fg: var(--kp-color-primary-ghost-fg-rest);
      --kp-button-fg-hover: var(--kp-color-primary-ghost-fg-hover);
      --kp-button-fg-active: var(--kp-color-primary-ghost-fg-active);
      --kp-button-border: var(--kp-color-primary-ghost-border-rest);
      --kp-button-border-hover: var(--kp-color-primary-ghost-border-hover);
      --kp-button-border-active: var(--kp-color-primary-ghost-border-active);
    }
    :host(.kp-button--primary.kp-button--ghost[disabled]),
    :host(.kp-button--primary.kp-button--ghost.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-primary-ghost-bg-disabled);
      --kp-button-fg: var(--kp-color-primary-ghost-fg-disabled);
      --kp-button-border: var(--kp-color-primary-ghost-border-disabled);
    }

    /* === DANGER DEFAULT === */
    :host(.kp-button--danger.kp-button--default) {
      --kp-button-bg: var(--kp-color-danger-default-bg-rest);
      --kp-button-bg-hover: var(--kp-color-danger-default-bg-hover);
      --kp-button-bg-active: var(--kp-color-danger-default-bg-active);
      --kp-button-fg: var(--kp-color-danger-default-fg-rest);
      --kp-button-fg-hover: var(--kp-color-danger-default-fg-hover);
      --kp-button-fg-active: var(--kp-color-danger-default-fg-active);
      --kp-button-border: var(--kp-color-danger-default-border-rest);
      --kp-button-border-hover: var(--kp-color-danger-default-border-hover);
      --kp-button-border-active: var(--kp-color-danger-default-border-active);
    }
    :host(.kp-button--danger.kp-button--default[disabled]),
    :host(.kp-button--danger.kp-button--default.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-danger-default-bg-disabled);
      --kp-button-fg: var(--kp-color-danger-default-fg-disabled);
      --kp-button-border: var(--kp-color-danger-default-border-disabled);
    }
    :host(.kp-button--danger.kp-button--default.kp-button--loading) {
      --kp-button-bg: var(--kp-color-danger-default-bg-loading);
      --kp-button-fg: var(--kp-color-danger-default-fg-loading);
      --kp-button-border: var(--kp-color-danger-default-border-loading);
    }

    /* === DANGER SUBTLE === */
    :host(.kp-button--danger.kp-button--subtle) {
      --kp-button-bg: var(--kp-color-danger-subtle-bg-rest);
      --kp-button-bg-hover: var(--kp-color-danger-subtle-bg-hover);
      --kp-button-bg-active: var(--kp-color-danger-subtle-bg-active);
      --kp-button-fg: var(--kp-color-danger-subtle-fg-rest);
      --kp-button-fg-hover: var(--kp-color-danger-subtle-fg-hover);
      --kp-button-fg-active: var(--kp-color-danger-subtle-fg-active);
      --kp-button-border: var(--kp-color-danger-subtle-border-rest);
      --kp-button-border-hover: var(--kp-color-danger-subtle-border-hover);
      --kp-button-border-active: var(--kp-color-danger-subtle-border-active);
    }

    /* === DANGER OUTLINE === */
    :host(.kp-button--danger.kp-button--outline) {
      --kp-button-bg: var(--kp-color-danger-outline-bg-rest);
      --kp-button-bg-hover: var(--kp-color-danger-outline-bg-hover);
      --kp-button-bg-active: var(--kp-color-danger-outline-bg-active);
      --kp-button-fg: var(--kp-color-danger-outline-fg-rest);
      --kp-button-fg-hover: var(--kp-color-danger-outline-fg-hover);
      --kp-button-fg-active: var(--kp-color-danger-outline-fg-active);
      --kp-button-border: var(--kp-color-danger-outline-border-rest);
      --kp-button-border-hover: var(--kp-color-danger-outline-border-hover);
      --kp-button-border-active: var(--kp-color-danger-outline-border-active);
    }

    /* === DANGER GHOST === */
    :host(.kp-button--danger.kp-button--ghost) {
      --kp-button-bg: var(--kp-color-danger-ghost-bg-rest);
      --kp-button-bg-hover: var(--kp-color-danger-ghost-bg-hover);
      --kp-button-bg-active: var(--kp-color-danger-ghost-bg-active);
      --kp-button-fg: var(--kp-color-danger-ghost-fg-rest);
      --kp-button-fg-hover: var(--kp-color-danger-ghost-fg-hover);
      --kp-button-fg-active: var(--kp-color-danger-ghost-fg-active);
      --kp-button-border: var(--kp-color-danger-ghost-border-rest);
      --kp-button-border-hover: var(--kp-color-danger-ghost-border-hover);
      --kp-button-border-active: var(--kp-color-danger-ghost-border-active);
    }

    /* === NEUTRAL DEFAULT === */
    :host(.kp-button--neutral.kp-button--default) {
      --kp-button-bg: var(--kp-color-neutral-default-bg-rest);
      --kp-button-bg-hover: var(--kp-color-neutral-default-bg-hover);
      --kp-button-bg-active: var(--kp-color-neutral-default-bg-active);
      --kp-button-fg: var(--kp-color-neutral-default-fg-rest);
      --kp-button-fg-hover: var(--kp-color-neutral-default-fg-hover);
      --kp-button-fg-active: var(--kp-color-neutral-default-fg-active);
      --kp-button-border: var(--kp-color-neutral-default-border-rest);
      --kp-button-border-hover: var(--kp-color-neutral-default-border-hover);
      --kp-button-border-active: var(--kp-color-neutral-default-border-active);
    }
    :host(.kp-button--neutral.kp-button--default[disabled]),
    :host(.kp-button--neutral.kp-button--default.kp-button--disabled) {
      --kp-button-bg: var(--kp-color-neutral-default-bg-disabled);
      --kp-button-fg: var(--kp-color-neutral-default-fg-disabled);
      --kp-button-border: var(--kp-color-neutral-default-border-disabled);
    }
    :host(.kp-button--neutral.kp-button--default.kp-button--loading) {
      --kp-button-bg: var(--kp-color-neutral-default-bg-loading);
      --kp-button-fg: var(--kp-color-neutral-default-fg-loading);
      --kp-button-border: var(--kp-color-neutral-default-border-loading);
    }

    /* === NEUTRAL SUBTLE === */
    :host(.kp-button--neutral.kp-button--subtle) {
      --kp-button-bg: var(--kp-color-neutral-subtle-bg-rest);
      --kp-button-bg-hover: var(--kp-color-neutral-subtle-bg-hover);
      --kp-button-bg-active: var(--kp-color-neutral-subtle-bg-active);
      --kp-button-fg: var(--kp-color-neutral-subtle-fg-rest);
      --kp-button-fg-hover: var(--kp-color-neutral-subtle-fg-hover);
      --kp-button-fg-active: var(--kp-color-neutral-subtle-fg-active);
      --kp-button-border: var(--kp-color-neutral-subtle-border-rest);
      --kp-button-border-hover: var(--kp-color-neutral-subtle-border-hover);
      --kp-button-border-active: var(--kp-color-neutral-subtle-border-active);
    }

    /* === NEUTRAL OUTLINE === */
    :host(.kp-button--neutral.kp-button--outline) {
      --kp-button-bg: var(--kp-color-neutral-outline-bg-rest);
      --kp-button-bg-hover: var(--kp-color-neutral-outline-bg-hover);
      --kp-button-bg-active: var(--kp-color-neutral-outline-bg-active);
      --kp-button-fg: var(--kp-color-neutral-outline-fg-rest);
      --kp-button-fg-hover: var(--kp-color-neutral-outline-fg-hover);
      --kp-button-fg-active: var(--kp-color-neutral-outline-fg-active);
      --kp-button-border: var(--kp-color-neutral-outline-border-rest);
      --kp-button-border-hover: var(--kp-color-neutral-outline-border-hover);
      --kp-button-border-active: var(--kp-color-neutral-outline-border-active);
    }

    /* === NEUTRAL GHOST === */
    :host(.kp-button--neutral.kp-button--ghost) {
      --kp-button-bg: var(--kp-color-neutral-ghost-bg-rest);
      --kp-button-bg-hover: var(--kp-color-neutral-ghost-bg-hover);
      --kp-button-bg-active: var(--kp-color-neutral-ghost-bg-active);
      --kp-button-fg: var(--kp-color-neutral-ghost-fg-rest);
      --kp-button-fg-hover: var(--kp-color-neutral-ghost-fg-hover);
      --kp-button-fg-active: var(--kp-color-neutral-ghost-fg-active);
      --kp-button-border: var(--kp-color-neutral-ghost-border-rest);
      --kp-button-border-hover: var(--kp-color-neutral-ghost-border-hover);
      --kp-button-border-active: var(--kp-color-neutral-ghost-border-active);
    }

    /* Generic disabled fallbacks (catch combos lacking an explicit color-variant rule) */
    :host([disabled].kp-button--default),
    :host(.kp-button--disabled.kp-button--default) {
      --kp-button-bg: var(--kp-color-primary-default-bg-disabled);
      --kp-button-bg-hover: var(--kp-color-primary-default-bg-disabled);
      --kp-button-bg-active: var(--kp-color-primary-default-bg-disabled);
      --kp-button-border: var(--kp-color-primary-default-border-disabled);
      --kp-button-border-hover: var(--kp-color-primary-default-border-disabled);
      --kp-button-border-active: var(--kp-color-primary-default-border-disabled);
      --kp-button-fg: var(--kp-color-primary-default-fg-disabled);
      --kp-button-fg-hover: var(--kp-color-primary-default-fg-disabled);
      --kp-button-fg-active: var(--kp-color-primary-default-fg-disabled);
    }
    :host([disabled].kp-button--subtle),
    :host(.kp-button--disabled.kp-button--subtle) {
      --kp-button-bg: var(--kp-color-primary-subtle-bg-disabled);
      --kp-button-bg-hover: var(--kp-color-primary-subtle-bg-disabled);
      --kp-button-bg-active: var(--kp-color-primary-subtle-bg-disabled);
      --kp-button-fg: var(--kp-color-primary-subtle-fg-disabled);
      --kp-button-fg-hover: var(--kp-color-primary-subtle-fg-disabled);
      --kp-button-fg-active: var(--kp-color-primary-subtle-fg-disabled);
    }
    :host([disabled].kp-button--outline),
    :host(.kp-button--disabled.kp-button--outline) {
      --kp-button-bg: var(--kp-color-primary-outline-bg-disabled);
      --kp-button-bg-hover: var(--kp-color-primary-outline-bg-disabled);
      --kp-button-bg-active: var(--kp-color-primary-outline-bg-disabled);
      --kp-button-border: var(--kp-color-primary-outline-border-disabled);
      --kp-button-border-hover: var(--kp-color-primary-outline-border-disabled);
      --kp-button-border-active: var(--kp-color-primary-outline-border-disabled);
      --kp-button-fg: var(--kp-color-primary-outline-fg-disabled);
      --kp-button-fg-hover: var(--kp-color-primary-outline-fg-disabled);
      --kp-button-fg-active: var(--kp-color-primary-outline-fg-disabled);
    }
    :host([disabled].kp-button--ghost),
    :host(.kp-button--disabled.kp-button--ghost) {
      --kp-button-bg: var(--kp-color-primary-ghost-bg-disabled);
      --kp-button-bg-hover: var(--kp-color-primary-ghost-bg-disabled);
      --kp-button-bg-active: var(--kp-color-primary-ghost-bg-disabled);
      --kp-button-fg: var(--kp-color-primary-ghost-fg-disabled);
      --kp-button-fg-hover: var(--kp-color-primary-ghost-fg-disabled);
      --kp-button-fg-active: var(--kp-color-primary-ghost-fg-disabled);
    }
  `]
})
export class KpButtonComponent {
  /** Native button type. Defaults to "button" (safer than browser default "submit"). */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() size: KpSize = 'md';
  @Input() variant: KpVariant = 'default';
  @Input() color: KpButtonColor = 'primary';
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) loading = false;
  /** Hides the label and makes the button square — pair with an icon and `aria-label`.
      booleanAttribute so a bare `iconOnly` attribute coerces to true (a plain
      `@Input() = false` left a bare attribute as the falsy empty string). */
  @Input({ transform: booleanAttribute }) iconOnly = false;
  /** Force a visual state for showcase/documentation purposes. */
  @Input() forceState: KpState | null = null;

  get hostClasses(): string {
    const classes = [
      'kp-button',
      `kp-button--${this.size}`,
      `kp-button--${this.variant}`,
      `kp-button--${this.color}`,
    ];
    if (this.iconOnly) classes.push('kp-button--icon-only');
    if (this.forceState) {
      classes.push(`kp-button--${this.forceState}`);
    } else if (this.loading) {
      classes.push('kp-button--loading');
    }
    return classes.join(' ');
  }
}
