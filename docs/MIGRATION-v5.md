# Migrating from Kanso v4.x → v5.0.0

v5 consolidates the former **64 per-component npm packages**
(`@kanso-protocol/button`, `@kanso-protocol/input`, …) into a **single
package** — `@kanso-protocol/ui` — with one *secondary entry point* per
component and pattern. See [ADR 0002](adrs/0002-single-package-secondary-entry-points.md)
for the rationale.

**Nothing about the components themselves changed** — no selectors, no
inputs, no outputs, no template internals. This is purely a packaging /
import-path change. Tree-shaking is preserved: each entry point is its
own ESM module, so importing `@kanso-protocol/ui/button` pulls only the
button code.

## TL;DR

1. Replace every `@kanso-protocol/<name>` dependency with the single
   `@kanso-protocol/ui`.
2. Rewrite imports: `@kanso-protocol/<name>` → `@kanso-protocol/ui/<name>`.
3. `@kanso-protocol/core` (tokens / types / utils) folded into the
   package root: `@kanso-protocol/core` → `@kanso-protocol/ui`.
4. Style imports move under the `ui` package:
   `@kanso-protocol/core/styles/...` → `@kanso-protocol/ui/styles/...`.

`@kanso-protocol/mcp` is unaffected — it is a separate tool, not a
component package, and keeps its own name and version line.

## Step 1 — dependencies

Drop all the per-component entries and add one:

```diff
  "dependencies": {
-   "@kanso-protocol/core": "^4.1.0",
-   "@kanso-protocol/button": "^4.1.0",
-   "@kanso-protocol/input": "^4.1.0",
-   "@kanso-protocol/form-field": "^4.1.0",
-   "@kanso-protocol/sidebar": "^4.1.0",
-   "@kanso-protocol/icon": "^4.1.0",
+   "@kanso-protocol/ui": "^5.0.0"
  }
```

Then:

```bash
npm install @kanso-protocol/ui
```

## Step 2 — import paths

Every import subpath gains a `ui/` segment. Components and patterns share
the same flat namespace (patterns are **not** under `/patterns/`).

```diff
- import { KpButtonComponent }    from '@kanso-protocol/button';
- import { KpInputComponent }     from '@kanso-protocol/input';
- import { KpFormFieldComponent } from '@kanso-protocol/form-field';
- import { KpSidebarComponent }   from '@kanso-protocol/sidebar';   // a pattern
+ import { KpButtonComponent }    from '@kanso-protocol/ui/button';
+ import { KpInputComponent }     from '@kanso-protocol/ui/input';
+ import { KpFormFieldComponent } from '@kanso-protocol/ui/form-field';
+ import { KpSidebarComponent }   from '@kanso-protocol/ui/sidebar';
```

### Codemod (find-and-replace)

A single regex covers the component/pattern imports. From your project
root:

```bash
# macOS / BSD sed
grep -rl '@kanso-protocol/' src \
  | xargs sed -i '' -E "s#@kanso-protocol/(core)([\"'/])#@kanso-protocol/ui\2#g; \
                        s#@kanso-protocol/([a-z][a-z-]*)#@kanso-protocol/ui/\1#g"
```

```bash
# GNU sed (Linux / CI)
grep -rl '@kanso-protocol/' src \
  | xargs sed -i -E "s#@kanso-protocol/(core)([\"'/])#@kanso-protocol/ui\2#g; \
                     s#@kanso-protocol/([a-z][a-z-]*)#@kanso-protocol/ui/\1#g"
```

> Run the `core` rule **first** (it rewrites `@kanso-protocol/core` →
> `@kanso-protocol/ui`), then the general rule. The general rule already
> skips anything that became `@kanso-protocol/ui/...` because the captured
> name no longer follows `@kanso-protocol/` directly. Exclude
> `@kanso-protocol/mcp` if you reference it in app code (rare).

After running, search for any double-rewrites (`@kanso-protocol/ui/ui`,
`@kanso-protocol/ui/mcp`) and fix by hand — there should be none in a
typical app.

## Step 3 — `core` → root

`@kanso-protocol/core` no longer exists as its own package. Its public
surface (tokens, types, `findPortalTarget`, overlay-position helpers) is
re-exported from the `@kanso-protocol/ui` root:

```diff
- import { findPortalTarget } from '@kanso-protocol/core';
+ import { findPortalTarget } from '@kanso-protocol/ui';
```

## Step 4 — styles

The generated CSS / Sass tokens live under the `ui` package:

```diff
- import '@kanso-protocol/core/styles/tokens.css';
- import '@kanso-protocol/core/styles/dark.css';
+ import '@kanso-protocol/ui/styles/tokens.css';
+ import '@kanso-protocol/ui/styles/dark.css';
```

```diff
- @use '@kanso-protocol/core/styles/tokens' as *;
+ @use '@kanso-protocol/ui/styles/tokens' as *;
```

## i18n

The i18n surface is now an entry point rather than its own package:

```diff
- import { KP_LOCALE, KP_STRINGS } from '@kanso-protocol/i18n';
+ import { KP_LOCALE, KP_STRINGS } from '@kanso-protocol/ui/i18n';
```

## The old 64 packages

They remain published at their final **4.x** with a deprecation notice
pointing here, so existing lockfiles keep resolving during a grace
period. New work should target `@kanso-protocol/ui`. The deprecated
packages will not receive further releases.

## Angular peer-dependency floor

Unchanged (`@angular/* >= 21.0.0`).

## Why this release

64 packages meant: a separate dependency line per component, 64
`package.json` + `CHANGELOG.md` bumps per release, 64 version pins for
consumers to update, and a cross-peer-dependency web that produced the
changeset minor→major escalation bug (fixed in 4.1.0). Angular's native
secondary-entry-point support gives us the same per-component
tree-shaking from **one** package — so v5 collapses all of it into a
single install, a single version pin, and a single changelog, with no
loss of granularity at the bundler level.
