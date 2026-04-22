# Slider

> Numeric range input with a draggable thumb on a horizontal track. Single-value and two-thumb range modes.

## Contract

`<kp-slider>` is a numeric input rendered as a horizontal track with one (or two, in range mode) draggable thumbs. Pointer drag, track click, and full keyboard control are all wired. The component implements `ControlValueAccessor` so `ngModel` / reactive forms work out of the box — value type is `number` in single mode and `[number, number]` in range mode.

### Anatomy

```
Slider
├─ Value labels (optional)            — floating above each thumb
├─ Track wrapper
│   ├─ Track                          — empty background rail
│   ├─ Track fill                     — filled portion between thumbs / 0→value
│   ├─ Tick marks (optional)          — 5 evenly spaced dots on the track
│   └─ Thumb(s)                       — draggable handle (role=slider)
└─ Min / max labels (optional)        — below the track
```

### Sizes

| Size | Track | Thumb | Tick |
|------|-------|-------|------|
| `sm` | 4px   | 16px  | 4px  |
| `md` | 6px   | 20px  | 4px  |
| `lg` | 8px   | 24px  | 4px  |

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size ramp |
| `mode` | `'single' \| 'range'` | `'single'` | One thumb vs. two-thumb range |
| `min` | `number` | `0` | Lower bound |
| `max` | `number` | `100` | Upper bound |
| `step` | `number` | `1` | Discrete step the value snaps to |
| `showTicks` | `boolean` | `false` | Render 5 tick marks across the track |
| `showValueLabel` | `boolean` | `false` | Show current value above each thumb |
| `showLabels` | `boolean` | `false` | Show `minLabel` / `maxLabel` under the track |
| `minLabel` | `string \| null` | `null` | Override the numeric min label (e.g. `'$0'`) |
| `maxLabel` | `string \| null` | `null` | Override the numeric max label |
| `valueFormatter` | `(v: number) => string \| null` | `null` | Custom formatter for value labels |
| `disabled` | `boolean` | `false` | Disable interaction |
| `ariaLabel` | `string` | `''` | Accessible label for the single thumb |
| `ariaLabelStart` | `string` | `''` | Accessible label for the range start thumb |
| `ariaLabelEnd` | `string` | `''` | Accessible label for the range end thumb |
| `value` | `number \| [number, number] \| null` | — | Two-way bindable value |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `valueChange` | `number \| [number, number]` | Thumb position commits a new value (drag, track click, keyboard) |

### Forms

Works with both template-driven and reactive forms via `ControlValueAccessor`. In `mode="range"`, writeValue / ngModel is a `[start, end]` tuple.

```html
<!-- Single -->
<kp-slider [(ngModel)]="volume"/>

<!-- Range -->
<kp-slider mode="range" [(ngModel)]="priceRange"/>
```

## Variants

| Dimension | Values |
|-----------|--------|
| Size | `sm`, `md`, `lg` |
| Mode | `single`, `range` |
| State | rest, hover, focus, disabled |

## States

| State | Behavior |
|-------|----------|
| rest | Track empty (grey) + filled portion (blue) + thumb |
| hover | Thumb border darkens |
| focus | 4px halo ring around thumb |
| disabled | Grey fill + thumb, no pointer interaction |

## Accessibility

- **Role**: each thumb is `role="slider"`
- **ARIA**: `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-orientation="horizontal"` on every thumb
- **Keyboard** (thumb-focused):
  - `←` / `→` / `↑` / `↓` — step by `step`
  - `Shift` + arrow — step by `10 × step`
  - `PageUp` / `PageDown` — step by `10 × step`
  - `Home` / `End` — jump to min / max
- **Pointer**: click on bare track moves the nearest thumb; click + drag on a thumb moves that thumb. Pointer capture keeps drag active when the cursor leaves the track.
- **Range**: start thumb can't pass end thumb and vice versa — values are clamped on commit.

## Do / Don't

### Do
- Use `showValueLabel` for values the user needs to read precisely (price, opacity %).
- Provide `ariaLabel` (or `aria-labelledby` on a FormField wrapper) so screen readers know what the slider controls.
- Use `step` to snap to meaningful increments (e.g. `50` for price in dollars, `1` for count).

### Don't
- Don't rely on the slider for exact numeric entry — pair it with a read-out label or a separate number input when precision matters.
- Don't use range mode for a single-value slider with an optional "minimum" — that's two unrelated values; use two sliders.

## References

- **Figma component**: [`Slider` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-slider
- **Source**: `packages/components/slider/src/`
- **Tokens used**:
  - Track: `slider/track-empty`, `slider/track-filled`
  - Thumb: `slider/thumb-bg`, `slider/thumb-border`, `slider/thumb-ring-focus`
  - Ticks: `slider/tick`
  - Labels: `slider/label`, `slider/value`

## Changelog

- `0.1.0` — Initial release. Single + range modes, 3 sizes, pointer + keyboard control, full CVA support.
