# Radio

> Mutually-exclusive choice within a group.

## Contract

Radio represents one option in a set where exactly one must be selected. Selecting a Radio deselects its siblings in the same group. Use RadioGroup to coordinate selection — standalone Radios don't enforce mutual exclusion. Visually distinct from Checkbox: Radio's outer fill stays white when checked; only the border and inner dot turn colored.

### Anatomy

```
Container (circle, full border-radius)
├─ dot (ellipse, opacity: 0 in unchecked)
└─ (optional) label via ng-content
```

- **Container** — circular (border-radius = size/2), border width by size, fill stays `control/bg` (white) always
- **dot** — centered inner circle, opacity toggles on `--checked`; fill is `control/bg-checked`
- **label** — projected content shown right of the circle when `hasLabel` is true

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `color` | `'primary' \| 'danger'` | `'primary'` | Color role |
| `value` | `unknown` | `null` | Value emitted/compared when inside a RadioGroup |
| `checked` | `boolean` | `false` | Standalone checked state (ignored inside a group) |
| `disabled` | `boolean` | `false` | Non-interactive |
| `forceState` | `KpState \| null` | `null` | Force visual state — Storybook only |
| `hasLabel` | `boolean` | `true` | Show the projected label |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `checkedChange` | `boolean` | Standalone Radio becomes checked |

Inside a RadioGroup, selection flows through the group's `(valueChange)` — individual Radios don't emit.

### Content projection

- `ng-content` — label text

## RadioGroup

Accompanying component `<kp-radio-group>` provides:

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `value` | `unknown` | `null` | Currently selected value |
| `name` | `string` | `''` | Shared name for form submission |
| `disabled` | `boolean` | `false` | Disables all contained radios |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction |

| Output | Payload | Fires when |
|--------|---------|------------|
| `valueChange` | `unknown` | User selects a different radio |

## Variants

| Dimension | Values |
|-----------|--------|
| Size | sm (16px, stroke 1, dot 6), md (20px, stroke 1.5, dot 8), lg (24px, stroke 1.5, dot 10) |
| Checked | unchecked, checked |
| Color | primary, danger |
| State | rest, hover, active, focus, disabled, error |

## States

| State | Behavior |
|-------|----------|
| rest | Unchecked: gray border, white fill. Checked: colored border, colored dot, white fill. |
| hover | Border darkens |
| active | Border darkens further |
| focus | 2px focus ring, offset 2px |
| disabled | Muted border and dot; `aria-disabled="true"`; `pointer-events: none` |
| error | Red border; paired with FormField error |

## Accessibility

- **Role**: `radio` on the Radio itself; `radiogroup` on the group
- **Keyboard**:
  - `Tab` moves focus into the group
  - `Arrow keys` move selection within the group (native browser behavior)
  - `Space` activates the focused radio
- **Focus**: 2px ring via `outline`, offset 2px
- **ARIA**:
  - `aria-checked="true" | "false"`
  - `aria-disabled="true"` when disabled
  - RadioGroup gets `role="radiogroup"` and should have `aria-labelledby` or `aria-label`
- **Screen reader**: announces label, role, position in group (e.g. "Option 2 of 3"), and checked state

## Do / Don't

### Do
- Always wrap Radios in `<kp-radio-group>` — this enforces single-select
- Provide visible labels next to each Radio
- Order options by importance or frequency of use, not alphabetically
- Include an explicit "None" option when opting out is meaningful
- Use at least 2 options — Radio with a single option is a bug

### Don't
- Don't use Radio for boolean yes/no — use Checkbox or Toggle
- Don't use indeterminate — that's a Checkbox-only concept
- Don't disable individual radios within a group purely for validation — show inline error
- Don't mix sizes in the same group — all radios in a group share one size
- Don't rely on color alone to indicate selection — the dot is the primary signal

## References

- **Figma component**: [`Radio` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3066-628)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-radio
- **Source**:
  - `packages/components/radio/src/radio.component.ts`
  - `packages/components/radio/src/radio-group.component.ts`
- **Tokens used**:
  - `control/bg`, `control/border`, `control/border-checked`, `control/bg-checked` (State collection)
  - Outer fill always `color/white`; border and dot colored per state

## Changelog

- `0.1.0` — Initial component with 3 sizes × 2 checked states, primary/danger color
- `0.1.1` — Added `KpRadioGroupComponent` for single-select coordination
