# Textarea

> Multi-line text entry for longer free-form input.

> **Status**: Contract defined; Figma and Angular implementations planned. Document written first per the contract-first rule.

## Contract

Textarea captures multi-line text — descriptions, messages, long-form fields. It shares Input's size/state grammar so an Input and Textarea with the same size sit flush in a form column. It adds two features Input lacks: a resize handle (by default, vertical-only) and a character counter for length-constrained fields.

### Anatomy

```
Container
└─ Content
   ├─ Textarea field (multi-line native <textarea>)
   ├─ Resize handle (bottom-right)
   └─ Counter (bottom-right when maxLength is set)
```

- **Container** — min-height tied to `size`, border, radius, padding
- **Textarea field** — native `<textarea>`, font and colors inherited
- **Resize handle** — vertical drag affordance at bottom-right corner
- **Counter** — "N / maxLength" text at bottom-right, red when approaching limit

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size — matches Input sm/md/lg |
| `placeholder` | `string` | `''` | Placeholder text |
| `rows` | `number` | `3` | Default visible rows before resize |
| `minRows` | `number` | `2` | Minimum rows the user can resize to |
| `maxRows` | `number` | `null` | Maximum rows; `null` = unlimited |
| `maxLength` | `number \| null` | `null` | Character limit; shows counter when set |
| `resize` | `'vertical' \| 'none'` | `'vertical'` | Enable or disable the resize handle |
| `disabled` | `boolean` | `false` | Non-interactive |
| `forceState` | `KpState \| null` | `null` | Force visual state — Storybook only |

### Outputs

Implements `ControlValueAccessor` — use `[(ngModel)]`. No custom outputs.

### Content projection

None — Textarea is a leaf component.

## Variants

| Dimension | Values |
|-----------|--------|
| Size | sm (min-height 64), md (min-height 88), lg (min-height 112) |
| Variant | default (bordered), filled (gray bg) — same as Input |
| State | rest, hover, active, focus, disabled, error |

## States

| State | Behavior |
|-------|----------|
| rest | Default idle, gray border |
| hover | Border darkens |
| active | Border darkens further — while typing |
| focus | Border turns primary blue |
| disabled | Gray bg, muted text, counter also muted, `aria-disabled="true"` |
| error | Red border, red counter text when near limit |

## Accessibility

- **Role**: native `<textarea>` — implicit role `textbox` (multiline)
- **Keyboard**: all native textarea keys; `Tab` escapes out of the field (no indent behavior)
- **ARIA**:
  - `aria-invalid="true"` when in error state
  - `aria-disabled="true"` when disabled
  - `aria-label` required for standalone use; otherwise labeled by surrounding FormField
  - When `maxLength` is set: `aria-describedby` references the counter for screen-reader context
- **Screen reader**: announces label, role "multiline edit", current value, remaining characters when near limit

## Do / Don't

### Do
- Wrap in FormField for label + helper + error messaging
- Use `maxLength` with a visible counter for length-limited content (tweets, SMS, summaries)
- Set `minRows` and `maxRows` to prevent the field from becoming too small or jumbotron-sized
- Match Textarea size with Input size in the same form column

### Don't
- Don't use Textarea for single-line input — use Input
- Don't hide the counter when `maxLength` is set — users need to know the constraint
- Don't allow horizontal resize by default — breaks layout in narrow columns
- Don't disable the resize handle entirely unless design explicitly requires a fixed height
- Don't set `maxLength` arbitrarily low — it's a real constraint, not a style choice

## References

- **Figma component**: `[figma-link]` — not yet created
- **Storybook**: `[planned]`
- **Source**: `[planned]` `packages/components/textarea/src/textarea.component.ts`
- **Tokens used**:
  - `input/bg`, `input/fg`, `input/border`, `input/placeholder` (State collection) — shared with Input
  - `input/variant-bg`, `input/variant-border` (Input Variant collection)
  - Counter red: `form/helper.error`

## Changelog

- `0.0.0` — Contract written; implementation pending
