---
"@kanso-protocol/ui": patch
---

**Menu** — `<kp-dropdown-menu>` gains proper WAI-ARIA roving keyboard navigation. `Arrow Down` / `Arrow Up` move focus across enabled items (wrapping), `Home` / `End` jump to first / last, and section labels, dividers, and disabled items are skipped. `Tab` still works as before. This resolves the menu's last open API question, promoting it `beta → stable` (now 30 stable · 10 beta · 1 experimental).
