---
"@kanso-protocol/ui": minor
---

**Input** — new `[name]` and `[autocomplete]` inputs, forwarded to the native `<input>`. Without them, `<kp-input type="password">` (and email/username fields) had no way to signal to the browser what they are, so autofill and "save password" prompts didn't trigger on login/register/reset-password forms. Both are optional and additive — existing usages are unaffected. The Login example now sets `autocomplete="username"` / `autocomplete="current-password"` to demonstrate it.
