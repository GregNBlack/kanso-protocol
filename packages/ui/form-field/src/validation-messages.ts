import { InjectionToken } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import {
  KpValidationMessages,
  KpValidationMessageResolver,
  KP_DEFAULT_VALIDATION_MESSAGES,
} from '@kanso-protocol/ui/i18n';

// Validation message types + English defaults now live in the i18n entry
// point and are folded into `KP_STRINGS.validation` (one token for all
// localizable copy). Re-exported here for back-compat.
export type { KpValidationMessages, KpValidationMessageResolver };
export { KP_DEFAULT_VALIDATION_MESSAGES };

/**
 * @deprecated Provide validation messages via the unified `KP_STRINGS` token
 * instead: `{ provide: KP_STRINGS, useValue: { validation: { required: '…' } } }`.
 * This token is still honored (merged on top of `KP_STRINGS.validation`) so
 * existing apps keep working, but it will be removed in a future major.
 */
export const KP_VALIDATION_MESSAGES = new InjectionToken<KpValidationMessages>(
  'KP_VALIDATION_MESSAGES',
  // Defaults now come from KP_STRINGS.validation; this legacy token contributes
  // nothing unless a consumer explicitly provides it.
  { factory: () => ({}) },
);

/**
 * Pick a message for a ValidationErrors object. Merge order (highest wins):
 * per-field override → app-level registry → built-in defaults. The first error
 * key is used (Angular keeps insertion order), matching how validators compose.
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
