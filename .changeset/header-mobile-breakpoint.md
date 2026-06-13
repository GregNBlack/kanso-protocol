---
"@kanso-protocol/ui": minor
---

**Header** — responsive `[mobileBreakpoint]`. Below the given viewport width the inline nav collapses to a hamburger button that emits `(menuClick)` (wire it to open your Drawer / Sidebar). Null (default) keeps the nav inline at all widths — no behavior change for existing headers. SSR-safe. Resolves the header open question → promoted `beta → stable` (patterns now 19 stable · 1 beta). Also drops an unused `NgTemplateOutlet` import (clears an NG8113 build warning).
