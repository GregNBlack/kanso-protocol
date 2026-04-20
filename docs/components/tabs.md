# Tabs

> Horizontal underline tabs — a container (`<kp-tabs>`) plus individual tab atoms (`<kp-tab>`). Visual chrome only; selection state lives in the caller.

## Contract

Tabs are a two-part component: `<kp-tabs>` is the strip (the shared bottom border, layout mode, and size propagation), and `<kp-tab>` is each tab inside it (label, optional icon slot, optional badge slot, and the active-underline). The container does **not** own selection — callers bind `[selected]` on each tab and react to `(selectedChange)` to update their own state. This keeps the component composable with whatever router / store / local signal you already use.

### Anatomy

```
<kp-tabs> (role="tablist", border-bottom 1px)
├─ <kp-tab> (role="tab")
│   ├─ [kpTabIcon]   (optional leading icon)
│   ├─ Label         (input)
│   └─ [kpTabBadge]  (optional trailing badge)
└─ [kpTabsMore]      (optional right-aligned "More ▾" slot)
```

- **Bottom border** on the container (`--kp-color-tabs-track-border`) spans the full width of the strip.
- **Active underline** is rendered as a 2 px `border-bottom` on the Tab itself, whose color shifts per state via `--kp-color-tabs-tab-underline-*`. Because the underline lives on the tab (not as a separate child), it always matches the tab's own width — whether the tab is hug-content or `flex: 1` inside a full-width row.
- **Icon / Label / Badge** — icon and badge are content-projection slots so callers can drop any SVG or any `<kp-badge>` in. Label is a plain string input; keep it short.

### Sizes

| Size | Height | Padding-x | Gap | Font | Icon |
|------|--------|-----------|-----|------|------|
| sm   | 32     | 12        | 6   | 14   | 14   |
| md   | 40     | 16        | 8   | 14   | 16   |
| lg   | 48     | 20        | 8   | 16   | 16   |

`<kp-tabs>` cascades `size` and `fullWidth` to every projected `<kp-tab>` via `@ContentChildren`, so you set them in one place on the container and the children follow.

## API — `<kp-tabs>`

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Cascades to all projected `<kp-tab>` children |
| `fullWidth` | `boolean` | `false` | When `true`, each tab becomes `flex: 1 0 0` — all tabs share the container width equally. Use for modals and narrow strips |

### Slots

- **Default** — place `<kp-tab>` children here.
- **`[kpTabsMore]`** — a single element (typically a `<button>`) rendered at the right edge of the strip. Common use: an overflow "More ▾" menu that opens a Popover or DropdownMenu with the hidden tabs.

## API — `<kp-tab>`

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Auto-set by parent `<kp-tabs>`. Only set directly for standalone tabs |
| `label` | `string` | `''` | Tab label text |
| `selected` | `boolean` | `false` | Visual active state + blue underline + selected `aria-selected` |
| `disabled` | `boolean` | `false` | Greys out the tab and suppresses click events |
| `fullWidth` | `boolean` | `false` | Auto-set by parent; applies `flex: 1 0 0` to this tab |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `selectedChange` | `EventEmitter<boolean>` | Fires `true` when the tab is clicked (not fired when disabled) |

### Slots

- **`[kpTabIcon]`** — leading icon. Use an SVG with `stroke="currentColor"` so it picks up the state-driven `--kp-color-tabs-tab-icon-*` color.
- **`[kpTabBadge]`** — trailing badge. Typically a `<kp-badge>` instance — the design system pairs xs pill badges for sm tabs and sm pill badges for md/lg tabs.

## States

Underline, label color, and icon color all shift through four visual states:

- **rest** — muted label + icon, transparent underline.
- **hover** — label + icon darken; underline appears as a thin gray hint.
- **selected** — label + icon take the blue role color; underline is a crisp 2 px blue line matching tab width.
- **disabled** — everything muted to `gray.300`; `cursor: not-allowed`; no click events propagate.

Focus is handled by `:focus-visible` on the underlying `<button>` with a standard focus ring; it stacks over whatever state is currently active.

## Accessibility

- `<kp-tabs>` carries `role="tablist"`.
- Each `<kp-tab>` carries `role="tab"`, `aria-selected`, and `aria-disabled` where applicable.
- Tabs participate in a roving tabindex: the selected tab has `tabindex="0"`, the others `tabindex="-1"`. Callers who need arrow-key navigation between tabs should wire it up themselves — this component intentionally doesn't own keyboard nav so it plays nicely with different focus-management strategies (CDK `FocusKeyManager`, custom, etc.).
- The underlying interactive element is a real `<button>`, so screen readers announce tabs as buttons within a tablist.

## Do / Don't

### Do
- Pair `<kp-tabs>` with your own state or router — the component is intentionally passive.
- Use `fullWidth` on narrow surfaces (modals, mobile) where tabs should distribute space; let them hug content on dashboards and full-width pages.
- Project real `<kp-badge>`s for counters rather than hand-rolling number chips in the tab.
- Keep tab labels short (ideally ≤ 16 chars); long labels force the row to wrap or truncate.

### Don't
- Don't render more than ~6 tabs inline. Beyond that, overflow into a `[kpTabsMore]` menu.
- Don't use Tabs for primary navigation between top-level sections of the app — that's the nav rail's job.
- Don't mix sizes in the same strip. Pick one.
- Don't hide the bottom border — it's the anchor the underline "rests" on and part of the tab affordance.

## References

- **Figma components**: [`Tab` atom](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3345-9059) · [`Tabs` container](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3347-9887)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-tabs
- **Source**: `packages/components/tabs/src/`
- **Tokens used**:
  - Track border: `tabs/track-border`
  - Tab fg per state: `tabs/tab/fg/{rest|hover|selected|disabled}`
  - Tab underline per state: `tabs/tab/underline/{rest|hover|selected|disabled}`
  - Tab icon per state: `tabs/tab/icon/{rest|hover|selected|disabled}`
  - Focus: `color/focus/ring`
  - Typography: palette Text Styles (`text/sm`, `text/md`) mapped by size

## Changelog

- `0.1.0` — Initial release. `<kp-tabs>` container with `size` + `fullWidth` + optional `[kpTabsMore]` slot. `<kp-tab>` atom with `[selected]` / `[disabled]` inputs, `[kpTabIcon]` / `[kpTabBadge]` slots, and a 2 px bottom-border active underline that matches the tab's exact width (including the full-width flex case).
