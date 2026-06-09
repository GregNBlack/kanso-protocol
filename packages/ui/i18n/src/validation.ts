/**
 * Validation message registry — folded into `KP_STRINGS.validation` so all
 * localizable copy lives behind a single token (`KP_STRINGS`). `<kp-form-field>`
 * reads these to turn an `AbstractControl.errors` object into human text.
 *
 * Kept free of `@angular/forms` so the i18n entry point stays dependency-light;
 * the payload is typed `any` (Angular types `ValidationErrors[k]` as `any`
 * anyway), and the error-resolution helper that needs `ValidationErrors` lives
 * in the form-field entry point.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KpValidationMessageResolver = string | ((payload: any) => string);

/** Dictionary keyed by validator name (matches keys inside `AbstractControl.errors`). */
export type KpValidationMessages = Record<string, KpValidationMessageResolver>;

/** Built-in English defaults, covering Angular's stock validators. */
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
