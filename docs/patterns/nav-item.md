# NavItem

> Atomic nav row. Three sizes, four states, nested depth, optional icon / badge / chevron, and a left accent bar for active state.

## Contract

`<kp-nav-item>` renders one clickable row of navigation. It doesn't know about routing — wire `click$` to whatever your router exposes. Depth controls left padding (for nested tree-like nav). Hover and active styles are handled internally via tokens.

Slots:
- `[kpNavItemIcon]` — leading icon (consumer provides SVG)
- `[kpNavItemBadge]` — trailing badge (e.g. `<kp-badge>`)

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Row height |
| `depth` | `number` | `0` | Left indent (× size-dependent indent unit) |
| `label` | `string` | `'Navigation item'` | Primary text |
| `active` | `boolean` | `false` | Applies active styling + accent bar |
| `disabled` | `boolean` | `false` | Non-interactive, muted |
| `hasChildren` | `boolean` | `false` | Render collapse chevron |
| `expanded` | `boolean` | `false` | Rotates chevron 90° |
| `showIcon` | `boolean` | `true` | |
| `showBadge` | `boolean` | `false` | |
| `showActiveIndicator` | `boolean` | `true` | Blue bar on left when active |
| `collapsed` | `boolean` | `false` | Collapsed mode (used by Sidebar): hide label / badge / chevron, center icon |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `click$` | `MouseEvent` | Row clicked (not when disabled) |

## Do / Don't

### Do
- Use **one active NavItem per section**. Nesting multiple actives in a sidebar is confusing.
- Use **`depth`** for programmatic tree indentation, not for special cases. If nesting exceeds 2 levels, rethink the nav.
- Pair with **`<kp-badge>`** in the badge slot for proper tri-appearance color semantics (e.g. "New" → primary-subtle, count → neutral).

### Don't
- Don't wire route clicks to router manually inside NavItem. Emit `click$` and let the consumer decide (they often need to prevent default, close the drawer, etc.).
- Don't hide the active indicator unless you have a different active affordance — it's the quickest visual scan.

## References

- **Figma**: `NavItem` Component Set (Patterns page)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-navitem
- **Source**: `packages/patterns/nav-item/src/`
- **Tokens**: `nav-item/bg/*`, `nav-item/fg/*`, `nav-item/icon/*`, `nav-item/active-indicator`

## Changelog

- `0.1.0` — Initial release. 3 sizes × 4 states, depth-driven indent, collapsed mode.
