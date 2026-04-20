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

The container hugs its content — total width = 2 × button-size + input-area-width. The input field holds a 3-character minimum width and grows exactly 1ch per extra digit typed (e.g. typing `12345` widens the field by 2ch over the default). The input's width is bound to `max(3, value.length)` in `ch` units via inline style, matched to the font's `'0'` glyph — which for tabular-nums lines up precisely with each digit. When the user deletes characters the field shrinks symmetrically back to 3ch.

| Size | Button (sq) | Input pad-x | Default input (3ch) | Default outer width |
|------|-------------|-------------|---------------------|---------------------|
| xs   | 24          | 4           | ~22px               | ~80                 |
| sm   | 28          | 6           | ~24px               | ~94                 |
| md   | 36          | 8           | ~26px               | ~116                |
| lg   | 44          | 10          | ~30px               | ~140                |
| xl   | 52          | 12          | ~32px               | ~162                |

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

## Input behavior

- **Only digits and a single leading `-`** pass through. Every other character (letters, punctuation, whitespace) is stripped on keystroke and on paste, regardless of IME — the input accepts nothing else and the caret is restored to its logical position after the strip.
- **`max` is hard-blocked during typing.** If the next keystroke would produce a value greater than `max`, the keystroke is rejected and the field snaps back to the previous valid value. Mirrors the `+` button, which disables at the limit.
- **`min` is NOT blocked during typing** — the user may be mid-typing toward a valid value (e.g. `1` on the way to `10` when `min=10`). Clamping to `min` happens on blur.
- **On blur / Enter**, the value is clamped to `[min, max]` and a final commit fires through `ControlValueAccessor`.

## Accessibility

- **Role**: native `<input type="text" inputmode="numeric">` for the value; native `<button>` (via Button) for − and +
- **Keyboard**:
  - `Tab` → focuses the input
  - Type a number to set value; `Enter` / blur clamps `min` and fires the final change
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
- `0.1.4` — Drop the `::after` grid trick (stopped growing past ~3ch in practice) in favour of inline `[style.width]="max(3, value.length)ch"`, which lines up precisely with tabular-nums digits and is synchronously updated in the `(input)` handler before Angular CD — eliminates the 1-frame "text jitter" that appeared while Angular was still catching up to the keystroke.
- `0.1.5` — Strip non-digit input uniformly (keystroke + paste + IME); leading `-` allowed. Hard-block any keystroke that would push the value past `max` so manual typing matches the disabled-at-max behavior of the `+` button. `min` is still clamped on blur only, so the user can type toward a valid value without the field fighting them.
