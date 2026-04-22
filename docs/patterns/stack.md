# Stack

> Vertical flex wrapper with preset gap scale and cross-axis alignment. A `<div style="display:flex;flex-direction:column">` with semantic spacing.

## Contract

`<kp-stack>` arranges children vertically with a fixed gap chosen from the project's `spacing` token scale. Cross-axis alignment (`align`) controls how children are placed on the horizontal axis — `stretch` (default) makes them fill the container width.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `'none' \| '2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Vertical spacing between children |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Cross-axis alignment |

### Gap → px

| Token | Value |
|-------|-------|
| `none` | 0 |
| `2xs`  | 8 |
| `xs`   | 12 |
| `sm`   | 16 |
| `md`   | 20 |
| `lg`   | 24 |
| `xl`   | 32 |
| `2xl`  | 40 |

## Do / Don't

### Do
- **Replace inline flex styles** with Stack. The gap token keeps vertical rhythm consistent with the rest of the system.
- Use `align="center"` for centered card content (logo + title stacks).
- Nest Stacks when one group has its own rhythm (form section + row-of-actions below).

### Don't
- Don't use Stack with a single child. It becomes a pointless wrapper.
- Don't override `gap` via CSS — the preset scale is the contract. If the scale is wrong, extend the scale.

## References

- **Figma pattern**: [`Stack` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-stack
- **Source**: `packages/patterns/stack/src/`

## Changelog

- `0.1.0` — Initial release. 8 gap presets × 4 alignments.
