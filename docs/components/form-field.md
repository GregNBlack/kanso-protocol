# FormField

> Wrapper that adds label and helper text to any form control.

## Contract

FormField is the single composition primitive for form rows. It doesn't have its own size — it defers to the control inside. Everything a form row needs that isn't the control itself — label, required marker, helper/error text, disabled cascade — lives here. Controls (Input, Checkbox, Radio, Toggle) stay focused on their specific responsibilities.

### Anatomy

```
Container (vertical stack, gap 8px)
├─ Label Row (horizontal, gap 4px, align-baseline)
│  ├─ Label text
│  └─ Required/optional marker (asterisk or "(optional)")
├─ Control Slot (ng-content)
└─ Helper text (turns red when error=true)
```

- **Container** — vertical auto-layout, width: 100% by default
- **Label Row** — label + optional required indicator, baseline-aligned
- **Control Slot** — projected content; typically an Input, Textarea, or Radio group
- **Helper** — guidance or error text below; hidden when `showHelper=false`

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | Field label |
| `helper` | `string` | `''` | Helper or error text below the control |
| `required` | `'none' \| 'optional' \| 'required-asterisk'` | `'none'` | Required indicator mode |
| `showHelper` | `boolean` | `true` | Show the helper area |
| `error` | `boolean` | `false` | Apply error styling to label and helper |
| `disabled` | `boolean` | `false` | Cascade disabled styling to label and helper |

### Outputs

None — FormField is pure presentation. The wrapped control carries state and emits changes.

### Content projection

- `ng-content` — the form control itself (Input, Checkbox, Radio group, etc.)

## Variants

| Dimension | Values | Notes |
|-----------|--------|-------|
| Required Mode | none, optional, required-asterisk | Variant property in Figma |
| Size | — | FormField has no size of its own; size is inherited from the nested control |

## States

FormField doesn't have interactive states of its own. It reacts to two inputs:

| Condition | Behavior |
|-----------|----------|
| `error=true` | Label turns red (`form/label.error`); helper turns red (`form/helper.error`) |
| `disabled=true` | Label and helper turn muted gray (`form/label.disabled`, `form/helper.disabled`) |

The nested control handles its own rest/hover/focus states.

## Accessibility

- **Role**: implicit — a container with associated label and description
- **Keyboard**: N/A directly; the inner control handles focus
- **ARIA**:
  - Label should associate with the nested input via `for`/`id` or `aria-labelledby`
  - Helper text should be referenced by `aria-describedby`
  - When `error=true`, the nested control should have `aria-invalid="true"` and helper should be referenced via `aria-errormessage` or `aria-describedby`
- **Screen reader**: announces label, required state ("required" if asterisk, "optional" if marked), value of control, and helper/error text

## Do / Don't

### Do
- Wrap every Input, Textarea, or related control in a FormField for consistent labeling
- Use `required-asterisk` sparingly — only when the constraint is legally or functionally critical
- Use `optional` marker when most fields in the form are required and a few aren't
- Set `error=true` at the FormField level — it styles both label and helper

### Don't
- Don't put both `optional` and `required-asterisk` simultaneously — pick one convention per form
- Don't override label / helper colors via CSS — use `error` and `disabled` inputs
- Don't skip FormField for standalone inputs — accessibility depends on the associated label
- Don't use Helper text for multi-line explanations — use a dedicated description component
- Don't nest FormField inside FormField

## References

- **Figma component**: [`FormField` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3069-240)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-formfield
- **Source**: `packages/components/form-field/src/form-field.component.ts`
- **Tokens used**:
  - `form/label` — label text color per state
  - `form/helper` — helper text color per state
  - `form/required/marker` — red asterisk
  - `form/required/optional` — "(optional)" label color

## Changelog

- `0.1.0` — Initial component with 3 required modes, helper slot, error/disabled cascade
