# Checkbox

> Binary or tri-state toggle for independent options.

## Contract

Checkbox represents a boolean choice that doesn't depend on siblings — "I agree", "Show advanced options", "Include attachments". In a group, each Checkbox is independent: toggling one doesn't affect others. The indeterminate state is for parent rows controlling a set of children (partially selected).

### Anatomy

```
Container (square)
├─ check icon (SVG, opacity: 0 in unchecked)
├─ minus bar (rectangle, opacity: 0 unless indeterminate)
└─ (optional) label via ng-content
```

- **Container** — fixed square, border, background, radius; colors driven by checked state
- **check icon** — rendered always, opacity toggles on `--checked`
- **minus bar** — horizontal rectangle, opacity toggles on `--indeterminate`
- **label** — projected via `ng-content`, shown only when `hasLabel` is true

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `color` | `'primary' \| 'danger'` | `'primary'` | Color role (danger for "delete permanently" confirmations) |
| `checked` | `boolean` | `false` | Current checked value |
| `indeterminate` | `boolean` | `false` | Shows minus bar; takes precedence over `checked` visually |
| `disabled` | `boolean` | `false` | Non-interactive |
| `forceState` | `KpState \| null` | `null` | Force visual state — Storybook only |
| `hasLabel` | `boolean` | `true` | Show the projected label slot |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `checkedChange` | `boolean` | User toggles the state |

Implements `ControlValueAccessor` — use `[(ngModel)]` or reactive-form bindings.

### Content projection

- `ng-content` — label text

## Variants

| Dimension | Values |
|-----------|--------|
| Size | sm (16px, stroke 1), md (20px, stroke 1.5), lg (24px, stroke 1.5) |
| Checked | unchecked, checked, indeterminate |
| Color | primary, danger |
| State | rest, hover, active, focus, disabled, error |

## States

| State | Behavior |
|-------|----------|
| rest | Unchecked: gray border. Checked: solid fill. |
| hover | Border or fill darkens one step |
| active | Border or fill darkens two steps |
| focus | 2px focus ring, offset 2px |
| disabled | Muted fill and border; `aria-disabled="true"`; `pointer-events: none` |
| error | Red border; used together with FormField error |

## Accessibility

- **Role**: `checkbox`
- **Keyboard**: `Space` toggles; `Tab` to focus
- **Focus**: 2px focus ring via `outline`, offset 2px
- **ARIA**:
  - `aria-checked="true" | "false" | "mixed"` (mixed when indeterminate)
  - `aria-disabled="true"` when disabled
  - `aria-label` required when no visible label
- **Screen reader**: announces label, role, and checked state (including "mixed")

## Do / Don't

### Do
- Use for independent boolean choices ("Remember me", "Subscribe")
- Use indeterminate on parent rows that represent a partially-selected set of children
- Pair sm/md with form-body sizes; lg only for touch or marketing
- Use `danger` color only when the checkbox confirms an irreversible destructive action

### Don't
- Don't use Checkbox for mutually-exclusive choices — use Radio
- Don't use indeterminate as a third user-selectable value — it's a computed state
- Don't remove `aria-label` on icon-only checkboxes (no visible text)
- Don't toggle `disabled` purely from client-side validation — show inline error instead

## References

- **Figma component**: [`Checkbox` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3066-490)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-checkbox
- **Source**: `packages/components/checkbox/src/checkbox.component.ts`
- **Tokens used**:
  - `control/bg`, `control/bg-checked`, `control/border`, `control/border-checked`, `control/fg` (State collection)
  - `control/bg-checked` / `control/border-checked` overrides for `danger` appearance
  - `primitive.radius.comp.xs` for sm, `primitive.radius.comp.sm` for md/lg

## Changelog

- `0.1.0` — Initial component with 3 sizes × 3 checked states, primary/danger color, CVA integration
