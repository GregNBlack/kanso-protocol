/**
 * ElementInternals form participation for Kanso form-control custom elements.
 *
 * `@angular/elements` turns an Angular component into a custom element but does
 * NOT make it a form-associated element — so a `<kp-input>` dropped inside a
 * native `<form>` never contributes to FormData and ignores form reset/disable.
 * This module wraps the `createCustomElement()` constructor with a
 * form-associated subclass that bridges the gap, WITHOUT touching the Angular
 * component's own ControlValueAccessor (Angular forms keep working unchanged).
 *
 * The wrapper is purely additive: non-form elements pass through untouched, and
 * when the platform lacks ElementInternals the original constructor is returned
 * as-is (feature-detected, never throws).
 */

import type { NgElementConstructor } from '@angular/elements';

/** How a given `<kp-*>` control exposes its current value + change signals. */
interface FormControlDescriptor {
  /**
   * - `text`    — value read from the inner native control (`input`/`textarea`)
   *               or, for the pointer-driven slider, the host's `value` getter.
   * - `boolean` — checkable control (checkbox/switch/radio); submits its
   *               `value` when checked, nothing when unchecked.
   * - `detail`  — value only observable through the component's change event
   *               detail (date/time pickers expose no readable value property).
   */
  readonly kind: 'text' | 'boolean' | 'detail';
  /** Host property that reflects the current value / checked state. */
  readonly valueProp: string;
  /** `boolean` kind: host property holding the value submitted when checked. */
  readonly checkedValueProp?: string;
  /** `@Input` to write back on reset so the *visible* control resets too. */
  readonly resetProp?: string;
  /** Events (component `@Output`s + bubbling native events) that signal change. */
  readonly events: readonly string[];
}

/**
 * The form-control elements we can participate for, keyed by tag. Derived from
 * the actual component APIs (verified against packages/ui): each entry names a
 * value/checked property that is observable at the custom-element layer.
 *
 * Deliberately excluded — `kp-select`, `kp-combobox`, `kp-file-upload`: they
 * expose neither a value `@Input` nor a value `@Output` to `@angular/elements`,
 * so their value can't be read or reset from the wrapper without changing the
 * component (out of scope here). Add them when they gain a value output.
 */
const FORM_CONTROLS: Readonly<Record<string, FormControlDescriptor>> = {
  'kp-input': { kind: 'text', valueProp: 'value', resetProp: 'value', events: ['input', 'change'] },
  'kp-textarea': { kind: 'text', valueProp: 'value', resetProp: 'value', events: ['input', 'change'] },
  // number-stepper keeps its value in a plain (non-`@Input`) field, so there is
  // no host `value` accessor to write back — reset only clears the form value.
  'kp-number-stepper': { kind: 'text', valueProp: 'value', events: ['input', 'change'] },
  'kp-slider': { kind: 'text', valueProp: 'value', resetProp: 'value', events: ['valueChange', 'input', 'change'] },
  'kp-checkbox': { kind: 'boolean', valueProp: 'checked', checkedValueProp: 'value', resetProp: 'checked', events: ['change', 'checkedChange'] },
  'kp-toggle': { kind: 'boolean', valueProp: 'on', checkedValueProp: 'value', resetProp: 'on', events: ['change', 'onChangeEvent'] },
  'kp-radio': { kind: 'boolean', valueProp: 'checked', checkedValueProp: 'value', resetProp: 'checked', events: ['change', 'checkedChange'] },
  // date/time pickers render a custom popover, not a native input — the only
  // window onto their value is the `valueChange` event detail.
  'kp-date-picker': { kind: 'detail', valueProp: 'value', events: ['valueChange'] },
  'kp-time-picker': { kind: 'detail', valueProp: 'value', events: ['valueChange'] },
};

/** True when the platform supports form-associated custom elements. */
function supportsFormAssociation(): boolean {
  return (
    typeof HTMLElement !== 'undefined' &&
    typeof (HTMLElement.prototype as { attachInternals?: unknown }).attachInternals === 'function' &&
    typeof (globalThis as { ElementInternals?: unknown }).ElementInternals !== 'undefined'
  );
}

/** Serialize an arbitrary value into a form-submittable string. */
function serialize(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return v.map((x) => (x instanceof Date ? x.toISOString() : String(x ?? ''))).join(',');
  return String(v);
}

// Minimal structural view of the NgElement lifecycle we extend. Typed here so
// `super.*` calls type-check without depending on NgElement's abstract shape.
interface NgElementLike extends HTMLElement {
  connectedCallback(): void;
  disconnectedCallback(): void;
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null, namespace?: string): void;
}
type NgElementLikeCtor = { new (...args: unknown[]): NgElementLike };

/**
 * Wrap a `createCustomElement()` constructor so form-control tags participate
 * in native forms. Returns the constructor unchanged for non-form tags or when
 * ElementInternals is unavailable.
 */
export function withFormAssociation<T>(
  tag: string,
  ctor: NgElementConstructor<T>,
): NgElementConstructor<T> {
  const desc = FORM_CONTROLS[tag];
  if (!desc || !supportsFormAssociation()) return ctor;

  const Base = ctor as unknown as NgElementLikeCtor;

  class KpFormAssociatedElement extends Base {
    // Read by the browser at `customElements.define()` time — opts the element
    // into <form> association (submit/reset/disable/validation callbacks).
    static readonly formAssociated = true;

    private _internals: ElementInternals | null = null;
    private _initialText = '';
    private _initialChecked = false;
    private _captured = false;
    private readonly _onChange = (e: Event): void => this._syncFormValue(e);

    constructor(...args: unknown[]) {
      super(...args);
      // attachInternals throws if called twice / on a non-associated element;
      // guarded so an unexpected host environment degrades gracefully.
      try {
        this._internals = this.attachInternals();
      } catch {
        this._internals = null;
      }
    }

    override connectedCallback(): void {
      super.connectedCallback();
      // Capture the author-declared initial state once, for formResetCallback.
      if (!this._captured) {
        this._captured = true;
        this._initialText = this.getAttribute('value') ?? '';
        this._initialChecked = this.hasAttribute(desc.valueProp);
      }
      for (const ev of desc.events) this.addEventListener(ev, this._onChange);
      // Establish the initial FormData contribution once the inner Angular view
      // has had a chance to render (matches a pristine native control).
      queueMicrotask(() => this._syncFormValue());
    }

    override disconnectedCallback(): void {
      for (const ev of desc.events) this.removeEventListener(ev, this._onChange);
      super.disconnectedCallback();
    }

    override attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null,
      namespace?: string,
    ): void {
      super.attributeChangedCallback(name, oldValue, newValue, namespace);
      // Keep the form value in step with attribute-driven programmatic updates.
      if (this._internals) this._syncFormValue();
    }

    /** Native form calls this on `<form>.reset()`. */
    formResetCallback(): void {
      const host = this as unknown as Record<string, unknown>;
      try {
        if (desc.kind === 'boolean') {
          if (desc.resetProp) host[desc.resetProp] = this._initialChecked;
        } else if (desc.resetProp) {
          host[desc.resetProp] = this._initialText;
        }
      } catch {
        /* setter rejected the reset value — form value is still cleared below */
      }
      this._syncFormValue();
    }

    /** Native form calls this when an ancestor <fieldset>/form disables it. */
    formDisabledCallback(disabled: boolean): void {
      try {
        (this as unknown as { disabled?: boolean }).disabled = disabled;
      } catch {
        /* component has no disabled input — nothing to propagate */
      }
    }

    /** Read the current value and reflect it to the form via ElementInternals. */
    private _syncFormValue(event?: Event): void {
      if (!this._internals) return;
      const host = this as unknown as Record<string, unknown>;
      const target = event?.target ?? null;

      if (desc.kind === 'boolean') {
        let checked: boolean;
        if (target instanceof HTMLInputElement) checked = target.checked;
        else if (event instanceof CustomEvent && typeof event.detail === 'boolean') checked = event.detail;
        else checked = !!host[desc.valueProp];
        const raw = desc.checkedValueProp ? host[desc.checkedValueProp] : null;
        const submitValue = raw == null || raw === '' ? 'on' : String(raw);
        this._internals.setFormValue(checked ? submitValue : null);
        return;
      }

      if (desc.kind === 'detail') {
        // Value is only knowable from the change event; reset/initial → empty.
        this._internals.setFormValue(event instanceof CustomEvent ? serialize(event.detail) : this._initialText);
        return;
      }

      // text: prefer the inner native control (reflects live edits), else the
      // host's value accessor (slider getter / declared `value` input).
      let raw: unknown;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        raw = target.value;
      } else {
        raw = host[desc.valueProp];
      }
      this._internals.setFormValue(serialize(raw));
    }
  }

  return KpFormAssociatedElement as unknown as NgElementConstructor<T>;
}
