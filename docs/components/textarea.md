# Textarea

> Multi-line text entry for longer free-form input.

## Contract

Textarea captures multi-line text — descriptions, messages, long-form fields. It shares Input's size/state grammar so an Input and Textarea with the same size sit flush in a form column. It adds two features Input lacks: a resize handle (both axes by default) and a character counter for length-constrained fields.

### Anatomy

```
Container (host)
├─ Textarea field (native <textarea>, fills host; flex 1)
├─ Counter (absolute bottom-right, when showCounter is true)
└─ Grip (absolute bottom-right, custom SVG — shown when resize !== 'none')
```

- **Container / host** — border, radius, background; hosts the textarea and absolute overlays
- **Textarea field** — native `<textarea>` with transparent background, its own padding (pad-y/pad-x + 22px bottom to reserve space for counter/grip), thin custom scrollbar (4px visible + 2px inset)
- **Counter** — "N/maxLength" text, absolute bottom-right, color gray/400, has the host's background color so it reads cleanly over text
- **Grip** — 10×10 SVG with two diagonal strokes, absolute bottom-right, `pointer-events: none` so the native resize drag still fires through it (the native `::-webkit-resizer` is visually hidden)

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size — matches Input sm/md/lg |
| `placeholder` | `string` | `''` | Placeholder text |
| `rows` | `number` | `3` | Default visible rows |
| `maxLength` | `number \| null` | `null` | Character limit (shown by counter) |
| `showCounter` | `boolean` | `false` | Show the "N/maxLength" counter |
| `resize` | `'both' \| 'vertical' \| 'horizontal' \| 'none'` | `'both'` | Direction the user can drag to resize |
| `filled` | `boolean` | `false` | Filled variant (gray bg, no border) |
| `disabled` | `boolean` | `false` | Non-interactive |
| `forceState` | `KpState \| null` | `null` | Force visual state — Storybook only |

### Outputs

Implements `ControlValueAccessor` — use `[(ngModel)]` or reactive-form bindings. No custom outputs.

### Content projection

None — Textarea is a leaf component.

## Variants

| Dimension | Values |
|-----------|--------|
| Size | sm (min-height 60), md (min-height 72), lg (min-height 88) |
| Variant | default (white + border), filled (gray bg, transparent border) |
| State | rest, hover, active, focus, disabled, error |
| Resize | both (default), vertical, horizontal, none |

## States

| State | Behavior |
|-------|----------|
| rest | Default idle, gray border |
| hover | Border darkens |
| active | Border darkens further — while typing |
| focus | Border turns primary blue |
| disabled | Gray bg, muted text, `aria-disabled="true"` |
| error | Red border |

## Accessibility

- **Role**: native `<textarea>` — implicit role `textbox` (multiline)
- **Keyboard**: all native textarea keys; `Tab` escapes out of the field (no indent behavior)
- **ARIA**:
  - `aria-invalid="true"` when in error state
  - `aria-disabled="true"` when disabled
  - `aria-label` required for standalone use; otherwise labeled by surrounding FormField
  - When `maxLength` is set: `aria-describedby` should reference the counter for screen-reader context
- **Screen reader**: announces label, role "multiline edit", current value; counter read as context when focused near the limit

## Do / Don't

### Do
- Wrap in FormField for label + helper + error messaging
- Use `maxLength` with `showCounter` for length-limited content (tweets, SMS, summaries)
- Match Textarea size with Input size in the same form column
- Leave `resize='both'` in most form contexts — users usually want vertical, occasionally horizontal
- Switch to `resize='vertical'` in narrow columns where widening would break the layout

### Don't
- Don't use Textarea for single-line input — use Input
- Don't hide the counter when `maxLength` is set — users need to know the constraint
- Don't disable resize entirely unless the surrounding layout strictly requires a fixed height
- Don't set `maxLength` arbitrarily low — it's a real constraint, not a style choice
- Don't override counter / grip positioning via custom CSS — use component props

## References

- **Figma component**: [`Textarea` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3092-729)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-textarea
- **Source**: `packages/components/textarea/src/textarea.component.ts`
- **Tokens used**:
  - `input/bg`, `input/fg`, `input/border`, `input/placeholder` (State collection) — shared with Input
  - `input/variant-bg`, `input/variant-border` (Input Variant collection)
  - Counter color: `gray.400`; background inherits from host for legibility over text

## Changelog

- `0.1.0` — Initial component with 3 sizes, vertical resize, optional counter, CVA integration
- `0.2.0` — Replace native resize grip with custom 10×10 SVG grip; thin custom scrollbar (4px + 2px inset)
- `0.3.0` — Resize defaults to 'both'; add 'horizontal' option alongside 'vertical' and 'none'
