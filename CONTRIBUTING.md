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
   - `packages/core/src/_generated/tokens.js` (TS/JS constants)
3. Commit both the source JSON and the regenerated output. (Generated files are gitignored except `dark.css` — see `.gitignore`.)
4. Mirror the change in Figma if it's a primitive.

**Dark theme:** `packages/core/styles/dark.css` is currently hand-maintained. Any new primitive you add must have its dark-mode override added there (`:root[data-theme="dark"] { … }`). If the primitive is a simple ramp inversion, mirror the pattern used by existing ramps.

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

## Reporting bugs / requesting features

Open an issue with:

- **Title:** short, imperative (`Button focus ring clipped when inside overflow:hidden parent`).
- **Description:** expected vs. actual, minimum reproduction URL if possible (Storybook story link works).
- **Screenshot** if visual.
- **Browser / OS** if cross-platform.

For new component requests, explain **why** the existing primitives are insufficient — we prefer to extend existing components over adding new ones.

## License

MIT — see [LICENSE](LICENSE).
