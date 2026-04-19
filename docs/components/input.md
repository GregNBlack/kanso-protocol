# Input

> Single-line text entry for forms and search.

## Contract

Input captures a single line of text from the user. It mirrors Button's anatomy — container + content + atomic elements — so size, radius, and typography line up pixel-perfect when Input and Button sit in the same row. Floating label is a variant reserved for larger sizes where vertical space permits.

### Anatomy

```
Container
└─ Content
   ├─ Icon Left (optional)
   ├─ Floating Label (lg, xl only)
   ├─ Placeholder
   ├─ Value (hidden by default)
   ├─ Clear Button (optional — shows when value is present and not disabled)
   └─ Icon Right (optional)
```

- **Container** — height, padding, border, radius, background, focus border
- **Content** — horizontal layout, gap, vertical centering
- **Icon Left / Icon Right** — optional icons, color follows `input/placeholder`
- **Floating Label** — small label above value on lg/xl when floated; sits inline at placeholder size when resting
- **Placeholder** — visible when empty, color `input/placeholder`
- **Value** — typed text, color `input/fg`
- **Clear Button** — sits before Icon Right; 16/20/24 square hit-area, 12/14/16 icon (Tabler `x`); background uses `input/clear-bg` (transparent → gray.100 on hover → gray.200 on active); icon uses `input/clear-icon` (gray.500 → gray.700 → gray.900). Hidden when disabled.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Component size |
| `type` | `string` | `'text'` | Native HTML input type |
| `placeholder` | `string` | `''` | Placeholder text |
| `label` | `string` | `''` | Floating label text (lg/xl only) |
| `floatingLabel` | `boolean` | `false` | Enable floating label pattern |
| `showClear` | `boolean` | `true` | Show clear (X) button whenever input has a value (disable to suppress) |
| `disabled` | `boolean` | `false` | Non-interactive |
| `forceState` | `KpState \| null` | `null` | Force visual state — Storybook / docs only |

### Outputs

Input implements `ControlValueAccessor` — use `(ngModelChange)` or reactive-form bindings. No custom outputs.

### Content projection

- `[kpInputIconLeft]` — icon inside the left padding area
- `[kpInputIconRight]` — icon inside the right padding area

## Variants

| Dimension | Values |
|-----------|--------|
| Size | xs (24px), sm (28px), md (36px), lg (44px), xl (52px) |
| Variant | default (transparent bg, border), filled (gray bg, no border) |
| State | rest, hover, active, focus, disabled, loading, error |

Variant and state are managed via Variable Modes (`Input Variant` + `State`), not as separate Figma variants. Only Size is a real variant property.

Floating Label is a boolean property available on lg and xl only — on smaller sizes the label wouldn't fit with proper vertical rhythm.

## States

| State | Behavior |
|-------|----------|
| rest | Default idle, gray border |
| hover | Border darkens |
| active | Border darkens further — shown while being typed into |
| focus | Border becomes primary blue (`input/border.focus`) |
| disabled | Gray bg, muted text, `aria-disabled="true"`, `pointer-events: none` |
| loading | Border stays at rest, optionally paired with external spinner |
| error | Red border (`input/border.error`), used together with helper text in FormField |

## Accessibility

- **Role**: native `<input type="...">` — implicit role `textbox`
- **Keyboard**: all native input keys; `Tab` to focus, `Shift+Tab` to leave
- **Focus**: visible 2px ring-equivalent via border color change (no outline, preserves input appearance)
- **ARIA**:
  - `aria-invalid="true"` when `forceState === 'error'`
  - `aria-disabled="true"` when disabled
  - Labeled via surrounding FormField's label or `aria-label` for standalone use
- **Screen reader**: announces label, type, current value, and error state when applicable

## Do / Don't

### Do
- Wrap Input in FormField for label + helper + error messaging
- Use floating label only on lg/xl where vertical space is sufficient
- Pair Input with Button of the same size in form rows
- Use `filled` variant on light backgrounds where a subtle surface lift helps grouping
- Show inline errors via FormField's `error` input, not by overriding Input colors

### Don't
- Don't use error state without an accompanying message — state alone isn't accessible
- Don't mix sm Input with md Button in the same row — sizes must match
- Don't disable Input on client-side validation — show error instead so user can fix
- Don't enable floating label on sm/md — the small label clashes with placeholder sizing
- Don't use placeholder as a replacement for a label — label is always required

## References

- **Figma component**: [`Input` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=123-97)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-input
- **Source**: `packages/components/input/src/input.component.ts`
- **Tokens used**:
  - `input/bg`, `input/fg`, `input/border`, `input/placeholder` (State collection)
  - `input/variant-bg`, `input/variant-border` (Input Variant collection)
  - `input/clear-bg`, `input/clear-icon` (State collection — for the clear button)
  - `form/floating-label` for the floated label
  - `primitive.sizing.{xs|sm|md|lg|xl}`, `primitive.radius.comp.{xs|sm|md|lg|xl}`
  - `font.family.sans`, `font.size.*`, `font.lineHeight.*`

## Changelog

- `0.1.0` — Initial component with 5 sizes, floating label on lg/xl, CVA integration
- `0.2.0` — Add optional Clear Button (`showClear`) with hover-highlight; resets value on click and auto-hides when disabled
- `0.2.1` — Clear button defaults to enabled (`showClear=true`); vertical center fix
