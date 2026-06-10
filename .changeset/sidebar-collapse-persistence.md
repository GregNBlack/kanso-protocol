---
"@kanso-protocol/ui": minor
---

**Sidebar** — optional collapse persistence. Set `[persistKey]="'…'"` and the expanded/collapsed choice is saved to `localStorage` under that key and restored on init (SSR-safe — no-op on the server / when storage is unavailable). Without a key, collapse stays session-scoped (in-memory), as before. Resolves the sidebar open question → promoted `beta → stable` (patterns now 14 stable · 6 beta).
