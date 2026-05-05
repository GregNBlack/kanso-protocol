# Token Contribution Guide

> How to add, change, or retire a token without breaking light/dark parity,
> Figma sync, or the lint gate. Read this *before* editing anything under
> `tokens/`.

The CONTRIBUTING.md "Token workflow" section is the 90-second version.
This is the deeper reference: *which* layer to edit, *why*, and what each
build script regenerates.

## The three layers

```
tokens/primitive/   raw, brand-agnostic ramps + scales
tokens/semantic/    role-based aliases pointing at primitives
tokens/themes/      mode overrides (today: dark)
```

Choose the layer based on the question you can answer:

| Layer | Answers the question | Example |
|-------|----------------------|---------|
| **Primitive** | What is this *value*? | `color.blue.600 = #2563EB` |
| **Semantic** | What is this *for*? | `color.primary.default.bg.rest = {color.blue.600}` |
| **Theme** | What does this *become* in the other mode? | `color.gray.900 → #FAFAFA` |

> **Rule of thumb:** components consume *semantic* tokens. Primitives only
> exist to be referenced by semantics. If a component template has a literal
> primitive reference like `var(--kp-color-blue-600)`, that's a smell — the
> right fix is usually to introduce a semantic alias.

## Naming conventions

### Primitives

- **Color ramps**: `color.<hue>.<step>` where step is `50, 100, 200, …, 950`.
  Eleven stops, gray included. Same shape for every hue (`blue`, `red`,
  `green`, `amber`, `cyan`).
- **Spacing / sizing / radius**: T-shirt scale (`xs / sm / md / lg / xl`)
  plus `2xs`, `2xl`, `3xl` extensions where a real component needs them.
- **Motion**: `motion.duration.<name>` + `motion.easing.<name>`. Names
  describe intent (`fast`, `medium`, `slow`, `indeterminate`), not numbers.

### Semantics

The naming pattern is:

```
color.<role>.<variant>.<surface>.<state>
       │       │         │         │
       │       │         │         └─ rest | hover | active | focus | disabled | loading
       │       │         └─ bg | fg | border | icon
       │       └─ default | subtle | outline | ghost
       └─ primary | danger | neutral | success | warning | info
```

A few tokens stop earlier in the chain (`accent.primary.fg`, `focus.ring`),
but the cascade is the rule. If a new token doesn't fit this shape, ask
*why* before adding — it's usually a sign the slot belongs in a different
collection (`form/*`, `alert/*`, `input/*`).

### Component-namespaced semantics

Some components own their own slot tokens (`alert/icon`,
`input/clear-bg`, `form/floating-label`). These exist when a component
needs a value that doesn't have a meaningful sharing partner — adding
them at the global semantic layer would be over-generalization.

Naming: `<component>/<slot>` (forward slash, not dot — these come from
Figma variable groups and we mirror that path).

## When to add a primitive vs a semantic

Add a **primitive** only if:

1. It introduces a new ramp (a hue we don't have yet) OR
2. It introduces a new scale stop that's reused by ≥2 unrelated semantic
   tokens. A one-off can live as a literal in the semantic that needs it.

Add a **semantic** when:

1. A component or pattern references the same primitive in 3+ places, OR
2. The token's *meaning* is stable but its primitive value will likely
   change later (this is the whole point of the semantic layer), OR
3. Light and dark need to map the slot to *different* primitives — only
   the semantic layer can express that override.

If in doubt, prefer adding a semantic. Primitives are append-only and
hard to retire because every theme has to inherit the new ramp.

## Adding a new token — step by step

1. **Edit the right JSON file.** Use the table above. Match the structure
   of nearby tokens — DTCG `$type` + `$value` + optional `$description`.

2. **Add a `$description` if the token's purpose isn't obvious from the
   name.** Anything that decouples one variable from another (e.g. why
   `color.foreground.on-saturated` exists separately from `color.white`)
   *must* have a description — that's how the next contributor knows not
   to merge them back.

3. **Run `npm run build:tokens`.** Style Dictionary regenerates:
   - `packages/core/styles/tokens.css` — CSS custom properties (light)
   - `packages/core/styles/_tokens.scss` — Sass mirror
   - `packages/core/styles/dark.css` — dark overrides (see below)
   - `packages/core/src/_generated/tokens.js` — TS/JS constants

4. **Add a dark override if the primitive doesn't invert correctly by
   default.** Open `tokens/themes/dark.json` and add the override at the
   matching path. Re-run `npm run build:tokens`.

5. **Run `npm run lint:tokens`.** This catches:
   - Raw color literals (`#xxxxxx`, `rgb(...)`, etc.) in component CSS
   - Physical-direction CSS (`margin-left`, `text-align: right`, ...)
     instead of logical (`margin-inline-start`, `text-align: end`)
   - Raw transition durations not pointing at a motion token
   - `box-shadow` values not referencing any `var(--kp-…)` token
   See `scripts/lint-tokens.js` for the exact rules and the
   `// kanso-lint-disable <rule> -- <reason>` suppression syntax.

6. **Mirror in Figma.** If you added a primitive ramp, add the matching
   variable in the `primitive/color` collection (light + dark modes).
   Semantic-only tokens don't need a Figma counterpart unless a designer
   binds a layer to them directly.

7. **Commit both** the source JSON *and* the regenerated outputs in the
   same commit. CI re-runs the build, but committing the artifacts means
   PR diffs show the user-facing effect of every token change.

## Dark theme — what's automatic, what isn't

The `tokens/themes/dark.json` file is *not* a full re-declaration of every
token. It only contains the overrides where automatic inversion isn't
right. Concretely:

- **Primitive ramps** invert manually: every step in a ramp has its dark
  counterpart explicitly listed. There is no `lighten()` math.
- **Semantic tokens that alias a primitive** automatically pick up the
  dark primitive — no override needed. `color.primary.default.bg.rest`
  aliases `color.blue.600`; in dark mode, `color.blue.600` resolves to
  the dark-ramp value, and the semantic follows.
- **Semantic tokens whose mapping itself changes** (e.g. `accent.primary.fg`
  uses `blue.600` in light, `blue.400` in dark — readable on the dark
  page bg) require an explicit override at the semantic path.
- **Subtle backgrounds** on Alert / Badge often need a hand-tuned dark
  value because primitive inversion alone produces too-low contrast.
  These overrides sit at the bottom of `dark.json`.

Never edit `dark.css` by hand — it's regenerated from `dark.json` and the
header comment in the file repeats this warning.

## Validating your change

```sh
npm run lint:tokens     # architectural rule check
npm run build:tokens    # regenerates all output files
npm test                # runs the visual + unit suite that consumes them
npm run build-storybook # confirms the Foundations pages still render
```

For dark-mode work specifically, the Storybook `Foundations` pages render
every primitive ramp and the highest-signal semantic tokens in both
themes, and the `a11y + dark-mode` CI job runs axe-core against every
story in both themes. A regression there usually means a missing dark
override on a newly-added semantic token.

## Retiring a token

Tokens are append-only in spirit. To remove one:

1. Search the codebase for `--kp-<token-name>` and replace usages.
2. Search Figma for the variable name and rebind affected layers.
3. Delete the token from `tokens/**` and re-build.
4. Note the removal in `CHANGELOG.md` under `### Breaking` for the
   release in which it lands.

A renamed token counts as retire-then-add — there's no aliasing layer that
keeps both names alive.

## References

- DTCG spec: <https://design-tokens.github.io/community-group/format/>
- Style Dictionary 4 docs: <https://styledictionary.com/>
- Lint rules: [`scripts/lint-tokens.js`](../scripts/lint-tokens.js)
- Build pipeline: [`scripts/build-tokens.js`](../scripts/build-tokens.js)
- Figma variable bridge: [`packages/mcp/figma-mapping.json`](../packages/mcp/figma-mapping.json)
