# Container

> Responsive content wrapper. Caps child width at a preset breakpoint and applies horizontal padding. Pure layout primitive.

## Contract

`<kp-container>` clamps its children to one of four `width` presets (`narrow | medium | wide | full`) and centers them horizontally. Horizontal padding is controlled by `padding` (`none | sm | md | lg`). The container has no background, border, or vertical rhythm — it's an invisible wrapper.

Every content-area page in the app should sit inside a Container. That's where "don't pepper `max-width: 1280px` into individual components" becomes enforceable.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `'narrow' \| 'medium' \| 'wide' \| 'full'` | `'wide'` | Max width preset |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Horizontal padding |

### Width presets

| Value | max-width | When |
|-------|-----------|------|
| `narrow` | 640px | Forms, auth pages, reading-width copy |
| `medium` | 960px | Settings, admin detail pages |
| `wide`   | 1280px | Dashboards, list views (default) |
| `full`   | 100%   | Top-level toolbars, hero sections |

### Padding presets

| Value | Inline padding |
|-------|----------------|
| `none` | 0 |
| `sm` | 16px |
| `md` | 24px |
| `lg` | 32px |

## Do / Don't

### Do
- **Wrap every page route** in a Container. Pick width once at the route level, not per component.
- Use **`padding="none"`** inside a Container that already provides its own edge padding (e.g., a full-bleed hero).
- Nest when semantics demand: a `wide` dashboard can contain a `narrow` Container around a settings form drawer.

### Don't
- Don't set `max-width` on individual components to dodge a Container. Cap once, at the container level.
- Don't use `width="full"` just because the design hasn't settled. Pick an intentional width — "full" means you explicitly want edge-to-edge.
- Don't stack vertical spacing on the Container — it has no padding-block. Use a `Stack` inside if you need rhythm.

## References

- **Figma pattern**: [`Container` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-container
- **Source**: `packages/patterns/container/src/`
- **Tokens**: `layout/container/max-width/*`, `layout/container/padding/*`

## Changelog

- `0.1.0` — Initial release. Four max-width breakpoints × four padding scales.
