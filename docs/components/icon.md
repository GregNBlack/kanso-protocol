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

### Code (`@kanso-protocol/icon`)

```ts
import { KpIconComponent } from '@kanso-protocol/icon';

@Component({
  standalone: true,
  imports: [KpIconComponent],
  template: `<kp-icon name="search" size="md" />`,
})
export class MyComponent {}
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` (required) | — | Icon name from the registry. Outlined names are bare (`search`); filled variants take the `-filled` suffix (`star-filled`). |
| `size` | `'xs'\|'sm'\|'md'\|'lg'\|'xl'` | `'md'` | Drives both pixel size and stroke-width per the optical-compensation ramp. |

The host element is non-interactive (`aria-hidden="true"`) and inherits
color via `currentColor` — set the surrounding text color and the icon
follows automatically.

### Figma

| Figma property | Type | Default | Description |
|----------------|------|---------|-------------|
| `Size` | VARIANT (xs/sm/md/lg/xl) | `xs` | Icon box size — xs=14, sm=16, md=18, lg=22, xl=24 |
| `icon` | INSTANCE_SWAP | Tabler `star` | Any Tabler icon instance |

### Content projection

N/A — the component renders the SVG itself from the registry.

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

## Bundle strategy — why only 115 icons ship by default

`@kanso-protocol/icon` bundles **115 Tabler glyphs** (72 outlined + 43
filled) inline as SVG strings — see
[`icons.allowlist.json`](https://github.com/GregNBlack/kanso-protocol/blob/main/packages/components/icon/icons.allowlist.json).

**Why a curated list and not the whole Tabler library?**

The full Tabler set has ~5500 icons; bundling them all would push
`@kanso-protocol/icon` past 10 MB of inline SVG, which is unacceptable
for production consumers. The curated 115 covers two needs:

1. **What Kanso components themselves render** — the chevron in
   DropdownMenu, the close-cross in Popover, the search-magnifier in
   Input, the bell in NotificationCenter, etc. These are required for
   the design system to display correctly out of the box.
2. **Common UI affordances** — `user`, `settings`, `calendar`,
   `dashboard`, `folder`, `trash`, etc.

For **anything outside this baseline**, the consumer is expected to
install the full `@tabler/icons` package and register the additional
icons at runtime (see next section). The baseline is intentionally a
display surface for Kanso components, **not a replacement for installing
Tabler in your app**.

## Adding more icons

Three patterns, in order of likelihood:

### 1. One-off Tabler icon needed in app code

Install the full Tabler package and register the SVG at runtime:

```bash
npm install @tabler/icons
```

```ts
import { KP_ICON_REGISTRY } from '@kanso-protocol/icon';
import rocketSvg from '@tabler/icons/icons/rocket.svg?raw';

KP_ICON_REGISTRY.register('rocket', rocketSvg);

// then anywhere:
//   <kp-icon name="rocket" size="md" />
```

(`?raw` works with Vite / esbuild. For Webpack / Angular CLI default
config, configure a raw-loader for `.svg`, or read the file content at
build time.)

### 2. Multiple icons at once

```ts
import { KP_ICON_REGISTRY } from '@kanso-protocol/icon';
import rocketSvg    from '@tabler/icons/icons/rocket.svg?raw';
import ufoSvg       from '@tabler/icons/icons/ufo.svg?raw';
import satelliteSvg from '@tabler/icons/icons/satellite.svg?raw';

KP_ICON_REGISTRY.registerMany({
  rocket:    rocketSvg,
  ufo:       ufoSvg,
  satellite: satelliteSvg,
});
```

### 3. Custom brand icon

```ts
KP_ICON_REGISTRY.register('my-logo', '<svg viewBox="0 0 24 24">…</svg>');
```

The registered SVG must follow Tabler's convention: 24×24 viewBox,
`stroke="currentColor"` for outlined glyphs, `fill="currentColor"` for
filled.

### 4. Icon used everywhere — push it into the baseline

If the same Tabler glyph keeps appearing across your projects, **open a
PR adding it to `icons.allowlist.json`**. Run `npm run generate:icons`
to regenerate the inlined SVG map. This avoids every consumer having to
register the same icon themselves.

## Unknown-name behavior

`<kp-icon name="X">` for a name not in the registry renders nothing and
emits a single `console.warn` pointing to the registry API. Useful for
catching missing register calls while wiring up screens.

## References

- **Figma component**: [`icon` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=70-245)
- **Source**: [`@kanso-protocol/icon`](https://www.npmjs.com/package/@kanso-protocol/icon) — standalone Angular package
- **Allowlist**: [`packages/components/icon/icons.allowlist.json`](https://github.com/GregNBlack/kanso-protocol/blob/main/packages/components/icon/icons.allowlist.json)
- **Full Tabler library**: [`@tabler/icons`](https://www.npmjs.com/package/@tabler/icons) on npm; [tabler.io/icons](https://tabler.io/icons) browser
- **Tokens used**:
  - `primitive.icon.size.{xs|sm|md|lg|xl}`
  - `primitive.icon.stroke.{xs|sm|md|lg|xl}`
  - `icon.{primary|secondary|disabled|interactive|danger|success|warning}` for standalone usage

## Changelog

- `0.1.0` — Initial mask-based Icon component with 5 sizes and optical stroke scale
