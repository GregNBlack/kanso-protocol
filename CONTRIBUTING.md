# Contributing to Kanso Protocol

Thanks for your interest. This guide covers environment setup, conventions, and the workflow for adding or modifying components, patterns, and tokens.

## Dev environment

**Requirements:** Node 20+, npm 10+, Git.

```bash
git clone https://github.com/GregNBlack/kanso-protocol.git
cd kanso-protocol
npm install
npm run build:tokens     # generates packages/ui/styles/{tokens.css,_tokens.scss}
npm run storybook        # http://localhost:6006
```

The repo is a single-branch (`main`) workspace. Every merge to `main` auto-deploys Storybook to GitHub Pages.

## Repository layout

```
tokens/                    DTCG JSON — single source of truth
  primitive/               palette, sizes, spacing, typography
  semantic/                roles, states (reference primitives)
  themes/                  per-theme overrides (e.g. dark)

packages/
  ui/                      the single published Angular package (ADR 0002)
    <name>/                one folder per component AND pattern — each a
                           secondary entry point (@kanso-protocol/ui/<name>)
    styles/                generated tokens.css / _tokens.scss / dark.css
  elements/                framework-agnostic custom-elements bundle (@kanso-protocol/elements)
  mcp/                     Model Context Protocol server (@kanso-protocol/mcp)
  examples/                full-page reference layouts (Storybook only)

docs/
  components/{name}.md     API contract per component
  patterns/{name}.md       API contract per pattern
  architecture-decision-record.md   design decisions log

.storybook/                Storybook config
tokens/                    DTCG source
```

> **Note on layout:** the `5.0` line consolidated the former per-component packages (the pre-v5 `components/`, `patterns/`, and `core` folders) into the single `@kanso-protocol/ui` package with per-component secondary entry points ([ADR 0002](docs/adrs/0002-single-package-secondary-entry-points.md)). Everything lives under `packages/ui/<name>/` now.

## Golden rules

Read [`docs/architecture-decision-record.md`](docs/architecture-decision-record.md) first — it is the `why` behind every structural decision.

1. **Every value is a token.** No hex, no magic numbers in component CSS. If you need a new value, add it to `tokens/primitive/` or `tokens/semantic/`, rebuild, and reference the resulting CSS variable.
2. **Every component is standalone.** Don't add cross-component imports. If two components need shared logic, extract it to `@kanso-protocol/ui`.
3. **Components don't depend on patterns.** The dependency graph flows `components → patterns → examples`. Never the reverse.
4. **Every state is explicit.** Six core states (rest / hover / active / focus / disabled / loading), plus `error` on form controls — each with its own token. No opacity overlays, no `:hover { opacity: 0.8 }`.
5. **Match the Figma component.** The Figma library is updated in lockstep. If you add or change a variant in code, update Figma (and vice versa). See [Figma sync](#figma-sync).

## Token workflow

Tokens live in `tokens/**/*.json` in W3C DTCG format. They are the single source of truth for both CSS and Figma.

> Quick version below. Full guide — naming conventions, primitive-vs-semantic decision, dark-mode rules, lint suppression syntax — lives in [`docs/tokens.md`](docs/tokens.md).

**Adding or changing a token:**

1. Edit the relevant JSON file in `tokens/primitive/` or `tokens/semantic/`.
2. Run `npm run build:tokens` — this regenerates:
   - `packages/ui/styles/tokens.css` (CSS custom properties)
   - `packages/ui/styles/_tokens.scss` (Sass variables)
   - `packages/ui/styles/dark.css` (dark-theme overrides — see below)
   - `packages/ui/src/_generated/tokens.js` (TS/JS constants)
3. Commit both the source JSON and the regenerated output.
4. Mirror the change in Figma if it's a primitive.

**Dark theme** is also generated from DTCG sources. Overrides live in `tokens/themes/dark.json` and emit to `packages/ui/styles/dark.css` via the `css/variables-dark` custom format defined in `style-dictionary.config.js`. When you add a new primitive ramp:

1. Add the inverted ramp to `tokens/themes/dark.json` (mirror the structure of an existing ramp like `gray` or `blue`).
2. If a semantic token built on top of that primitive needs a *different* mapping in dark (e.g. a `subtle-bg` that inversion alone doesn't make tinted enough — see how `alert.subtle.bg` and `badge.subtle.bg` are listed at the bottom of `tokens/themes/dark.json`), add an explicit override there too.
3. Re-run `npm run build:tokens` and commit the regenerated `dark.css`.

> Never edit `dark.css` by hand — your changes will be wiped on the next build. The header comment in the generated file repeats this warning.

## Adding a new component

1. **Copy an existing component** as your starting template — Button is the canonical example: `packages/ui/button/`.
2. **Directory layout:**
   ```
   packages/ui/my-component/
     package.json           { name, version, peerDependencies }
     src/
       index.ts             public exports
       my-component.component.ts
     stories/
       my-component.stories.ts
   ```
3. **Component file** — use `ChangeDetectionStrategy.OnPush`, `standalone: true`, inline `styles:` with CSS vars only (no hex).
4. **Stories** — title `Components/MyComponent`, enable `tags: ['autodocs']`. Cover sizes, variants, states, edge cases in separate stories.
5. **Update `package-lock.json`** — `npm install --package-lock-only` before committing the new workspace, or CI `npm ci` will fail.
6. **Write a doc contract** — `docs/components/my-component.md`, based on [`docs/components/_template.md`](docs/components/_template.md). Include API, variants, states, a11y, usage rules, anti-patterns.
7. **Link it from README** — add a row to the Components table.
8. **Add it to Figma** — build the variant set, wire Appearance + Variants mode overrides, make it look identical to the Storybook output.

## Adding a pattern

Patterns live under `packages/ui/{name}/` and follow the same layout as components. Key rules:

- A pattern **consumes components** — it doesn't wrap them in custom markup.
- A pattern **never duplicates a component's styling** — override via CSS variables if you need a tweak.
- Stories title: `Patterns/MyPattern`.
- Document in `docs/patterns/my-pattern.md`.

## Coding conventions

- **Angular:** v21+ standalone components, `OnPush`, signals where sensible, reactive forms over template-driven.
- **CSS:** inline in `styles:` array, BEM-ish class names (`kp-{component}__{element}--{modifier}`), `:host` for root styles, CSS vars for every color / size / spacing.
- **Naming:** `Kp{Name}Component` for classes, `kp-{name}` for selectors, `kp-{name}__{slot}` for internal elements.
- **Types:** exported from `src/index.ts`. Every public input / output has a jsdoc.
- **Accessibility:**
  - Semantic HTML first (`<button>`, `<input>`, `<dialog>`) — no div-as-button.
  - Focus visible on every interactive element via `:focus-visible` — a tokenized ring: `var(--kp-focus-ring-width) solid var(--kp-color-focus-ring)` at `var(--kp-focus-ring-offset)`. Don't hardcode the `2px`.
  - `aria-*` where semantics are incomplete (`aria-expanded` on accordion trigger, `aria-busy` on loading button, `aria-invalid` on error inputs). The *disabled* mapping is element-family-specific: native form elements use the native `disabled` attribute; host-element controls (`kp-input`, `kp-select`) use `aria-disabled`.
  - `loading` and `disabled` are **separate** inputs with distinct token ramps (`aria-busy` vs `aria-disabled`). On native form controls (`<button kpButton>`), `loading` also asserts the native `disabled` attribute while busy — deliberate, to block double-submit and the axe color-contrast rule — so a natively-loading control is not focusable *during* the load.
  - Honor `@media (prefers-reduced-motion: reduce)` (collapse transitions/decorative animation) and add `@media (forced-colors: active)` rules for interactive controls (Windows High Contrast). Use logical properties (`margin-inline`, `text-align: start`) for RTL — physical CSS is lint-blocked.
- **No comments that restate the code.** See `docs/architecture-decision-record.md#comment-policy` — comments should explain *why*, not *what*.

## Commit style

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>
```

- **Types:** `feat`, `fix`, `refactor`, `docs`, `chore`, `revert`, `test`.
- **Scopes:** component / pattern / system area — e.g. `feat(button): add xl size`, `fix(accordion): clip-content`, `refactor(tokens): inline subtle-bg`.
- **Subject:** imperative, no trailing period, lowercase.
- **Body:** optional — explain *why* and highlight any breaking change.

We do **not** use the `Co-Authored-By: Claude` trailer in this repo.

## Pull requests

1. Fork, branch off `main` (`feat/my-thing`, `fix/button-focus`, etc.).
2. Run locally before pushing:
   ```bash
   npm run build:tokens
   npm run lint
   npm run build:libs        # required before bundle-size check
   npm run check:bundle-size # gzipped fesm2022 budget gate
   npm run build-storybook   # catches most compilation issues
   ```
   If a bundle grew on purpose (new dep, expanded API), run
   `npm run check:bundle-size:update` and commit the refreshed
   `bundle-budget.json` in the same PR.
3. Open PR against `main`. Describe **what** changed, **why**, and link the relevant issue / ADR if any.
4. A screenshot / screen recording is appreciated for any visual change.
5. CI must be green before merge.

## Figma sync

The public library lives on [Figma Community](https://www.figma.com/community/file/1655934833130278579) — duplicate it to edit. (The previous source file was on an account that has since been retired; the editable master now lives under the maintainer's current account.) Structure:

- 🧩 **Components** — 42 sections (one per component) with master set + parts + examples.
- 📐 **Patterns** — 20 sections.
- 🖼️ **Example Pages** — 5 pages (Light + Dark pair each).

Variable collections:
- `primitive/color` — light & dark modes (mirror of `tokens/primitive/color.json` and `dark.css`).
- `semantic/color` — roles bound to primitives.
- `State`, `Appearance`, `Variants`, `Icon Color`, etc. — component-level axes.

When you change a token or component in code, apply the same change in Figma manually (Tokens Studio paid Push is required for automated sync, currently not set up).

## Testing

Unit tests run via **Vitest** through `@angular/build:unit-test`. Tests live next to their component as `*.spec.ts`.

```bash
npm test              # single run
npm run test:watch    # watch mode
npm run test:storybook   # axe-core accessibility pass over all Storybook stories
```

**What to cover per component** (minimum bar, matches existing specs):

1. **Rendering** — host element exists, no runtime errors.
2. **Inputs → DOM** — every `@Input()` reflects onto host class / attribute / child DOM.
3. **Accessibility** — role, aria-*, tabindex behave per the component contract. Disabled elements have `tabindex="-1"`.
4. **Events** — every `@Output()` fires on the documented trigger; blocked states (disabled, loading) suppress the event.
5. **ControlValueAccessor** (for form components) — `writeValue` updates state and marks the view for check; `registerOnChange` fires on user input.

**Testing patterns worth repeating** (see `button.spec.ts`, `input.spec.ts`, `dialog.spec.ts` for templates):

- Use `fixture.componentRef.setInput(name, value)` for OnPush components — direct `componentInstance.x = …` bypasses the change-detection signal.
- Portaled components (Dialog, Drawer, Popover, Menu, Toast) render into `document.body` — query with `document.querySelector` not `fixture.nativeElement`, and clean up in `afterEach`.
- Reactive-forms integration deserves an explicit host-component test (`KpInputComponent` has one) — it catches CVA wiring bugs that unit tests miss.

Running one suite during development: `npx ng test` then use the `p` (filter by filename) command in the Vitest UI.

## Building & publishing packages

The catalog ships as **three** published packages under the `@kanso-protocol/*` scope: **`ui`** (the single Angular package — every component and pattern is a secondary entry point, `@kanso-protocol/ui/<name>`, [ADR 0002](docs/adrs/0002-single-package-secondary-entry-points.md)), **`elements`** (framework-agnostic custom elements), and **`mcp`** (the MCP server).

### Build all

```bash
npm run build:tokens   # regenerate CSS/SCSS/TS from DTCG sources
npm run build:libs     # ng-packagr → dist/packages/**/
```

`build:libs` does three things:

1. **Scaffolds** `ng-package.json` + `tsconfig.lib.json` for any entry point that lacks them (idempotent — safe to re-run).
2. **Builds** `@kanso-protocol/ui` via ng-packagr — one FESM bundle per secondary entry point.
3. **Re-points** the `node_modules/@kanso-protocol/ui` symlink at the built `dist/` output, so the elements bundle and any consumer resolve the compiled FESM rather than raw TS source.

Artifacts land in `dist/packages/ui/` (`fesm2022/` — one `.mjs` per entry point — plus `types/` and `styles/`) with a fully-formed `package.json` (exports map, `module`, `typings`, peer deps). The `elements` and `mcp` packages build separately (`npm run build:elements`, `npm run build:mcp`) into `dist/packages/{elements,mcp}/`.

### Build one

```bash
npm run build:lib button        # or: pagination, stat-card, table-virtual, ...
```

Accepts the short entry-point folder name under `packages/ui/`.

### Versioning policy

Kanso is in **alpha** (`0.x.y`). The cadence laid out in [`CHANGELOG.md`](CHANGELOG.md#release-cadence) governs *when* the API is allowed to break, but every PR still has to choose a bump type. The rule:

| Change | Bump | Why |
|---|---|---|
| Adds a new component, pattern, input, output, slot, or token | **minor** | New surface — old code keeps working but new code can rely on it |
| **Renames or removes** an input, output, slot, CSS variable, or class | **minor** | Public-API break — visible to consumers, can fail their build / type-check / runtime |
| **Repurposes** an existing input or output (semantic change) | **minor** | Same shape, different behaviour — still a break for callers who relied on the old meaning |
| Fixes a visual / behavioural bug without changing the public surface | **patch** | Internal — consumers see only the fix |
| Tightens defaults that *might* surprise some callers (e.g. focus-ring color) | **patch**, but call it out in the migration section | Borderline — flag explicitly so anyone overriding tokens can review |
| Changes only docs, stories, tests, build, or CI | **no bump** (mark commit with `[skip-release]`) | Not shipped to consumers |

While we're on `0.x`, **patch and minor are both allowed to break callers** in principle — but the rule above forces honest signaling so anyone reading the changelog knows whether a `0.1.x → 0.1.y` upgrade is safe to take blindly. After `1.0`, the same table applies but minor is no longer allowed to remove or repurpose surfaces — those move to major and require a deprecation cycle.

**Worked examples from recent releases:**

- `0.1.3` — split `<kp-badge>` `[pill]` into `[pill]` (shape) + new `[count]` (counter). The shape of the input didn't change, but `[pill]="true"` no longer applies the tight padding it used to. **Repurpose → minor by this rule.** Was shipped as a patch (`0.1.2 → 0.1.3`); under this policy that should have been `0.2.0`. Logged in the changelog so consumers see the migration step.
- `0.1.2` — replaced `takeUntilDestroyed(DestroyRef)` with `Subject + ngOnDestroy`. No public input / output / slot changed. **Internal fix → patch.** Correctly classified.
- `0.1.0` → `0.2.0` (hypothetical next minor) — adding `<kp-data-table>` + a new `[stickyHeader]` input on `<kp-table>` would both be minor.

If a single PR mixes a fix and a new input, take the larger of the two bumps and write both in the changeset.

#### Enforcement

A husky `pre-push` hook and a CI job both run `scripts/check-changelog.js`. If you bump a `version` field in any `packages/**/package.json`, the push must also update `CHANGELOG.md`. The intent isn't to validate semver correctness automatically — that needs human judgment — but to **force the conversation** about migration steps to happen at PR review time, not after release.

Run it locally any time:

```bash
npm run lint:changelog
```

To bypass for a legitimate reason (revert PRs, build-tooling-only commits that happen to touch a package version), include `[skip-changelog]` in the PR title or any commit message. Locally, `git push --no-verify` skips the hook (CI will still enforce the rule unless `[skip-changelog]` is present).

### Release workflow (changesets)

Versioning and publishing are driven by [changesets](https://github.com/changesets/changesets). The `@kanso-protocol/*` packages version **independently** (`.changeset/config.json` → `fixed: []`, `linked: []`) — a change to `mcp` doesn't force a `ui` bump. A single changeset can still list several packages when one change touches more than one (e.g. `ui` 5.16.0, `mcp` 4.3.0, `elements` 0.2.0 shipped together but at their own numbers).

**When you make a change that should ship:**

```bash
npx changeset             # choose affected packages + bump type + write a summary
```

That writes a markdown file under `.changeset/`.

**Preferred (maintainer) flow — local bump.** Rather than leaving the `.changeset/*.md` for the bot to open a separate "Version Packages" PR, consume it locally so the bump ships *in the same feature PR*:

```bash
npx changeset            # write the changeset(s)
npx changeset version    # consume them → bump package.json + per-package CHANGELOGs
# then add the root CHANGELOG.md umbrella entry, resync the lockfile
npm install --package-lock-only --legacy-peer-deps
```

Commit the resulting bumps (no leftover `.md`) with your PR. On merge, `release.yml` finds no pending changesets and goes straight to publish — no Version PR.

**Automated fallback (if you commit the `.md` instead):**

1. Merge a PR that still contains `.changeset/*.md` to `main`.
2. `.github/workflows/release.yml` (via `changesets/action`) opens (or updates) a **"Version Packages"** PR — bumps the affected `@kanso-protocol/*` package.json files + writes `CHANGELOG.md` entries.
3. Merge that Version PR.
4. The workflow runs again, sees no pending changesets, builds, and runs `scripts/publish-libs.js` which walks `dist/packages/**/` and `npm publish`es each package whose `<name>@<version>` isn't on the registry yet.

**Secrets required** (repo settings → Actions → Secrets):

- `NPM_TOKEN` — an npm token with publish rights on the `@kanso-protocol` scope.
- `GITHUB_TOKEN` is auto-provided.

**First-time setup (maintainers only):**

- Create the scope on npm: `npm login`, then `npm org create kanso-protocol` (or manually via the npm website).
- Add `NPM_TOKEN` secret.
- Manually run `npm run build:libs && node scripts/publish-libs.js` for the initial `0.0.1` publish, or merge a changeset that bumps to `0.1.0` through the automated flow.

## Reporting bugs / requesting features

Open an issue with:

- **Title:** short, imperative (`Button focus ring clipped when inside overflow:hidden parent`).
- **Description:** expected vs. actual, minimum reproduction URL if possible (Storybook story link works).
- **Screenshot** if visual.
- **Browser / OS** if cross-platform.

For new component requests, explain **why** the existing primitives are insufficient — we prefer to extend existing components over adding new ones.

## License

MIT — see [LICENSE](LICENSE).
