---
"@kanso-protocol/ui": minor
---

**MarkdownViewer** — the default parser now lazy-loads `marked` via dynamic `import()` instead of a static top-level import, so consumers who don't render markdown eagerly can code-split it out of their initial bundle. `[parser]` now accepts a **synchronous or async** function (`(md) => string | Promise<string>`); rendering resolves on a microtask and triggers change detection. This resolves the markdown-viewer open question → promoted `beta → stable` (now 34 stable · 6 beta · 1 experimental).
