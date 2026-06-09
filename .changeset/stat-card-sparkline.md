---
"@kanso-protocol/ui": minor
---

**StatCard** — new built-in data-driven sparkline. Pass `[sparklineData]="[…]"` (a numeric series, ≥2 points) to draw an inline trend line, colored by the card's trend tone (success / danger / accent). The `[kpStatCardSparkline]` projection slot still takes precedence for a custom chart, and `[showSparkline]` without data falls back to the placeholder. Resolves the stat-card open question → promoted `beta → stable` (patterns now 13 stable · 7 beta).
