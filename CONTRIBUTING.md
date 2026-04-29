# Contributing to Kanso Protocol

Thanks for your interest. This guide covers environment setup, conventions, and the workflow for adding or modifying components, patterns, and tokens.

## Dev environment

**Requirements:** Node 20+, npm 10+, Git.

```bash
git clone https://github.com/GregNBlack/kanso-protocol.git
cd kanso-protocol
npm install
npm run build:tokens     # generates packages/core/styles/{tokens.css,_tokens.scss}
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
  core/                    generated CSS + types (published)
  components/{name}/       atomic primitives (Button, Input, …)
  patterns/{name}/         opinionated compositions (AppShell, FilterBar, …)
  examples/{name}/         full-page reference layouts (Storybook only)

docs/
  components/{name}.md     API contract per component
  patterns/{name}.md       API contract per pattern
  architecture-decision-record.md   design decisions log

.storybook/                Storybook 8 config
tokens/                    DTCG source
```

## Golden rules

Read [`docs/architecture-decision-record.md`](docs/architecture-decision-record.md) first — it is the `why` behind every structural decision.

1. **Every value is a token.** No hex, no magic numbers in component CSS. If you need a new value, add it to `tokens/primitive/` or `tokens/semantic/`, rebuild, and reference the resulting CSS variable.
2. **Every component is standalone.** Don't add cross-component imports. If two components need shared logic, extract it to `@kanso-protocol/core`.
3. **Components don't depend on patterns.** The dependency graph flows `components → patterns → examples`. Never the reverse.
4. **Every state is explicit.** Six states (rest / hover / active / focus / disabled / loading) — no opacity overlays, no `:hover { opacity: 0.8 }`.
5. **Match the Figma component.** The Figma library is updated in lockstep. If you add or change a variant in code, update Figma (and vice versa). See [Figma sync](#figma-sync).

## Token workflow

Tokens live in `tokens/**/*.json` in W3C DTCG format. They are the single source of truth for both CSS and Figma.

**Adding or changing a token:**

1. Edit the relevant JSON file in `tokens/primitive/` or `tokens/semantic/`.
2. Run `npm run build:tokens` — this regenerates:
   - `packages/core/styles/tokens.css` (CSS custom properties)
   - `packages/core/styles/_tokens.scss` (Sass variables)
   - `packages/core/styles/dark.css` (dark-theme overrides — see below)
   - `packages/core/src/_generated/tokens.js` (TS/JS constants)
3. Commit both the source JSON and the regenerated output.
4. Mirror the change in Figma if it's a primitive.

**Dark theme** is also generated from DTCG sources. Overrides live in `tokens/themes/dark.json` and emit to `packages/core/styles/dark.css` via the `css/variables-dark` custom format defined in `style-dictionary.config.js`. When you add a new primitive ramp:

1. Add the inverted ramp to `tokens/themes/dark.json` (mirror the structure of an existing ramp like `gray` or `blue`).
2. If a semantic token built on top of that primitive needs a *different* mapping in dark (e.g. a `subtle-bg` that inversion alone doesn't make tinted enough — see how `alert.subtle.bg` and `badge.subtle.bg` are listed at the bottom of `tokens/themes/dark.json`), add an explicit override there too.
3. Re-run `npm run build:tokens` and commit the regenerated `dark.css`.

> Never edit `dark.css` by hand — your changes will be wiped on the next build. The header comment in the generated file repeats this warning.

## Adding a new component

1. **Copy an existing component** as your starting template — Button is the canonical example: `packages/components/button/`.
2. **Directory layout:**
   ```
   packages/components/my-component/
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

Patterns live under `packages/patterns/{name}/` and follow the same layout as components. Key rules:

- A pattern **consumes components** — it doesn't wrap them in custom markup.
- A pattern **never duplicates a component's styling** — override via CSS variables if you need a tweak.
- Stories title: `Patterns/MyPattern`.
- Document in `docs/patterns/my-pattern.md`.

## Coding conventions

- **Angular:** v18+ standalone components, `OnPush`, signals where sensible, reactive forms over template-driven.
- **CSS:** inline in `styles:` array, BEM-ish class names (`kp-{component}__{element}--{modifier}`), `:host` for root styles, CSS vars for every color / size / spacing.
- **Naming:** `Kp{Name}Component` for classes, `kp-{name}` for selectors, `kp-{name}__{slot}` for internal elements.
- **Types:** exported from `src/index.ts`. Every public input / output has a jsdoc.
- **Accessibility:**
  - Semantic HTML first (`<button>`, `<input>`, `<dialog>`) — no div-as-button.
  - Focus is visible on every interactive element (2px outline, `--kp-color-focus-ring`).
  - `aria-*` where semantics are incomplete (e.g. `aria-expanded` on accordion trigger, `aria-busy` on loading button).
  - Loading state preserves focus — don't remove the element from the tab order.
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
   npm run build-storybook   # catches most compilation issues
   ```
3. Open PR against `main`. Describe **what** changed, **why**, and link the relevant issue / ADR if any.
4. A screenshot / screen recording is appreciated for any visual change.
5. CI must be green before merge.

## Figma sync

The Figma library lives at [this file](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6). Structure:

- 🧩 **Components** — 38 sections (one per component) with master set + parts + examples.
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

Every library (core + each component + each pattern) is published as its own npm package under the `@kanso-protocol/*` scope.

### Build all

```bash
npm run build:tokens   # regenerate CSS/SCSS/TS from DTCG sources
npm run build:libs     # ng-packagr → dist/packages/**/
```

`build:libs` does three things:

1. **Scaffolds** `ng-package.json` + `tsconfig.lib.json` for any package that lacks them (idempotent — safe to re-run).
2. **Topologically sorts** packages by their `@kanso-protocol/*` imports, then builds in dependency order.
3. **Re-points** `node_modules/@kanso-protocol/<pkg>` symlinks at the built `dist/**/` output, so downstream packages resolve the compiled FESM bundle rather than the raw TS source.

Artifacts land in `dist/packages/{core,components,patterns}/<name>/` with `fesm2022/`, `types/`, `styles/` (core only), and a fully-formed `package.json` (exports map, `module`, `typings`, peer deps).

### Build one

```bash
npm run build:lib core          # or: button, pagination, stat-card, ...
```

Accepts the short folder name. If the target imports other workspace packages, build them first.

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

### Release workflow (changesets)

Versioning and publishing are driven by [changesets](https://github.com/changesets/changesets). All `@kanso-protocol/*` packages are in the `fixed` group — they bump together.

**When you make a change that should ship:**

```bash
npx changeset             # choose affected packages + bump type + write a summary
```

That writes a markdown file under `.changeset/`. Commit it with your PR.

**Release pipeline (automated on `main`):**

1. Merge a PR with changesets to `main`.
2. `.github/workflows/release.yml` opens (or updates) a **"Version Packages"** PR — bumps every `@kanso-protocol/*` package.json + writes `CHANGELOG.md` entries.
3. Merge that Version PR.
4. The workflow runs again, sees no pending changesets, builds libraries, and runs `scripts/publish-libs.js` which walks `dist/packages/**/` and `npm publish`es each package whose `<name>@<version>` isn't on the registry yet.

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
