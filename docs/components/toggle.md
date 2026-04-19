# Toggle

> On/off switch for immediate-effect settings.

## Contract

Toggle represents a single boolean that takes effect the moment it changes — "Dark mode", "Notifications enabled", "Sync with calendar". Unlike Checkbox, Toggle implies the change applies right away, so there's no separate Save step. The visual metaphor is a physical switch: track + thumb, thumb slides to indicate state.

### Anatomy

```
Container (track, pill shape)
└─ Thumb (circle with subtle shadow, absolute-positioned)
```

- **Container / Track** — rounded rectangle (pill), fill drives on/off color
- **Thumb** — white circle with drop shadow, animates left/right via CSS transition
- **label** — projected right of the track when `hasLabel` is true

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `color` | `'primary' \| 'danger'` | `'primary'` | Color role for the on state |
| `on` | `boolean` | `false` | Current on/off value |
| `disabled` | `boolean` | `false` | Non-interactive |
| `forceState` | `KpState \| null` | `null` | Force visual state — Storybook only |
| `hasLabel` | `boolean` | `true` | Show projected label |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `onChangeEvent` | `boolean` | User flips the switch |

Implements `ControlValueAccessor` — use `[(ngModel)]`.

### Content projection

- `ng-content` — label text

## Variants

| Dimension | Values |
|-----------|--------|
| Size | sm (track 28×16, thumb 12), md (track 36×20, thumb 16), lg (track 44×24, thumb 20) |
| On | off, on |
| Color | primary, danger |
| State | rest, hover, active, focus, disabled, error |

Track corner-radius is always half its height (pill shape). Thumb offset from edge is 2px for all sizes.

## States

| State | Behavior |
|-------|----------|
| rest | Off: gray track. On: colored track. |
| hover | Track darkens |
| active | Track darkens further |
| focus | 2px focus ring around the whole component |
| disabled | Muted track; `aria-disabled="true"`; `pointer-events: none` |
| error | Red track; rare — toggles rarely carry validation errors |

## Accessibility

- **Role**: `switch`
- **Keyboard**: `Space` toggles; `Tab` to focus
- **Focus**: 2px ring via `outline`, offset 2px, around the pill shape
- **ARIA**:
  - `aria-checked="true" | "false"` reflects on/off
  - `aria-disabled="true"` when disabled
  - `aria-label` required if no visible label
- **Screen reader**: announces label, role ("switch"), and state ("on" / "off")

## Do / Don't

### Do
- Use Toggle when the change takes immediate effect and doesn't need confirmation
- Label the state clearly — "Dark mode" (not "Enable dark mode")
- Place the Toggle after the label visually (label → toggle)
- Animate state change via the built-in CSS transition for clarity
- Use on the right edge of setting rows to align visually across a list

### Don't
- Don't use Toggle inside a form that requires a Save button — use Checkbox instead
- Don't use Toggle for choices that aren't truly binary (on/off with shades)
- Don't rely on color alone to signal state — the thumb position does the work
- Don't use `danger` color on Toggle — that's for destructive actions, toggles rarely are
- Don't mix Toggle sizes in the same settings list

## References

- **Figma component**: [`Toggle` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3064-158)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-toggle
- **Source**: `packages/components/toggle/src/toggle.component.ts`
- **Tokens used**:
  - `toggle/track-bg-off` for off state
  - `control/bg-checked` for on state (appearance-aware)
  - `control/fg` for thumb color (always white)

## Changelog

- `0.1.0` — Initial component with 3 sizes × on/off, primary/danger color, thumb animation
