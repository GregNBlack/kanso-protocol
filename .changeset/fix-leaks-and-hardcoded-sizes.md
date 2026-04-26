---
"@kanso-protocol/accordion": patch
"@kanso-protocol/breadcrumbs": patch
"@kanso-protocol/tabs": patch
"@kanso-protocol/segmented-control": patch
"@kanso-protocol/badge": patch
"@kanso-protocol/alert": patch
"@kanso-protocol/popover": patch
---

Fix memory leaks and replace hardcoded sizes with tokens.

**Memory leaks** — `accordion`, `breadcrumbs`, `tabs`, `segmented-control`: subscriptions to `QueryList.changes` and per-item `EventEmitter`s now route through `takeUntilDestroyed(DestroyRef)`. Accordion additionally uses `switchMap` to re-merge per-item `expandedChange` streams whenever the projected set changes, so newly added items get wired up and removed items don't leave stale subscriptions.

**Hardcoded sizes** — `badge`, `alert`, `popover`: removed `closeIconSize` / `closeSize` ternary getters that hardcoded SVG dimensions in TS. SVG width/height now come from CSS custom properties (`--kp-badge-close-size`, `--kp-alert-close-icon-size`, `--kp-popover-close-icon-size`) so consumers can override them through tokens.

**Pill radius** — `badge`: replaced three hardcoded `border-radius` values (9/11/13px) with the existing `--kp-radius-full` token.
