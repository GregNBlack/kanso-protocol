---
"@kanso-protocol/ui": minor
---

i18n polish — unify validation messages under `KP_STRINGS` and auto-detect the timepicker clock format.

- **Validation messages folded into `KP_STRINGS`.** Form-field validation copy now lives under `KP_STRINGS.validation` (one token for all localizable strings) — `{ provide: KP_STRINGS, useValue: { validation: { required: '…' } } }`. The standalone `KP_VALIDATION_MESSAGES` token is **deprecated but still honored** (merged on top), so existing apps keep working. Overrides may be partial; per-field `[errors]` still wins. Types + defaults (`KpValidationMessages`, `KP_DEFAULT_VALIDATION_MESSAGES`) now live in the `i18n` entry point and are re-exported from `form-field` for back-compat.
- **`<kp-time-picker>` defaults to `format="auto"`**, deriving 12h/24h from `KP_LOCALE` (e.g. `en-US` → 12h, `de-DE` → 24h) via `Intl`. Pass `format="12h"` / `"24h"` to force a convention. Behavior change: under the default, a 12h locale now renders a 12h picker instead of the previous fixed 24h.
