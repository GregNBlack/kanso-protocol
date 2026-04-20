# Popover

> Floating panel with optional header / body / footer and a directional arrow. Visual chrome only — positioning, show/hide and portaling are the caller's responsibility.

## Contract

Popover is the *body* of a floating panel — a card with header, body, footer, and an optional pointer-arrow attaching it to a trigger. Like Tooltip, it deliberately does **not** own positioning or lifecycle: no trigger input, no hover/focus wiring, no floating-UI placement. Plug it into your overlay stack (CDK Overlay, Floating UI, a portal) and let Popover be the content.

This keeps the visual contract stable across wildly different positioning implementations, which is exactly what "I already have an overlay layer" teams need.

### Anatomy

```
Host (inline-block, filter: drop-shadow)
├─ Body
│   ├─ Header         (optional — Title + Description + Close)
│   │   ├─ Text
│   │   │   ├─ Title
│   │   │   └─ Description   (optional)
│   │   └─ Close             (optional)
│   ├─ Header Divider (optional)
│   ├─ Content slot   (default <ng-content>)
│   ├─ Footer Divider (optional — only when Footer is on)
│   └─ Footer         (optional — projected via [kpPopoverFooter])
└─ Arrow              (optional — 12 positions: 4 sides × 3 anchors)
```

The host uses `filter: drop-shadow()` (not a `box-shadow` on the body). `drop-shadow` follows the **combined silhouette** of the body rectangle and the triangular arrow, so the shadow wraps around the arrow naturally and grows with content. This is what you get in the Figma source with a Group-as-container; the CSS mirrors it one-for-one.

### Sizes

| Size | Width | Padding | Gap (sections) | Gap (title↔desc) | Radius | Close | Arrow (b × h) |
|------|-------|---------|----------------|------------------|--------|-------|---------------|
| sm   | 280   | 12      | 8              | 2                | 10     | 20    | 10 × 7        |
| md   | 360   | 16      | 12             | 4                | 12     | 24    | 12 × 8        |
| lg   | 480   | 20      | 16             | 4                | 14     | 24    | 12 × 8        |

Text styles:
- **sm**: Title = `text/sm` medium, Description = `text/xs`, Body = `text/sm`
- **md**: Title = `text/md` medium, Description = `text/sm`, Body = `text/sm`
- **lg**: Title = `text/lg` medium, Description = `text/md`, Body = `text/md`

### Arrow positions

12 positions total: **top / right / bottom / left** sides × **start / center / end** anchors. Pick by where the trigger sits relative to the popover:

- **top-start / top-center / top-end** — popover sits *below* a trigger; arrow points up at the trigger.
- **bottom-\*** — popover sits *above* a trigger.
- **left-\*** — popover sits to the *right* of a trigger.
- **right-\*** — popover sits to the *left* of a trigger.

The "start / center / end" anchor shifts the arrow along that edge (16 px from the corner, center, or 16 px from the other corner). Use `'none'` when you don't want the arrow at all.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `arrowPosition` | `KpPopoverArrowPosition` | `'none'` | One of 13 values (none + 12 side/anchor combos) |
| `title` | `string` | `''` | The header title text |
| `description` | `string` | `''` | Supporting description under the title. Hidden when empty |
| `showHeader` | `boolean` | `true` | Render the entire header (title + close) |
| `showHeaderDivider` | `boolean` | `false` | Thin divider between header and body |
| `showFooter` | `boolean` | `false` | Render the footer slot |
| `showFooterDivider` | `boolean` | `true` | Divider between body and footer; ignored when `showFooter` is false |
| `closable` | `boolean` | `true` | Render the ✕ close button in the header |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `close` | `EventEmitter<MouseEvent>` | Fires when the close button is clicked |

### Content projection

- **Default slot** — body content. Strings, inline layouts, nested components all work.
- **`[kpPopoverFooter]` slot** — any number of footer controls (typically two buttons: Cancel + Confirm). Stacked horizontally, justified to the right, 8 px gap.

```html
<kp-popover size="sm" arrowPosition="top-center"
            title="Delete this item?" description="This action cannot be undone."
            [closable]="false" [showFooter]="true"
            (close)="cancel()">
  Body content goes here.

  <kp-button kpPopoverFooter size="sm" variant="ghost" color="neutral">Cancel</kp-button>
  <kp-button kpPopoverFooter size="sm" color="danger">Delete</kp-button>
</kp-popover>
```

## Variants

| Dimension | Values |
|-----------|--------|
| Size | sm, md, lg |
| Arrow position | none, top-start, top-center, top-end, right-start, right-center, right-end, bottom-start, bottom-center, bottom-end, left-start, left-center, left-end |

## States

Popover is **non-interactive by default** — the body is a static panel. The only interactive affordances are whatever you project inside (buttons in footer, form controls in body) plus the optional close button, which owns its own hover / focus styles.

When you wire the popover up to a trigger, the usual UX is:

- Open on click (not hover) — popovers are longer-lived than tooltips
- Dismiss on outside click, `Escape`, or the built-in close button
- When the popover contains interactive content, focus moves into the popover on open and returns to the trigger on close (focus-trap behavior is the overlay layer's job, not this component's)

## Accessibility

- Host has `role="dialog"` — screen readers announce the content as a dialog.
- Pair the trigger with `aria-haspopup="dialog"` and `aria-expanded` while open. Point `aria-controls` at the popover's `id`.
- Provide an accessible name via the header title, or set `aria-label` on the popover explicitly if no header is present.
- The close button is a real `<button>` with `aria-label="Close"`.
- Do not rely on the arrow for meaning — it's decorative; the popover content must stand on its own.

## Do / Don't

### Do
- Use for contextual, click-triggered panels: confirmation prompts, share menus, secondary options, quick forms.
- Keep content focused — one decision, one form, one menu. If it grows past ~ three actions, consider a Dialog/Modal.
- Pair `danger` styling in the footer with a neutral "Cancel" so the destructive action has a counterpart.
- Use an arrow whenever the popover's relationship to a trigger isn't obvious.

### Don't
- Don't nest Popover inside Popover — flatten the flow into a single panel.
- Don't replace a Modal with a Popover for blocking confirmations (unsaved work, destructive actions that need full attention).
- Don't use a Popover for a fleeting hint — that's Tooltip.
- Don't rely on the default `showFooterDivider` when `showFooter` is off; the component hides the whole footer group (divider + footer) together, but it's cleaner to set `showFooter` explicitly.

## References

- **Figma component**: [`Popover` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3271-8580)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-popover
- **Source**: `packages/components/popover/src/popover.component.ts`
- **Tokens used**:
  - Background: `popover/bg`
  - Border / divider: `popover/divider` (1px lines inside)
  - Title: `popover/fg-title`
  - Description: `popover/fg-desc`
  - Body: `popover/fg-body`
  - Focus ring (close): `color/focus/ring`
  - Typography: palette Text Styles (`text/xs` through `text/lg`) mapped by size
  - Shadow: layered `filter: drop-shadow()` stack applied to the host

## Changelog

- `0.1.0` — Initial component. 3 sizes × 13 arrow positions, optional header / footer / dividers, projected body and `[kpPopoverFooter]` slots, close affordance with `close` event. Layered `filter: drop-shadow()` on the host so the shadow follows the combined body+arrow silhouette and resizes automatically with content. Positioning is intentionally left to the caller.
