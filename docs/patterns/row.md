# Row

> Horizontal flex wrapper with preset gap scale, alignment, and justification. Optional wrap on overflow.

## Contract

`<kp-row>` arranges children horizontally with a fixed `gap` from the spacing scale. `align` is cross-axis (vertical) alignment; `justify` is main-axis (horizontal) distribution. Set `[wrap]="true"` to allow line wrapping on narrow containers.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `'none' \| '2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Horizontal spacing |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `'center'` | Cross-axis alignment |
| `justify` | `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-around'` | `'start'` | Main-axis distribution |
| `wrap` | `boolean` | `false` | Allow children to wrap to next line |

### Gap → px

See [Stack → Gap → px](./stack.md#gap--px).

## Do / Don't

### Do
- **Button groups** live in a Row with `gap="sm"` and `justify="end"`.
- **App headers** → Row with `justify="space-between"` and `align="center"`.
- Use `align="baseline"` when combining text of different sizes (big number + small unit).

### Don't
- Don't use Row as a full-width container split — use Grid when children need consistent sizing.
- Don't set `wrap="true"` as a default. Overflow wrapping is a fallback; design for the explicit breakpoint instead.

## References

- **Figma pattern**: [`Row` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-row
- **Source**: `packages/patterns/row/src/`

## Changelog

- `0.1.0` — Initial release. 8 gap presets × 5 alignments × 5 justifications + optional wrap.
