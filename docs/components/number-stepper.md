# NumberStepper

> Numeric input with integrated − and + controls.

## Contract

NumberStepper combines a numeric value display with discrete decrement / increment controls inside one rounded container. It mirrors Input's size grammar so a NumberStepper sits flush next to an Input of the same size in a form row, and reuses Button (in `iconOnly` mode) for its − and + controls so hover, focus, disabled, and color states are inherited from the design system rather than duplicated.

### Anatomy

```
Container (host)
├─ Decrement Button (kp-button [iconOnly], variant ghost, neutral, with minus icon)
├─ Input Area
│  ├─ Prefix (optional)
│  ├─ Value (centered, tabular-nums)
│  └─ Suffix (optional)
└─ Increment Button (kp-button [iconOnly], variant ghost, neutral, with plus icon)
```

- **Container** — height, padding, border, radius, background; same border tokens as Input
- **Decrement / Increment Buttons** — square Button instances (width = height), `iconOnly` mode, ghost variant, neutral color so their backgrounds stay transparent within the container; auto-disabled when value is at min/max
- **Input Area** — fills remaining horizontal space; centered text, tabular numerals so digits don't shift width
- **Prefix / Suffix** — optional affixes (e.g., `$`, `kg`) flanking the value, color `stepper/affix`

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Component size — matches Input |
| `min` | `number \| null` | `null` | Minimum allowed value; decrement disables at min |
| `max` | `number \| null` | `null` | Maximum allowed value; increment disables at max |
| `step` | `number` | `1` | Increment / decrement step |
| `prefix` | `string` | `''` | Text shown before the value (e.g. `$`, `€`) |
| `suffix` | `string` | `''` | Text shown after the value (e.g. `kg`, `.00`) |
| `disabled` | `boolean` | `false` | Non-interactive |
| `ariaLabel` | `string` | `''` | Accessible label when used standalone (no FormField) |
| `forceState` | `KpState \| null` | `null` | Force visual state — Storybook / docs only |

### Outputs

Implements `ControlValueAccessor` — use `[(ngModel)]` or reactive-form bindings. Value is `number \| null` (null when input is cleared). No custom outputs.

### Content projection

None — NumberStepper is a leaf component. Affixes are passed via `prefix` / `suffix` inputs.

## Variants

| Dimension | Values |
|-----------|--------|
| Size | xs (24px), sm (28px), md (36px), lg (44px), xl (52px) |
| State | rest, hover, active, focus, disabled, error |

The container hugs its content — total width = 2 × button-size + input-area-width. The input field auto-resizes to its value: it stays at the per-size minimum width while the value fits, and grows once the typed value exceeds it (e.g. typing `1234567` widens the field and the entire stepper). Achieved with a CSS-grid sizer (`::after { content: attr(data-value) }`), so resizing happens on every keystroke without JavaScript measurement.

| Size | Button (sq) | Input pad-x | Input min-width | Default outer width |
|------|-------------|-------------|-----------------|---------------------|
| xs   | 24          | 4           | 24              | 80                  |
| sm   | 28          | 6           | 26              | 94                  |
| md   | 36          | 8           | 28              | 116                 |
| lg   | 44          | 10          | 32              | 140                 |
| xl   | 52          | 12          | 34              | 162                 |

Container border, background, and the inherited Button states are managed through the `State` Variable Mode in Figma (same coordinate system as Input).

## States

| State | Behavior |
|-------|----------|
| rest | Default idle, gray border, both buttons enabled |
| hover | Container border darkens |
| focus | Container border becomes primary blue (focus-within bubbles up from input) |
| disabled | Gray bg, muted text, both buttons disabled, `aria-disabled="true"` |
| error | Red border (used together with FormField error state) |
| at-min | Decrement button disabled (derived from `value <= min`) |
| at-max | Increment button disabled (derived from `value >= max`) |

## Accessibility

- **Role**: native `<input type="text" inputmode="numeric">` for the value; native `<button>` (via Button) for − and +
- **Keyboard**:
  - `Tab` → focuses the input
  - Type a number to set value; `Enter` / blur clamps to `[min, max]`
  - Buttons activated by `Space` / `Enter` like any Button
- **ARIA**:
  - `aria-disabled="true"` when disabled
  - `aria-invalid="true"` when `forceState === 'error'`
  - `ariaLabel` input for standalone use; otherwise labeled by surrounding FormField
  - Each button has its own `aria-label` ("Increase value" / "Decrease value")
- **Screen reader**: announces value, label (from FormField or `ariaLabel`), and button purpose; clamping happens silently on blur

## Do / Don't

### Do
- Wrap NumberStepper in FormField for label + helper + error messaging
- Use it for bounded discrete numeric input (quantity, age, rating, count)
- Set `min` and `max` so the buttons disable themselves at the limits
- Use `prefix` / `suffix` for units and currencies — keeps the value tabular-aligned
- Pair with Input of the same size in a form row

### Don't
- Don't use NumberStepper for unbounded or high-precision numeric input — use Input with `type="number"` instead
- Don't disable the entire control to indicate at-limit — let the per-button disabled state do it
- Don't override the buttons' variant or color — they intentionally use ghost/neutral so the container reads as one unit
- Don't put a NumberStepper inside another NumberStepper
- Don't set `step` to a value smaller than 1 unless the field genuinely needs decimals — keypad input on mobile expects integers

## References

- **Figma component**: [`NumberStepper` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3163-1486)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-numberstepper
- **Source**: `packages/components/number-stepper/src/number-stepper.component.ts`
- **Tokens used**:
  - Container: `input/bg`, `input/border.*` (shared with Input)
  - Buttons: `stepper/button-bg`, `stepper/button-icon` (per-state colors via the State collection)
  - Optional dividers: `stepper/divider`
  - Prefix / suffix text: `stepper/affix`
  - `primitive.sizing.{xs|sm|md|lg|xl}`, `primitive.radius.comp.{xs|sm|md|lg|xl}`

## Changelog

- `0.1.0` — Initial component using Button (`iconOnly`) for − / + controls, CVA integration, prefix/suffix, derived at-min / at-max disabled states
- `0.1.1` — Hug-sized container (no implicit 280px width); per-size min-width on the input field (24/26/28/32/34) and tightened input-area paddings (4/6/8/10/12) to match Figma
- `0.1.2` — Input field now auto-grows once the value exceeds the min-width (CSS-grid sizer, no JS); typing no longer clamps mid-keystroke — clamping only happens on blur so the user can type freely
- `0.1.3` — Actually ship the auto-grow: native `<input>` defaults to `size=20` which forced a ~20ch-wide grid track. Now sets `size="1"` and uses `width: auto` + per-size `min-width`, so the `::after` sizer (mirroring the current value) genuinely drives the cell width. Cell hugs back to min-width when the value shrinks.
