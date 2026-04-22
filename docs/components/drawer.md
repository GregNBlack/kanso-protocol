# Drawer

> Side panel that slides in from any of four edges. Same composition model as Dialog (header / body / footer slots, controlled `[(open)]` state, focus trap, Esc + backdrop close), but anchored to a screen edge instead of centered.

## Contract

`<kp-drawer>` renders a fixed-size panel anchored to the chosen `side` (right / left / top / bottom). The panel covers the full perpendicular dimension (height for right/left, width for top/bottom) and uses `size` to set the parallel dimension. Body content scrolls when it overflows.

For top/bottom sheets (mobile pattern), set `[showResizeHandle]="true"` to render a small drag bar.

### Anatomy

```
<kp-drawer [(open)]="show" size="md" side="right">
  ├─ .kp-drawer__backdrop                  (50% black overlay, click to close)
  └─ [role="dialog" aria-modal="true"]     (anchored to side)
     ├─ .kp-drawer__handle                 (top/bottom only, Show Resize Handle)
     ├─ .kp-drawer__header                 (Show Header)
     │   ├─ Title + Description            (Show Description)
     │   └─ Close button                   (Show Close)
     ├─ divider                            (Show Header Divider)
     ├─ .kp-drawer__body                   (slot — scrolls when overflowing)
     ├─ divider                            (Show Footer Divider)
     └─ .kp-drawer__footer                 (Show Footer)
```

### Sizes

For `side=right`/`side=left` the size controls panel **width**; for `side=top`/`side=bottom` it controls **height**:

| Size | Right/Left width | Top/Bottom height |
|------|------------------|-------------------|
| sm   | 320              | 240               |
| md   | 480              | 400               |
| lg   | 640              | 560               |
| xl   | 800              | 720               |

The perpendicular axis always covers 100% of the viewport. Border-radius is applied only to the corners facing into the screen (e.g. `side="right"` rounds top-left + bottom-left).

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Controlled open state |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Panel size on its parallel axis |
| `side` | `'right' \| 'left' \| 'top' \| 'bottom'` | `'right'` | Which screen edge the drawer is anchored to |
| `title` | `string` | `''` | Header title |
| `description` | `string` | `''` | Header secondary text |
| `showHeader` / `showDescription` / `showClose` / `showFooter` | `boolean` | various | Section toggles |
| `showResizeHandle` | `boolean` | `true` | Render the drag handle on top/bottom drawers (ignored on right/left) |
| `showHeaderDivider` / `showFooterDivider` | `boolean` | `false` | 1px rule between sections |
| `closeOnBackdrop` | `boolean` | `true` | Backdrop click closes drawer |
| `closeOnEsc` | `boolean` | `true` | Esc closes drawer |
| `ariaLabel` | `string` | `''` | Fallback for screen readers when `showHeader=false` |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `openChange` | `EventEmitter<boolean>` | Fires when open flips |
| `closed` | `EventEmitter<void>` | Fires once per close |

### Slots

- **`[kpDrawerBody]`** — body content. Set to scrollable layouts (forms, lists, etc).
- **`[kpDrawerFooter]`** — footer actions (typically Buttons).

## Behavior

Identical lifecycle to Dialog: scroll lock on open, focus trap inside the panel, focus restored to the previous element on close. The overlay root is portaled to `document.body` after view init, so transformed/clipped ancestors (including Storybook story preview containers) don't constrain the fixed-positioned panel.

Each `side` has its own slide-in animation; backdrop fades in independently.

## Accessibility

- Panel has `role="dialog"` + `aria-modal="true"`.
- `aria-labelledby` points at the title; `aria-label` is the fallback when no header is shown.
- Resize handle is `aria-hidden="true"` (decorative).

## Do / Don't

### Do
- Use `side="right"` for editing flows next to the canvas (settings, profile, item details).
- Use `side="left"` for navigation / filters that mirror your app's primary nav.
- Use `side="bottom"` + `showResizeHandle` for mobile sheets where the user might drag to expand.
- Use `side="top"` sparingly — best for ephemeral tray content (notifications, command palettes).

### Don't
- Don't put the same content in a Drawer and a Dialog. Pick one based on context: Dialog interrupts; Drawer is contextual to the page.
- Don't disable Esc + backdrop close together. Always leave one way out unless you're inside a critical confirm flow.
- Don't nest drawers. If you need a sub-flow, push the new content into the same drawer body or open a Dialog on top.

## References

- **Figma component**: [`Drawer` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3476-8207)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-drawer
- **Source**: `packages/components/drawer/src/`
- **Tokens used**:
  - Reuses Dialog tokens: `dialog/backdrop`, `dialog/panel-bg`, `dialog/panel-border`, `dialog/fg-title`, `dialog/fg-desc`, `dialog/fg-body`, `dialog/divider`
  - Drawer-specific: `drawer/resize-handle`

## Changelog

- `0.1.0` — Initial release. Four sides (right/left/top/bottom) × four sizes (sm/md/lg/xl), shared composition + behavior with Dialog, optional resize handle for top/bottom sheets.
