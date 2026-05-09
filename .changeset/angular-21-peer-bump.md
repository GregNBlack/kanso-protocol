---
"@kanso-protocol/core": minor
---

Bump `@angular/*` peer-dependency floor from `>=18.0.0` to `>=21.0.0`
across every `@kanso-protocol/*` package.

**Why now**: Angular 18 is EOL (Nov 2025), 19-LTS expires this month.
The library is developed and tested exclusively on Angular 21; the
declared `>=18` range was historical and didn't reflect what we
actually run in CI. Aligning to `>=21` makes the support matrix honest
and lets future code use the latest stable APIs without compatibility
shims.

**Migration**: consumers on Angular ≤20 will hit a peer-dependency
warning on install. There are no functional changes — every API the
library uses (`@if`/`@for`/`@defer`, signal-based `input()`/`output()`/
`model()`/`effect()`) was already stable in Angular 18, so nothing
breaks at runtime. Either upgrade Angular to 21, or pin
`@kanso-protocol/*` to `0.5.x`.
