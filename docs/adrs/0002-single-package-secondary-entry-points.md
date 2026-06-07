# ADR 0002 — Consolidate to a Single Package with Secondary Entry Points

- **Status:** Accepted
- **Date:** 2026-06-07
- **Target release:** 5.0.0 (breaking)
- **Supersedes:** the "one npm package per component" model

## Decisions (locked)

- **Package name:** `@kanso-protocol/ui`
- **Patterns layout:** flat, alongside components (`@kanso-protocol/ui/sidebar`, not `…/patterns/sidebar`). No name collisions exist (41 components + 20 patterns, all unique). Matches Angular Material convention; keeps the internal atom/pattern split out of the public import path.
- **core:** folded into the package root (`@kanso-protocol/ui` = tokens / types / utils). One package, truly.

## Context

Kanso currently ships **64 separate npm packages** (`@kanso-protocol/button`, `@kanso-protocol/input`, …). Production review (Sergey, 2026-06-01, item #4 + #5) flagged the friction this creates:

> "Ещё бы лучше уйти от команд подобных `npm i @kanso-protocol/textarea @kanso-protocol/input …`: angular содержит в себе уже встроенные механизмы для tree-shaking + подобного эффекта по разбивке на модули внутри одного пакета можно при помощи файлов ng-package.json и public-api.ts в подпапке. Плюсом core всегда устанавливать надо, почему бы с ним все остальные не устанавливать? Ну и лень после каждой обновы писать команду для обновления зависимостей всех этих пакетов."

Pain points with 64 packages:
- **Install friction** — consumers list every component they use, each as a separate dependency.
- **Version churn** — every release bumps 64 `package.json`s + 64 `CHANGELOG.md`s; consumers update 64 version pins.
- **`core` is mandatory anyway** — every component peer-depends on `@kanso-protocol/core`, so the granularity buys little.
- **peer-dep version dance** — the changeset minor→major escalation (fixed in 4.1.0) was a direct symptom of 64 packages cross-peer-depending.

Angular libraries support **secondary entry points** natively (ng-packagr): one published package, many import subpaths, tree-shaking preserved (each entry point is its own ESM module; unused ones are dropped by the bundler).

## Decision

**Collapse the 64 packages into a single published package with one secondary entry point per component/pattern.**

```
@kanso-protocol/ui                      → core: tokens, types, overlay-position, portal
@kanso-protocol/ui/button
@kanso-protocol/ui/input
@kanso-protocol/ui/tooltip
…                                        → one entry point per component
@kanso-protocol/ui/sidebar
@kanso-protocol/ui/page-header
…                                        → patterns, same flat namespace
```

Consumers install once:

```bash
npm i @kanso-protocol/ui
```

and import per-feature:

```ts
import { KpButtonComponent } from '@kanso-protocol/ui/button';
import { KpTooltipDirective } from '@kanso-protocol/ui/tooltip';
```

Tree-shaking is unaffected — importing `@kanso-protocol/ui/button` pulls only the button entry point's code; the bundler never sees the others.

### Package name — DECIDED: `@kanso-protocol/ui`

Candidates considered (all keep the `@kanso-protocol` org scope):
- `@kanso-protocol/ui` — **chosen.** Plain, reads naturally as a UI library.
- `@kanso-protocol/kit` — short, conventional for a component kit.
- `@kanso-protocol/angular` — signals the framework, leaves room for a future `@kanso-protocol/react`.

The name is load-bearing across every import site and the docs; `ui` was confirmed before implementation.

### Layout on disk

```
packages/ui/
  package.json            # the ONE published package
  ng-package.json         # primary entry point → core
  src/public-api.ts       # re-exports tokens/types/utils
  button/
    ng-package.json       # secondary entry point
    src/public-api.ts
    src/button.component.ts
  input/
    ng-package.json
    src/public-api.ts
  …
```

ng-packagr discovers every `ng-package.json` under the package root and builds them as secondary entry points of the one package.

## Migration plan (phased, on a long-lived branch)

### Phase 1 — scaffolding (no behavior change)
1. Create `packages/ui/` with the primary entry point (core sources move here; the `ui` root re-exports tokens / types / utils).
2. Move each `packages/components/<name>/src` and `packages/patterns/<name>/src` under `packages/ui/<name>/`, add per-folder `ng-package.json` + `public-api.ts`.
3. Internal cross-imports rewrite: `@kanso-protocol/button` → `@kanso-protocol/ui/button` (187 import sites; scripted codemod).

### Phase 2 — tooling
4. `build-libs.js` → single ng-packagr build of `packages/ui` (produces `dist/packages/ui` with all entry points).
5. `publish-libs.js` → publish ONE package.
6. `check-bundle-size.js` → measure per-entry-point bundles within the one package.
7. `generate-mcp-manifest.js` → entry points instead of packages (selector/import paths change to `@kanso-protocol/ui/<name>`).
8. `tsconfig.base.json` paths → map subpaths to the new folders.
9. `.changeset/config.json` → single package, drop the fixed/linked group entirely (no more cross-peer-dep group).

### Phase 3 — consumers & docs
10. Storybook + examples imports → new subpaths.
11. README, docs/components/*, MCP install snippet, Figma Community description.
12. **Codemod for external consumers** — ship a `npx @kanso-protocol/ui migrate` or document a find-replace: `@kanso-protocol/<name>` → `@kanso-protocol/ui/<name>`, and a single `npm i @kanso-protocol/ui` replacing N installs.
13. Deprecate the 64 old packages on npm (deprecation notice pointing to `@kanso-protocol/ui/<name>`), keep them published at their last 4.x for a grace period.

### Phase 4 — release
14. Major bump to **5.0.0** for `@kanso-protocol/ui`. The old packages get a final 4.x with a deprecation `README` note.

## Consequences

### Positive
- One install, one version pin, one dependency to update.
- One `package.json` + one `CHANGELOG.md` per release.
- Eliminates the cross-peer-dep group entirely → no more changeset escalation class.
- Tree-shaking unchanged (verified: secondary entry points are independent ESM modules).
- Simpler mental model: "install the package, import what you need."

### Negative / risk
- **Large breaking change** — every consumer rewrites imports + install. Mitigated by codemod + docs + grace-period deprecation of old packages.
- **Big mechanical diff** — 64 folder moves, 187 import rewrites, 6 tooling scripts, all docs. High blast radius; must land on a branch with full CI (now stable thanks to the 4.1.0 container fix) before merge.
- **MCP manifest reshape** — every component's `import`/`npm` field changes; AI consumers using the MCP get the new paths automatically after regen.
- **Loses ability to publish a single component independently** — acceptable; the granularity was never used in practice (core is always required).

## Open questions — RESOLVED
1. ~~Package name: `kit` / `ui` / `angular`?~~ → **`@kanso-protocol/ui`** (see Decisions).
2. ~~Does `core` keep its own package or fold into the root?~~ → **folded into the `@kanso-protocol/ui` root entry point**; tooling imports the root.
3. ~~Patterns namespace — flat or prefixed?~~ → **flat** (`@kanso-protocol/ui/sidebar`); no name collisions across 41 components + 20 patterns.
4. Grace period length for deprecated 64 packages — left published at their final 4.x; revisit removal after adoption data.

## References
- [ng-packagr secondary entry points](https://github.com/ng-packagr/ng-packagr/blob/main/docs/secondary-entrypoints.md)
- Production review thread, Sergey, 2026-06-01 (items #4, #5)
- ADR 0001 (CSS Public API) — same "reduce friction, formalize the surface" spirit
