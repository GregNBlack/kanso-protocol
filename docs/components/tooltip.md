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
| `arrowAlign` | `'start' \| 'center' \| 'end'` | `'center'` | Where along the edge the arrow sits. `start`/`end` shift the arrow to the corner, letting the body extend inward — used when the trigger is near a viewport edge |
| `label` | `string` | `''` | The hint text |
| `shortcut` | `string \| null` | `null` | Optional keyboard-shortcut glyph string (e.g. `'⌘K'`). Rendered as `<kbd>` when non-empty |

### Outputs

None. Tooltip is passive — all interaction is owned by whatever positions it.

## Positioning contract

Tooltip itself is passive — it doesn't know where the trigger is. The
caller (directive / overlay layer / script) is responsible for choosing
`arrowPosition` + `arrowAlign` so the rendered body fits inside the
viewport and the arrow stays anchored to the trigger.

These are the binding rules. Implement them in your positioning directive
once; the tooltip will then auto-render correctly at any trigger
location.

### Step 1 — pick `arrowPosition` (which side of the trigger to render on)

Measure trigger via `getBoundingClientRect()`, measure tooltip body
(or estimate from label length), and check whether each side has room:

```ts
const triggerRect = trigger.getBoundingClientRect();
const tooltipW = estimatedTooltipWidth;   // e.g. min(label-width, 240) + 24
const tooltipH = estimatedTooltipHeight;  // depends on label wrap
const arrow   = 8;                         // arrow extension beyond body
const gap     = 4;                         // breathing room

const spaceTop    = triggerRect.top - arrow - gap;
const spaceBottom = window.innerHeight - triggerRect.bottom - arrow - gap;
const spaceLeft   = triggerRect.left - arrow - gap;
const spaceRight  = window.innerWidth - triggerRect.right - arrow - gap;
```

Preference order:

1. **`bottom`** (tooltip above trigger) — preferred default for most cases
2. **`top`** (tooltip below trigger) — fallback when `spaceTop < tooltipH`
3. **`right`** / **`left`** — only when vertical space is too tight in
   both directions, OR when the trigger is in a vertically-tall context
   (sidebar nav, table cell)

Rule of thumb:

```ts
if (spaceBottom >= tooltipH)       return 'top';     // arrow on top of body → body below trigger
if (spaceTop    >= tooltipH)       return 'bottom';  // arrow on bottom → body above trigger
if (spaceRight  >= tooltipW)       return 'left';    // arrow on left → body to the right
if (spaceLeft   >= tooltipW)       return 'right';   // arrow on right → body to the left
return 'top';                                         // last-resort: top with clipping
```

> Note: `arrowPosition` names the edge of the *tooltip* the arrow
> emerges from. So `arrowPosition="top"` means the arrow is on top of
> the tooltip body → the body sits BELOW the trigger.

### Step 2 — pick `arrowAlign` (where along that edge the arrow sits)

Compute the trigger's centre on the cross-axis and compare against the
tooltip body's edges:

```ts
const tcx = triggerRect.left + triggerRect.width / 2;   // trigger center x
const tcy = triggerRect.top  + triggerRect.height / 2;  // trigger center y
const arrowInset = size === 'md' ? 12 : 10;              // matches CSS var
```

For **horizontal arrows** (`top` / `bottom`) — pick alignment by trigger X:

| Trigger position | `arrowAlign` | Body extends |
|---|---|---|
| Trigger centre within [`tooltipW/2`, `viewport - tooltipW/2`] | `center` | Both sides equally |
| Trigger near LEFT edge (`tcx < tooltipW/2`) | `start` | To the right |
| Trigger near RIGHT edge (`tcx > viewport - tooltipW/2`) | `end` | To the left |

For **vertical arrows** (`left` / `right`) — same logic, but Y axis:

| Trigger position | `arrowAlign` |
|---|---|
| Trigger centre within [`tooltipH/2`, `viewport - tooltipH/2`] | `center` |
| Trigger near TOP edge (`tcy < tooltipH/2`) | `start` |
| Trigger near BOTTOM edge (`tcy > viewport - tooltipH/2`) | `end` |

### Step 3 — compute the body's `top`/`left` so the arrow lines up

The arrow centre must sit over the trigger centre. The body's edge
position depends on `arrowAlign`:

```ts
// Horizontal arrow (top / bottom)
const arrowX =
  align === 'center' ? tooltipW / 2 :
  align === 'start'  ? arrowInset  :
  /* end */            tooltipW - arrowInset;
const bodyLeft = tcx - arrowX;

// Vertical arrow (left / right) — same idea on Y
const arrowY =
  align === 'center' ? tooltipH / 2 :
  align === 'start'  ? arrowInset  :
  /* end */            tooltipH - arrowInset;
const bodyTop = tcy - arrowY;
```

Final clamp: ensure `bodyLeft >= 0` and `bodyLeft + tooltipW <=
window.innerWidth` (and analogously for Y). If a clamp fires, the
alignment was wrong — go back to step 2 and pick the alignment whose
arrow is closer to the clamped edge.

### Summary — auto-pick decision table

| Trigger zone | `arrowPosition` | `arrowAlign` |
|---|---|---|
| Centre of viewport | `top` (default) | `center` |
| Near LEFT edge, room below | `top` | `start` |
| Near RIGHT edge, room below | `top` | `end` |
| Near BOTTOM edge of viewport | `bottom` | (mirror left/right alignment) |
| Near TOP edge of viewport | `top` | (mirror) |
| Tight on vertical, room right | `left` | `start` / `center` / `end` based on Y |
| Tight on vertical, room left | `right` | `start` / `center` / `end` based on Y |

Implement this once in a directive (`[kpTooltipTrigger]`) — every
consumer of `<kp-tooltip>` gets it for free.

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
