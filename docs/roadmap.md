# Roadmap

> Where Kanso Protocol is heading. Milestones are listed in priority order;
> dates are intentionally absent because this is an open-source project
> driven by a small contributor set. Sequence is the commitment, calendar
> is not.

For per-surface stability today, see [`docs/stability.md`](./stability.md).
For the most recent breaking change and how to upgrade, see
[`docs/MIGRATION-v5.md`](./MIGRATION-v5.md).

## Recently shipped (`5.17.0`)

A large maintainability + reach release. Everything below is live.

- **Density seam.** `provideKansoDensity()` + `KP_DENSITY` from
  `@kanso-protocol/ui/density` — one app-level preference sets the *default*
  size for size-aware components; an explicit `[size]` always wins. Table
  honors it today; other components adopt the same 3-line pattern as they need it.
- **N-theme build + high-contrast theme.** The token build generalized from
  hard-coded light/dark to a `THEMES` list (`dark.css` is byte-identical);
  adding a theme is now dropping `tokens/themes/<name>.json` + a list entry. A
  `[data-theme="high-contrast"]` theme ships as the first extra theme (all 82
  curated pairs pass AA, pillars at AAA). The brand tool gained `--neutral` and
  `--status` ramp overrides with per-hue WCAG enforcement.
- **Typed React wrappers.** `@kanso-protocol/react` (`0.x`) — generated
  `<KpButton>`, `<KpSelect>`, … forwardRef wrappers over the `<kp-*>` custom
  elements, with object-prop + event support on React 18/19. Thin over
  `@kanso-protocol/elements`, no rewrite.
- **Tree-shakeable custom elements + native form participation.** The elements
  package adds per-component entry points (`@kanso-protocol/elements/<name>`)
  alongside the all-in-one bundle, and form-control elements now participate in
  native `<form>` submit/reset via `ElementInternals`.
- **Variable-height virtualization.** `@kanso-protocol/ui/variable-virtual-list`
  — cumulative-offset binary search for differing row heights; a uniform height
  reduces to the fixed-height fast path, keeping `virtual-list` simple.
- **Charts adapter.** `@kanso-protocol/ui/charts` — a dependency-free token
  bridge (`kansoEChartsTheme` / `kansoChartColors`) that styles your own chart
  library with Kanso tokens. We still don't ship a charts *component*.
- ~~**Component decision matrix.**~~ Storybook `Choosing a component` MDX page.
- ~~**Anchor-aware Popover positioning.**~~ The `[kpPopover]` directive tracks
  its trigger on scroll/resize and auto-closes when the anchor leaves the
  viewport (IntersectionObserver) — the scroll-detach bug is fixed.
- ~~**Custom `<kp-select>` rich options.**~~ Optional `icon` + `description` on
  `KpSelectOption`; the selected option's icon mirrors into the trigger.
- ~~**Notification Center incremental pagination.**~~ `[pageSize]` window +
  "Show N more" control + `(loadMore)` `{visible, total}`; the window resets
  when the list is replaced.
- ~~**Enforcement + a11y hardening.**~~ Full-matrix WCAG-AA contrast gate in both
  themes, declaration-level motion lint, docs+spec coverage gate, reduced-motion
  CI check, forced-colors rules. All eight token surfaces promoted to `stable`.

## Earlier milestones (done)

- ~~**Token cleanup before 1.0.**~~ **Done** (2026-05-05). 1334 direct
  primitive references migrated to semantic tokens; dark theme promoted to
  `stable`.
- ~~**Dark theme architecture stabilization.**~~ **Done** (2026-05-05).
  Surface-vs-text double duty on `--kp-color-white` resolved via
  `color.foreground.on-saturated`; `text.*` / `surface.*` / `border.*`
  families shipped.
- ~~**Performance budget + CI gate.**~~ **Done.** Per-package gzipped
  bundle-size budget with a CI gate (`scripts/check-bundle-size.js`,
  `bundle-budget.json`).
- ~~**Visual regression coverage expansion.**~~ **Done.** The curated
  `e2e/visual.spec.ts` set now spans the catalog (light + dark, plus `dir="rtl"`).
- ~~**RTL validation.**~~ **Done.** `e2e/visual.spec.ts` snapshots the catalog
  under `dir="rtl"`; components use logical properties (physical-CSS is
  lint-blocked).
- ~~**Keyboard navigation audit.**~~ **Done.** Centralized
  [`docs/keyboard-map.md`](./keyboard-map.md) chord set per component.
- ~~**i18n polish.**~~ **Done.** `KP_VALIDATION_MESSAGES` folded into
  `KP_STRINGS.validation`; `timepicker` auto-detects 12h/24h from `KP_LOCALE`.
- ~~**Code Connect mappings (Figma ↔ Code).**~~ **Done** (2026-05-04). Every
  component/pattern carries a `codeConnect` block, surfaced via the MCP server.

## Later

Worth doing, not blocking the next release.

- **Mobile-first AppShell variant** — drawer-as-default-nav, bottom-tab bar.
  Today's AppShell is desktop-first.
- **Sticky group headers in virtualized lists** — the variable-height list
  handles differing row heights; pinned section headers are the next step.
- **Recommended rich-text-editor extension bundles** — image-upload protocol
  reference, code-block syntax highlighting. The TipTap base already lets
  consumers add these; we may ship a recommended config bundle.
- **Adopt the density seam across more components** — Input / Select / Button
  read `KP_DENSITY` today only where wired; roll the 3-line pattern out to the
  rest of the size-aware set.

## Considered, not committed

Ideas with merit that haven't been prioritized. Subject to community
demand and contributor bandwidth.

- **A charts *component*** — still out of scope. The recommendation remains a
  dedicated charting library; `@kanso-protocol/ui/charts` styles it with Kanso
  tokens. A component wrapper would only ship on strong consumer demand.
- **More themes** — now that the build is N-theme, additional first-party
  themes (e.g. sepia, dim) are cheap to add if there's demand.

## Explicitly out of scope

These are decided "no" so contributors don't propose them in good
faith.

- **CSS-in-JS support.** Tokens are CSS custom properties; consumers can use
  them from any CSS-in-JS layer, but Kanso ships no runtime injection API.
- **First-class hand-written React/Vue rewrites.** Non-Angular consumers use
  the framework-agnostic [`@kanso-protocol/elements`](web-components.md) custom
  elements, optionally through the typed [`@kanso-protocol/react`](web-components.md)
  wrappers. Hand-ported native components remain out of scope — the
  custom-elements bridge is how Kanso reaches other frameworks.
- **CDN-hosted Storybook with versioned URLs.** Storybook is built per release
  on GitHub Pages; we don't run a versioned-docs service.

## Toward `6.0`

Breaking changes park here until a major is warranted. Nothing forces a `6.0`
yet — the `5.x` line stays additive.

- **Remove the deprecated aliases.** `icon-button` (use `Button` with
  `[iconOnly]`) and `KP_VALIDATION_MESSAGES` (use `KP_STRINGS.validation`) are
  `@deprecated`-marked and still honored on `5.x`; they come out in `6.0`.

## Contributing to the roadmap

If you'd like to push something forward:

1. Find or open the corresponding issue on GitHub.
2. Comment with your use case — concrete is better than abstract.
3. For "Considered" items, a real consumer integrating the proposed
   feature is the strongest signal we can use to prioritize.
