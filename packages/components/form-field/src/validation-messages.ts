import { InjectionToken } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

/**
 * Resolver type: either a static string or a function that formats the
 * specific error payload into a message.
 *
 *   required → 'This field is required'
 *   minlength → ({ requiredLength, actualLength }) => `Min ${requiredLength} characters`
 */
// Function parameter widened to `any` (not `unknown`) so consumers can
// destructure payloads like `{ requiredLength }` without a cast on every
// resolver. Angular types ValidationErrors[k] as `any` anyway.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KpValidationMessageResolver =
  | string
  | ((payload: any) => string);

/**
 * Dictionary keyed by validator name (matches keys inside
 * `AbstractControl.errors`). Used by `<kp-form-field>` to turn validation
 * errors into human text without boilerplate in every template.
 */
export type KpValidationMessages = Record<string, KpValidationMessageResolver>;

/**
 * App-level override. Provide it in your bootstrap to change the defaults
 * (localization, wording, extra validators):
 *
 *   providers: [
 *     { provide: KP_VALIDATION_MESSAGES, useValue: {
 *         required: 'Обязательное поле',
 *         email: 'Неверный email',
 *         minlength: ({ requiredLength }) => `Минимум ${requiredLength} символов`,
 *     }},
 *   ]
 *
 * Per-field overrides (via the `[errors]` input on <kp-form-field>) still
 * take precedence over this token.
 */
export const KP_VALIDATION_MESSAGES = new InjectionToken<KpValidationMessages>(
  'KP_VALIDATION_MESSAGES',
  { factory: () => KP_DEFAULT_VALIDATION_MESSAGES },
);

/**
 * Built-in English defaults. Covers Angular's stock validators; extend or
 * override via `KP_VALIDATION_MESSAGES` or the per-field `[errors]` input.
 */
export const KP_DEFAULT_VALIDATION_MESSAGES: KpValidationMessages = {
  required:  'This field is required',
  email:     'Please enter a valid email',
  pattern:   'Please match the requested format',
  minlength: ({ requiredLength, actualLength }: { requiredLength: number; actualLength: number }) =>
    `At least ${requiredLength} characters (you entered ${actualLength})`,
  maxlength: ({ requiredLength }: { requiredLength: number }) =>
    `At most ${requiredLength} characters`,
  min:       ({ min }: { min: number }) => `Must be at least ${min}`,
  max:       ({ max }: { max: number }) => `Must be at most ${max}`,
};

/**
 * Pick a message for a ValidationErrors object using the dictionary merge
 * order: per-field override → app-level token → built-in defaults. The
 * first error key in the object is used (order is stable — Angular keeps
 * insertion order), which matches how validators are typically composed.
 */
export function resolveErrorMessage(
  errors: ValidationErrors,
  perFieldOverrides: KpValidationMessages | null | undefined,
  registry: KpValidationMessages,
): string | null {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;
  const [key, payload] = entries[0];

  const resolver =
    (perFieldOverrides && perFieldOverrides[key]) ??
    registry[key] ??
    null;

  if (resolver == null) return `Validation error: ${key}`;
  return typeof resolver === 'function' ? resolver(payload) : resolver;
}
