# Migrating from 0.x to 1.0

> Status: **draft, pre-1.0.** Kanso Protocol is currently `0.x` and `1.0`
> hasn't shipped. This guide lists every breaking change that's already
> committed for 1.0 plus everything still under decision, so you can
> structure your code today to make the eventual upgrade boring.

If you're starting a new project on `0.x` today, the short version is:
**only consume semantic tokens, never primitives**, and you'll dodge
the majority of the planned breaks.

For per-surface stability today, see [`docs/1.0-readiness.md`](./1.0-readiness.md) —
that file lists every component, pattern, and token group with its
current status (`stable` / `beta` / `experimental` / `internal`). Anything
marked `stable` there has its API frozen for 1.0.

## Versioning policy through 1.0

- Until 1.0, **minor versions can break `experimental` surfaces** without
  notice. They will not break `stable` surfaces — once a surface is
  marked `stable` in `1.0-readiness.md`, its API is frozen.
- Every break is called out in `CHANGELOG.md` under a `### Breaking`
  block. CI enforces a CHANGELOG update for any `packages/**/package.json`
  version bump.
- Deprecations land at least one minor before removal. The CHANGELOG
  records the deprecation in the release where the new API ships and
  the removal in the release where the old API disappears.

## Confirmed breaking changes for 1.0

### 1. Token: `color.fg.on-saturated` replaces `color.white` for text

**What** — `--kp-color-white` will lose its "high-contrast text on
saturated backgrounds" meaning. Text/icon foregrounds on solid Button,
filled Badge, and selected Pagination will read from
`--kp-color-foreground-on-saturated` (already shipped in `0.5.x`).

**Why** — `--kp-color-white` doubles as a surface-elevation token
(`#FFFFFF` in light, `#18181B` in dark). When dark inverts the surface
meaning, the text meaning fails and white text on a dark Button looks
broken. Splitting the meaning was the unblocker for clean dark mode.

**How to migrate** — search your code for any `color: var(--kp-color-white)`
on text or icon properties. Replace with
`var(--kp-color-foreground-on-saturated)`. The new token is already
exported in `0.5.x` so you can do this incrementally before 1.0.

### 2. Token: `color.text.muted` replaces direct `gray-300/400` references

**What** — Text rendered in muted contexts (Helper text, Placeholder,
Disabled labels) reads from a new `color.text.muted` semantic that
swaps independently in dark mode.

**Why** — `gray-400` looks correct in light but fails AA against dark
elevation surfaces, and the previous designer-pass tokens patched this
per-component. A single semantic that resolves to `gray-500` in light
and `gray-400` in dark covers every site at once.

**How to migrate** — replace any component-CSS reference to
`var(--kp-color-gray-300)` or `var(--kp-color-gray-400)` used for *text*
with `var(--kp-color-text-muted)`. Borders and backgrounds are not
affected.

### 3. Direct primitive references in component CSS removed

**What** — components currently contain ~220 direct
`var(--kp-color-blue-600)`-style references in their inline styles.
Those will all be migrated to semantic accent tokens
(`color.accent.primary.fg`, etc.) before 1.0 ships.

**Why** — primitive references defeat the whole point of the semantic
layer; they bypass dark-mode overrides and brand-color customization.

**How to migrate (consumer side)** — none, if you're using Kanso
components as published packages. **If you fork or override component
templates**, mirror the same migration: replace primitive `--kp-color-<hue>-<step>`
references in your overrides with the corresponding semantic token.

## Likely breaking changes (still under decision)

These are open questions in `1.0-readiness.md`. They may land for 1.0,
land later, or be resolved differently than the option below — so write
your code defensively.

### Button — `[loading]` may auto-lock `[disabled]`

Today, `[loading]` and `[disabled]` are independent. Holding an
opinion on whether `loading=true, disabled=false` should remain
clickable is the open question. **Recommendation today:** don't rely
on a loading button being clickable. If you need a separate
"submitting" affordance that *is* clickable, use a different
control (e.g. an explicit cancel button next to the loading button).

### Alert — `(close)` event ordering

Today `(close)` fires *after* the host removes itself. We're likely to
flip this to fire *before* removal, so consumers can run cleanup with
the host still in the DOM. **Recommendation today:** treat the
component reference as invalid as soon as `(close)` fires.

### Drawer — `side="left" \| "right"` and RTL

`drawer` `side` is currently physical (left = left, right = right) and
does not flip under `dir="rtl"`. We may switch to logical (start/end)
or keep physical with separate flip support. **Recommendation today:**
if you need RTL, expect to revisit Drawer placement when 1.0 lands.

### Popover — anchor positioning under scroll

`popover` uses fixed positioning today, which detaches when the
trigger scrolls. The 1.0 likely-shape is anchor-aware repositioning,
either with `IntersectionObserver` or position-anchor CSS.
**Recommendation today:** don't relyon the current detach behavior;
it'll change.

### `KP_VALIDATION_MESSAGES` may fold into `KP_STRINGS`

Form-field validation messages today come from a separate injection
token (`KP_VALIDATION_MESSAGES`). For 1.0 we're likely to fold them
into the unified `KP_STRINGS` registry. **Recommendation today:**
if you provide a custom validation-messages token, structure it as a
flat record so the eventual move to `KP_STRINGS.formField.errors.*`
is mechanical.

### `experimental`-tagged components may break in any 1.x release

Anything still marked `experimental` in `1.0-readiness.md` at 1.0 ships
with that label. Per the readiness doc's promotion rules, those can
break in `1.1`. Today's experimental list:
`combobox`, `command-palette`, `datepicker`, `file-upload`,
`markdown-viewer`, `rich-text-editor`, `table` (experimental — sort
and selection are stable but the API for variable-height /
virtualized tables is not), `timepicker`, `virtual-list`.

If you build on these now, isolate them behind a thin wrapper of
your own so a future API change is a one-file migration.

## Things that are explicitly *not* changing

If you're worried about churn, here's what's already frozen for 1.0:

- The five-size T-shirt scale (`xs / sm / md / lg / xl`) and its
  height/radius/font cascade.
- The six-state model (`rest / hover / active / focus / disabled /
  loading`) and its ARIA mappings (`aria-busy`, `aria-disabled`).
- DTCG token format and the `tokens/{primitive,semantic,themes}/*.json`
  layout. New tokens get added; the structure is stable.
- All `stable`-tagged components in `1.0-readiness.md`:
  `badge`, `divider`, `empty-state`, `icon`, `skeleton`, `toggle`.
- The Storybook story-id pattern (`components-<name>--<variant>`),
  which means deep links from your docs into Storybook are safe.
- The `npm i @kanso-protocol/<component>` package boundaries — every
  component has its own publishable npm package; nothing is being
  consolidated.

## How to be 1.0-ready today

A short checklist that will make the eventual upgrade trivial:

1. **Consume semantic tokens, not primitives.** If you ever write
   `var(--kp-color-blue-600)` in your own CSS, you've taken a
   dependency that may move. Use `var(--kp-color-accent-primary-fg)`
   or the equivalent semantic instead.
2. **Don't rely on the difference between `loading` and `disabled`.**
   Treat both as "user can't interact" until 1.0.
3. **Keep `experimental` components behind an internal wrapper.** One
   file you control = one place to migrate later.
4. **Update to the latest `0.x.y` regularly.** Each release backports as
   many of the above changes as possible behind compatible aliases.
5. **Pin `core` and component packages to the same version.** Token
   shape is in `core`; mismatched versions can produce missing
   variables at runtime.
6. **If you fork a component**, audit your fork for primitive token
   references and physical-direction CSS (`margin-left`,
   `text-align: right`); the lint rules in
   [`scripts/lint-tokens.js`](../scripts/lint-tokens.js) catch both.

## Reporting upgrade pain

When 1.0 ships, the migration guide will move to `docs/migration-1.0.md`
(this file) with a per-section `0.x → 1.0` codemod recipe and the
exact CHANGELOG entries. If you hit something that isn't covered, file
an issue with the `migration` label — those go to the front of the
queue.
