# Spinner

> Circular progress indicator for loading states.

## Contract

Spinner is the visual placeholder while an async operation completes. It's used standalone for loading screens and embedded inside Button's loading state. It never carries a label of its own — the surrounding context must describe what's loading.

### Anatomy

```
Container (square, no fill)
├─ Track (ellipse, 360° stroke, ~25% opacity)
└─ Indicator (ellipse, 90° arc, 100% opacity, round cap)
```

- **Container** — square frame sized by `Size` variant, no fill
- **Track** — full-circle stroke at low opacity showing the progress path
- **Indicator** — 90° arc (quarter circle) at full opacity; animated via CSS rotation in code

## API

### Inputs

Spinner in Angular is inline SVG inside Button (and future Textarea loading). Dedicated component not yet extracted — use Button's `loading` prop.

The Figma component exposes:

| Figma property | Type | Default | Description |
|----------------|------|---------|-------------|
| `Size` | VARIANT (xs/sm/md/lg/xl) | `md` | Spinner box size |

### Content projection

N/A.

## Variants

| Dimension | Values |
|-----------|--------|
| Size | xs (14px, stroke 2), sm (16px, stroke 2), md (18px, stroke 2.5), lg (22px, stroke 3), xl (24px, stroke 3) |

Spinner sizes mirror Button icon sizes — when Button is loading, its icon-sized Spinner slots in without any layout shift.

## States

Spinner has no states — it's always "spinning" visually. In Figma the animation is implied by the static 90° arc; the CSS animation runs in code.

## Accessibility

- **Role**: `progressbar` or `status`
- **ARIA**:
  - `aria-label` describes what's loading (e.g. "Loading results")
  - `aria-busy="true"` on the region containing the Spinner
  - For indeterminate progress (our case), no `aria-valuenow` needed
- **Screen reader**: surrounding context describes the action; Spinner announces "busy" or progress role

## Do / Don't

### Do
- Use inside Button for actions taking longer than 200ms
- Use at page or section level to indicate initial data load
- Match Spinner size to the surrounding control (Button `md` → Spinner `md`)
- Provide an accessible label on the parent region describing what's loading

### Don't
- Don't use Spinner alone without accompanying text unless the loading target is obvious
- Don't rotate manually — the `kp-spin` keyframes handle animation
- Don't stack multiple spinners on the same screen — show one per async region
- Don't replace Spinner with an unrelated icon — users expect the circular pattern

## References

- **Figma component**: [`Spinner` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=18-17)
- **Source**: inline SVG in `packages/components/button/src/button.component.ts` (Button loading state)
- **Tokens used**:
  - `primitive.icon.size.{xs|sm|md|lg|xl}` for box size
  - Color inherits from parent's `button/fg` when embedded, or `icon/color` when standalone

## Changelog

- `0.1.0` — Initial Figma component; Angular usage via inline SVG in Button loading state
