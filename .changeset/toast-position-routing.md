---
"@kanso-protocol/ui": minor
---

**Toast** — per-corner routing. `show({ position })` (and the convenience methods) target a specific corner; each `<kp-toast-host>` now renders only the toasts matching its own `[position]` (unset routes to `top-right`, the default), showing the most recent `[max]`. Previously every host rendered every toast. Backward compatible — a single default host keeps showing all toasts. Resolves the toast open question → promoted `beta → stable`. **All 40 components are now `stable`.**
