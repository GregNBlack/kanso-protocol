# Tooltip

> Directive-based hint that attaches to any focusable element. Auto-shows on hover and focus, hides on leave / blur / Escape.

## Contract

`KpTooltipDirective` is the **only** public surface of `@kanso-protocol/ui/tooltip`. The visual body is an internal styled component (`kp-tooltip-internal`) that the directive instantiates at runtime — consumers don't import or template it.

Behavior:

- **Triggers:** `mouseenter` / `focusin` show after `kpTooltipDelay` ms. `mouseleave` / `focusout` hide after ~100ms. `Escape` hides immediately.
- **Positioning:** trigger-relative with viewport-edge flipping. If the requested side doesn't fit, the tooltip flips to the opposite side.
- **Portal:** rendered into the nearest open `<dialog>` (via `findPortalTarget` from `@kanso-protocol/ui`) or `document.body`, so the tooltip sits above modals.
- **A11y:** trigger gets `aria-describedby` pointing to the tooltip's unique id while visible.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `[kpTooltip]` | `string \| null` | `null` | Tooltip text. `null` or empty string disables the tooltip. |
| `kpTooltipPosition` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Preferred placement. Auto-flips when not enough viewport space. |
| `kpTooltipSize` | `'sm' \| 'md'` | `'md'` | Visual size. |
| `kpTooltipShortcut` | `string \| null` | `null` | Optional keyboard shortcut glyph (e.g. `'⌘K'`). |
| `kpTooltipDelay` | `number` | `500` | ms before showing after `mouseenter` / `focusin`. |
| `kpTooltipDisabled` | `boolean` | `false` | Hard-disable regardless of text. |

## Usage

### Basic

```html
<button kpButton [kpTooltip]="'Copy link'">Copy</button>
```

### With shortcut

```html
<button kpButton [kpTooltip]="'Quick search'" kpTooltipShortcut="⌘K">Search</button>
```

### Conditional

Pass `null` or empty string to suppress — useful when the label is only meaningful in certain states (e.g. when a sidebar is collapsed):

```html
<button [kpTooltip]="collapsed ? label : null" kpTooltipPosition="right">…</button>
```

### Position + size

```html
<button
  kpButton
  iconOnly
  [kpTooltip]="'Delete item'"
  kpTooltipPosition="bottom"
  kpTooltipSize="sm"
  aria-label="Delete">…</button>
```

## A11y

- Trigger automatically gets `aria-describedby` while the tooltip is visible. Screen readers read the tooltip text as a description of the trigger.
- Keyboard reachable: focus the trigger via Tab → tooltip appears after delay.
- `Escape` dismisses without losing focus on the trigger.
- The tooltip body has `role="tooltip"`; its decorative arrow SVG is `aria-hidden`.
- For icon-only buttons, the visible label is the tooltip text — also provide `aria-label` directly on the trigger so the accessible name is available without hover/focus.

## Implementation notes

- The directive does its own lightweight positioning math via `getBoundingClientRect` — no Floating UI dependency.
- `Escape` is listened at the document level so the trigger doesn't need to be focused.
- Touch devices: the directive doesn't open on `touchstart`. For touch-critical labels, render the text inline rather than rely on a tooltip.

## Migration from 2.0.x

The `<kp-tooltip>` component was removed. Replace any direct usage with the directive on the trigger:

**Before (2.0.x):**

```html
<button #btn (mouseenter)="open = true" (mouseleave)="open = false">Save</button>
@if (open) {
  <kp-tooltip [label]="'Save changes'" arrowPosition="bottom"/>
}
```

**After (3.x):**

```html
<button [kpTooltip]="'Save changes'" kpTooltipPosition="top">Save</button>
```

`KpTooltipDirective` replaces `KpTooltipComponent` as the exported symbol. `KpTooltipSize`, `KpTooltipArrowPosition`, `KpTooltipArrowAlign` are still exported (re-used internally), but `KpTooltipPosition` is the directive-facing placement enum.
