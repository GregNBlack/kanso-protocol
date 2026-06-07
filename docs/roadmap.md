# Roadmap

> Where Kanso Protocol is heading. Milestones are listed in priority order;
> dates are intentionally absent because this is an open-source project
> driven by a small contributor set. Sequence is the commitment, calendar
> is not.

For per-surface readiness today, see [`docs/1.0-readiness.md`](./1.0-readiness.md).
For known breaking changes that 1.0 will introduce, see
[`docs/migration-1.0.md`](./migration-1.0.md).

## Now (active)

Active work targeted for the next minor release.

- ~~**Token cleanup before 1.0.**~~ **Done** (2026-05-05). 1334 direct
  primitive references across 60 files migrated to semantic tokens
  (`color.text.*`, `color.surface.*`, `color.border.*`, with an
  `*.on-dark.*` invariant family for always-dark Header / Sidebar
  variants). Zero primitives remain in component or pattern CSS.
  Dark theme promoted from `experimental` to `stable`.
- **Performance budget + CI gate.** Per-package gzipped bundle-size
  baseline plus a CI check that fails on >10 % regression. Surfaces
  drift before it reaches consumers.
- **Visual regression coverage expansion** to ~50 stories across the
  catalog (today: 14). Bias toward components flagged `beta` whose only
  missing coverage row is "visual ✗" in the readiness doc.
- **Component decision matrix** in Storybook — a single MDX page that
  helps consumers pick between similar components (Combobox vs Select,
  Drawer vs Dialog, Toast vs Alert, etc.).

## Next (committed for 1.0)

Required to graduate `1.0`.

- ~~**Dark theme architecture stabilization.**~~ **Done** (2026-05-05).
  Surface-vs-text double duty on `--kp-color-white` resolved (split via
  `color.foreground.on-saturated` in `0.5.x`); `color.text.muted` and
  the rest of the `text.*` / `surface.*` / `border.*` semantic families
  shipped; primitive-reference audit complete. Dark theme is `stable`.
- **RTL validation.** A Playwright suite that visits every story under
  `dir="rtl"` and snapshots, since components use logical properties
  but no automated check exists today.
- **Keyboard navigation audit.** Centralized "keyboard map" doc per
  component (chord set + expected focus behavior). Most components
  implement WAI-ARIA correctly today; this is about discoverability,
  not new code.
- **i18n polish.** Fold `KP_VALIDATION_MESSAGES` into the unified
  `KP_STRINGS` registry; auto-detect 12h/24h in `timepicker` from
  `KP_LOCALE`.
- ~~**Code Connect mappings (Figma ↔ Code).**~~ **Resolved** (2026-05-04):
  every component and pattern in `figma-mapping.json` now carries a
  `codeConnect` block (`npm`, `primaryClass`, `selector`, `import`,
  `docs`, `storybook`). Surfaced via the MCP server's
  `figma_for_component` / `figma_for_pattern` tools so a single call
  resolves a Figma node ref → real Angular import statement.

## Later (post-1.0)

Worth doing, not blocking 1.0.

- **`<kp-table-virtual>`** — bake `<kp-virtual-list>` composition into
  the table primitive so consumers don't have to wire it up themselves
  for the >500-row case.
- **`<kp-variable-virtual-list>`** — variable-height virtualization as
  a separate package, keeping the fixed-height fast path simple.
- **Anchor-aware Popover positioning** — fix the scroll-detach bug
  with `IntersectionObserver` or CSS anchor positioning.
- **Custom `<kp-select>` variant** — for select fields that need
  richer option content (icons, descriptions). Native `<select>` stays
  as the default.
- **Sparkline support in StatCard** — currently single-metric only.
- **Notification Center pagination** — long lists today re-render
  everything; needs cursor-based slicing.

## Considered, not committed

Ideas with merit that haven't been prioritized. Subject to community
demand and contributor bandwidth.

- **Charts** — intentionally out of scope today; using a dedicated
  charting library is the recommendation. May ship a thin
  `@kanso-protocol/ui/charts` adapter that styles a known library
  (e.g. ECharts, Chart.js) with Kanso tokens, rather than a charts
  package of our own.
- **Mobile-first AppShell variant** — drawer-as-default-nav, bottom-tab
  bar. Today's AppShell is desktop-first.
- **More richt-text-editor extensions** — image upload protocol
  reference, code-block syntax highlighting. The TipTap base lets
  consumers add these themselves; we may ship recommended config
  bundles.

## Explicitly out of scope

These are decided "no" so contributors don't propose them in good
faith.

- **CSS-in-JS support.** Tokens are CSS custom properties; consumers
  can use them from any CSS-in-JS layer, but Kanso itself doesn't ship
  a runtime injection API.
- **Non-Angular framework ports.** Tokens are framework-agnostic and
  consumable from React/Vue/Svelte; components are Angular-only and
  staying that way. Cross-framework parity isn't the goal.
- **CDN-hosted Storybook with versioned URLs.** Storybook is built per
  release on GitHub Pages; we don't run a versioned-docs service.

## Contributing to the roadmap

If you'd like to push something forward:

1. Find or open the corresponding issue on GitHub.
2. Comment with your use case — concrete is better than abstract.
3. For "Considered" items, a real consumer integrating the proposed
   feature is the strongest signal we can use to prioritize.
4. PRs that move a component from `beta` → `stable` (closing the
   open questions in `1.0-readiness.md`) are the highest-leverage
   contributions today.
