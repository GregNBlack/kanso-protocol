# Grid

> Responsive `display: grid` wrapper. Equal-width columns, preset gap scale, optional independent row gap.

## Contract

`<kp-grid>` arranges children in equal-width columns using CSS Grid. Gap is picked from the spacing scale; `gapRow` optionally tightens/loosens vertical rhythm.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `2 \| 3 \| 4 \| 6 \| 12` | `3` | Number of equal-width columns |
| `gap` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Column gap (and row gap if `gapRow` is null) |
| `gapRow` | `KpGridGap \| null` | `null` | Independent row gap; inherits from `gap` when null |

### Columns → use

| Value | Typical use |
|-------|-------------|
| `2` | Half-half layouts, desktop sidebar + content |
| `3` | Product/feature cards |
| `4` | Dashboards, image thumbnails |
| `6` | Dense KPI rows |
| `12` | 12-column editorial grid (layout debug / bespoke spans) |

## Do / Don't

### Do
- **Pick columns based on content**, not breakpoints. A card grid is `3`; a thumbnail strip is `4`.
- **Use `gapRow="sm"`** with `gap="md"` when horizontal reads tighter than vertical (dense tables of cards).
- Wrap Grid in a Container to cap width.

### Don't
- Don't use Grid for single-column vertical rhythm — that's Stack.
- Don't try `columns="5"` — not in the preset. If you need 5, the grid system is probably wrong for that page.
- Don't set per-cell widths via CSS to "break out" — re-pick columns.

## References

- **Figma pattern**: [`Grid` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-grid
- **Source**: `packages/patterns/grid/src/`

## Changelog

- `0.1.0` — Initial release. 5 column presets × 5 gap scales, independent row gap.
