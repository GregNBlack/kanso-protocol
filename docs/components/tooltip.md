# Tooltip

> Dark, compact hint body with an optional directional arrow. Visual chrome only — positioning, show/hide, and portaling are the caller's responsibility.

## Contract

Tooltip is the *body* of a tooltip — a small dark bubble with a label, an optional keyboard shortcut, and an optional arrow pointing at a trigger. It deliberately does **not** know about the element it describes: there is no `trigger` input, no hover listener, no floating-UI positioning. Pair it with a directive (or CDK overlay, or your own portal) to wire it up. This separation keeps the visual contract stable across different positioning implementations.

### Anatomy

```
Host (inline-flex)
├─ Arrow    (SVG, absolute-positioned outside the body when arrowPosition != 'none')
├─ Label    (text)
└─ Shortcut (<kbd>, monospace, muted gray)
```

- **Arrow** — an SVG triangle that sits flush outside the body on the requested edge. The arrow's fill matches the body background; it renders only when `arrowPosition !== 'none'`.
- **Label** — the hint text. Wraps within `max-width: 240px`. Medium weight.
- **Shortcut** — an optional keyboard shortcut rendered in a monospace family so `⌘`, `⇧`, and other glyphs line up predictably. Muted to avoid competing with the label.

### Sizes

| Size | Padding (x × y) | Radius | Gap | Font | Arrow (base × height) |
|------|-----------------|--------|-----|------|-----------------------|
| sm   | 10 × 6          | 6      | 8   | 12   | 8 × 6                 |
| md   | 12 × 8          | 8      | 10  | 14   | 10 × 7                |

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md'` | `'md'` | Component size |
| `arrowPosition` | `'none' \| 'top' \| 'right' \| 'bottom' \| 'left'` | `'none'` | Which edge the arrow points out from |
| `label` | `string` | `''` | The hint text |
| `shortcut` | `string \| null` | `null` | Optional keyboard-shortcut glyph string (e.g. `'⌘K'`). Rendered as `<kbd>` when non-empty |

### Outputs

None. Tooltip is passive — all interaction is owned by whatever positions it.

## Usage

### Just the body (for layout playgrounds)

```html
<kp-tooltip label="Delete" arrowPosition="bottom"/>
```

### Composed with a trigger (typical production use)

Tooltip ships *without* a directive, on purpose — teams tend to already have a positioning layer (CDK Overlay, Floating UI, or a house-built portal). Plug the component in as the body your directive renders:

```ts
// Pseudocode — real impl depends on your overlay stack.
const ref = overlay.create({ positionStrategy: flexibleConnectedTo(trigger, 'top') });
const portal = new ComponentPortal(KpTooltipComponent);
const instance = ref.attach(portal).instance;
instance.label = 'Delete';
instance.arrowPosition = 'bottom';
```

### Inline static example (mostly for docs / Storybook)

```html
<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
  <kp-tooltip arrowPosition="bottom" label="Delete"/>
  <button aria-label="Delete">✕</button>
</div>
```

## Variants

| Dimension | Values |
|-----------|--------|
| Size | sm, md |
| Arrow position | none, top, right, bottom, left |

## States

Tooltip is non-interactive and has no hover / focus / disabled states on its own. When wired up via a directive the usual UX is:

- Show after a ~500 ms hover delay (or immediately on keyboard focus)
- Hide on `mouseleave`, `blur`, or `Escape`
- Don't trap focus; the trigger keeps focus

## Accessibility

- Host has `role="tooltip"` — screen readers announce the label when the trigger carries `aria-describedby="<tooltip-id>"`.
- When you project Tooltip, set a stable `id` on the tooltip element and point the trigger's `aria-describedby` at it. This is the contract that makes the tooltip announceable; without it, SR users won't hear the text.
- Don't put essential information in a tooltip. Tooltips are progressive disclosure; the trigger must be usable without ever showing the tooltip.
- The shortcut is rendered as `<kbd>`, which communicates "keyboard input" to SRs. Keep it short and glyph-based (`⌘K`, `⇧⌘P`).
- Closing: the directive / overlay that owns the tooltip should dismiss it on `Escape`.

## Do / Don't

### Do
- Use tooltips for short, non-essential hints — icon-only buttons, truncated labels, secondary affordances.
- Keep labels under ~60 characters. If you need more, switch to a Popover or description text.
- Use the `arrow` to clearly tie the tooltip to its trigger, especially when the tooltip floats above unrelated content.
- Use the shortcut slot for real keyboard shortcuts — `⌘K`, not "click to open".

### Don't
- Don't put interactive content (buttons, links) inside a tooltip — use Popover instead.
- Don't show tooltips on touch-only triggers — there's no hover. Either rely on a visible label, or use a long-press Popover.
- Don't replace the accessible name of a control with a tooltip. The trigger must have its own `aria-label` or text content.
- Don't stack tooltips on tooltips — there's only ever one hint active per trigger.

## References

- **Figma component**: [`Tooltip` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3256-6950)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-tooltip
- **Source**: `packages/components/tooltip/src/tooltip.component.ts`
- **Tokens used**:
  - Background: `tooltip/bg`
  - Label text: `tooltip/fg`
  - Shortcut text: `tooltip/shortcut`
  - Border: `tooltip/border`
  - Typography: palette Text Styles (`text/xs`, `text/sm`) mapped by size
  - Shortcut font: platform monospace stack (`ui-monospace`, falling back to `JetBrains Mono`, `Menlo`, `Consolas`)

## Changelog

- `0.1.0` — Initial component. 2 sizes × 5 arrow positions, optional keyboard-shortcut slot (`<kbd>`, monospace), max-width wrapping at 240px. Dark chrome driven by the generated `--kp-color-tooltip-*` custom properties. Positioning is intentionally left to the caller — no directive ships in this release.
