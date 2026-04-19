# Icon

> Color-controllable wrapper around a Tabler stroke icon.

## Contract

Icon is a thin wrapper that applies a solid color to any Tabler icon via a mask technique — the actual icon becomes the mask, a color rectangle beneath supplies the fill. This lets every icon in the system respond to a single color variable, regardless of how many vector paths the source icon has. Stroke width is tuned per size for optical compensation.

### Anatomy

```
Container (clips content, absolute-positioned children)
├─ color (rectangle, full-size, fill = token)
└─ mask (frame, fills = inverted, isMask = true)
   └─ icon (Tabler instance, swappable)
```

- **Container** — fixed square dimensions tied to `icon/size/*`
- **color** — solid-fill rectangle that supplies the rendered color; bound to `button/fg` or `icon/color` depending on context
- **mask** — frame with `isMask: true`; reveals only the pixels that fall under the icon's strokes/fills
- **icon** — the Tabler icon instance itself; swappable via INSTANCE_SWAP so any library icon works

## API

### Inputs

Icon in code is not a standalone Angular component — it's a pattern. Use inline SVG with `stroke="currentColor"` in Angular, and let parent components set color via CSS or the component's own color variables.

The Figma component exposes:

| Figma property | Type | Default | Description |
|----------------|------|---------|-------------|
| `Size` | VARIANT (xs/sm/md/lg/xl) | `xs` | Icon box size — xs=14, sm=16, md=18, lg=22, xl=24 |
| `icon` | INSTANCE_SWAP | Tabler `star` | Any Tabler icon instance |

### Content projection

N/A — icons in Angular are inline SVGs with `stroke="currentColor"`.

## Variants

| Dimension | Values |
|-----------|--------|
| Size | xs (14px, stroke 1.25), sm (16px, stroke 1.5), md (18px, stroke 1.5), lg (22px, stroke 1.75), xl (24px, stroke 2) |

Size determines both box dimensions (`icon/size/*`) and stroke width (`icon/stroke/*`). Optical compensation: smaller icons get thinner strokes to remain visually balanced.

## States

Icon has no states of its own — it adopts the state coloring of its host (Button fg, menu item icon color, etc.).

## Accessibility

- **Role**: decorative by default (`aria-hidden="true"`)
- **Keyboard**: N/A
- **ARIA**:
  - When used alone as an interactive trigger, the parent element must provide `role="button"` and `aria-label`
  - When paired with a label, leave `aria-hidden="true"` to avoid double-announcement

## Do / Don't

### Do
- Use Tabler Icons exclusively — the stroke style and grid match the system
- Match icon size to the container: xs button → xs icon, md input → md icon
- Set `aria-label` on the parent when the icon is the only content
- Use the mask pattern in Figma to keep color a single source of truth

### Don't
- Don't mix icon libraries (material, heroicons, etc.) in the same surface
- Don't resize icons by scaling — pick the correct Size variant
- Don't use filled icons alongside stroke icons in the same row
- Don't apply color overrides on individual vector paths — override the `color` layer instead

## References

- **Figma component**: [`icon` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=70-245)
- **Source**: not a standalone package — inline SVG pattern inside each component
- **Tokens used**:
  - `primitive.icon.size.{xs|sm|md|lg|xl}`
  - `primitive.icon.stroke.{xs|sm|md|lg|xl}`
  - `icon.{primary|secondary|disabled|interactive|danger|success|warning}` for standalone usage

## Changelog

- `0.1.0` — Initial mask-based Icon component with 5 sizes and optical stroke scale
