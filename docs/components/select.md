# Select

> Choose one or many values from a list — Input-style trigger, DropdownMenu-style panel.

## Contract

Select is a composed component: its trigger borrows Input's anatomy and size grammar, and its open panel borrows DropdownMenu's container and option grammar. It exists so a form row of Input + Select + Button lines up pixel-perfect at any size, and so selecting from a short list of known values uses the same visual language as typing free-form text.

### Anatomy

```
Container (host)
├─ Trigger (button, Input-like)
│  ├─ Floating Label (lg, xl only)
│  ├─ Value / Placeholder
│  ├─ Clear Button (optional — shows when has value, not disabled)
│  └─ Chevron (rotates 180° when open)
└─ Dropdown (listbox, appears below trigger when open)
   ├─ Option
   │  ├─ Checkbox (multi mode only)
   │  ├─ Label
   │  └─ Checkmark (single mode, selected)
   └─ Empty state ("No options")
```

- **Trigger** — button styled as Input: same border, radius, height, padding, typography; borders follow `input/border.*` state tokens
- **Value** — selected option's label; placeholder color (`input/placeholder`) when nothing picked; in multi mode shows "Selected N out of M" for 2+, the single label for 1
- **Clear Button** — same as Input's: 16/20/24 hit area per size, X icon, hover-highlight; hidden when disabled or no value
- **Chevron** — 16×16 down-chevron (Tabler `chevron-down`), color `select/chevron.rest`; rotates 180° and turns `select/chevron.open` when panel is open
- **Dropdown** — floating panel below the trigger, same border/radius/shadow as DropdownMenu (12px radius, gray border, soft shadow); max-height 280px with custom scrollbar
- **Option** — 32px tall, 10px horizontal padding, 14px label; hover bg `gray.50`, selected bg `blue.50` with `blue.700` text; checkbox leading in multi mode, trailing check in single mode
- **Floating Label** — available on lg/xl only, behaves identically to Input's (inside when rest, shrinks to top when open or value present)

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Component size — matches Input |
| `placeholder` | `string` | `''` | Placeholder text when nothing is selected |
| `label` | `string` | `''` | Floating label text (lg/xl only) |
| `floatingLabel` | `boolean` | `false` | Enable floating label pattern |
| `options` | `KpSelectOption[]` | `[]` | List of available options |
| `multiple` | `boolean` | `false` | Allow selecting multiple values |
| `showClear` | `boolean` | `true` | Show clear (X) button when value is present |
| `disabled` | `boolean` | `false` | Non-interactive |
| `forceState` | `KpState \| null` | `null` | Force visual state — Storybook / docs only |

### Option shape

```ts
interface KpSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `openChange` | `EventEmitter<boolean>` | Fires when the dropdown opens or closes |

Implements `ControlValueAccessor` — use `[(ngModel)]` or reactive-form bindings. In single mode the model value is `string \| null`; in multi mode it's `string[]`.

### Content projection

None — options are passed via the `options` input.

## Variants

| Dimension | Values |
|-----------|--------|
| Size | xs (24px), sm (28px), md (36px), lg (44px), xl (52px) |
| Mode | single (default), multiple |
| State | rest, hover, active, focus, open, disabled, error |

Floating Label is a boolean available on lg and xl only.

## States

| State | Behavior |
|-------|----------|
| rest | Default idle, gray border, chevron gray |
| hover | Border darkens |
| active | Border primary blue — shown while dropdown is open |
| focus | Border primary blue (same as active visually) |
| open | Dropdown panel rendered below, chevron rotated 180° and primary-blue |
| disabled | Gray bg, muted text, chevron muted, `aria-disabled="true"`, no open on click |
| error | Red border, red chevron — used together with FormField error state |

## Accessibility

- **Role**: trigger is `<button>` with `aria-haspopup="listbox"`, `aria-expanded={open}`; panel is `role="listbox"` with `aria-multiselectable="true"` in multi mode; each option is `role="option"` with `aria-selected`
- **Keyboard**:
  - `Space` / `Enter` on trigger → toggle open
  - `Escape` → close panel
  - `Tab` → move focus out (closes on blur)
  - Click outside → close panel
- **Focus**: visible border-color change (no outline ring), same pattern as Input
- **ARIA**:
  - `aria-invalid="true"` when `forceState === 'error'`
  - `aria-disabled="true"` when disabled
  - Labeled via surrounding FormField or `aria-label` for standalone use
- **Screen reader**: announces role "button collapsed/expanded", then on open announces "listbox, N options", each option read with selected state

## Do / Don't

### Do
- Wrap Select in FormField for label + helper + error messaging
- Use Select when the value set is bounded and short-to-medium (roughly 3–50 items)
- Use floating label only on lg/xl where vertical space is sufficient
- Use multi-select for facet-style filters (tags, categories) where zero-to-many is valid
- Pair Select with Input of the same size in form rows

### Don't
- Don't use Select for unbounded free text — use Input
- Don't use Select when there are only 2 options — use Radio or Toggle
- Don't use Select when 2–5 options need to stay visible — use Radio or Checkbox group
- Don't disable Select on validation — surface error via FormField so the user can still re-open and correct
- Don't mix sm Select with md Input in the same row — sizes must match
- Don't override the chevron — it's the Select's spatial affordance

## References

- **Figma component**: [`Select` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3118-2901)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-select
- **Source**: `packages/components/select/src/select.component.ts`
- **Tokens used**:
  - Trigger inherits Input tokens: `input/bg`, `input/fg`, `input/border.*`, `input/placeholder`
  - Chevron: `select/chevron.rest`, `select/chevron.hover`, `select/chevron.open`, `select/chevron.disabled`, `select/chevron.error`
  - Dropdown inherits DropdownMenu tokens for container + menu-item
  - `form/floating-label` for the floated label
  - `primitive.sizing.{xs|sm|md|lg|xl}`, `primitive.radius.comp.{xs|sm|md|lg|xl}`

## Changelog

- `0.1.0` — Initial component with 5 sizes, single and multi selection, floating label on lg/xl, optional clear button, CVA integration
