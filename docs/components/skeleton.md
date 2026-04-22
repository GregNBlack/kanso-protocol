# Skeleton

> Placeholder shown while real content loads. Six shape presets (line, circle, rectangle, avatar, button, card) plus a size ramp cover the common patterns. Animated shimmer is on by default.

## Contract

`<kp-skeleton>` renders a single grey-toned placeholder with an optional animated shimmer (linear gradient that sweeps horizontally). Six `shape` presets give you ready-made compositions for most situations; for anything custom, compose multiple line/circle/rectangle skeletons into your own shape.

### Shapes

| Shape | Use | Notes |
|-------|-----|-------|
| `line` | Text line | Default. Override `[width]` to match real content |
| `circle` | Avatar / round icon | Aspect 1:1, fixed per size |
| `rectangle` | Image / chart / hero | Fixed aspect per size |
| `avatar` | Avatar row (circle + 2 lines) | Composite preset |
| `button` | Button placeholder | Matches Kanso button sizes |
| `card` | Card (image + title + 2 lines) | Composite preset, fixed 320 wide |

### Sizes

| Size | Line height | Circle | Rectangle | Button (w×h) |
|------|-------------|--------|-----------|--------------|
| xs | 8 | 24 | 120×80 | 80×24 |
| sm | 12 | 32 | 200×120 | 96×28 |
| md | 16 | 40 | 320×200 | 112×36 |
| lg | 20 | 56 | 480×300 | 120×44 |
| xl | 24 | 72 | 640×400 | 128×52 |

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `shape` | `'line' \| 'circle' \| 'rectangle' \| 'avatar' \| 'button' \| 'card'` | `'line'` | Visual preset |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size ramp |
| `animated` | `boolean` | `true` | Toggle the shimmer animation |
| `width` | `string \| null` | `null` | Width override (e.g. `'80%'`, `'240px'`) — useful for `line` shapes |
| `height` | `string \| null` | `null` | Height override for custom layouts |

## Accessibility

- Host is `aria-hidden="true"` — skeleton is purely visual and shouldn't be announced by screen readers. Content that replaces the skeleton should be announced when it loads (use `aria-live` on the container).
- The shimmer respects `prefers-reduced-motion` when the root document sets the standard media query (browsers pause CSS animations automatically in that mode).

## Do / Don't

### Do
- Match the skeleton shape to the content it's replacing. Don't show a card skeleton where a paragraph will load.
- Keep skeletons fast — aim for sub-second transitions to real content.
- Use `width` overrides on `line` skeletons to approximate real line lengths (paragraphs look better with mixed widths).

### Don't
- Don't show skeletons for < 200ms operations — they cause flash / layout shift.
- Don't animate when the user disabled motion. The shimmer is already opt-outable via `prefers-reduced-motion`; don't add additional movement.
- Don't replace empty states with skeletons. If there's genuinely no data (not loading), use `<kp-empty-state>`.

## References

- **Figma component**: [`Skeleton` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3483-8558)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-skeleton
- **Source**: `packages/components/skeleton/src/`
- **Tokens used**:
  - Base: `skeleton/bg-base`
  - Shimmer highlight: `skeleton/bg-highlight`

## Changelog

- `0.1.0` — Initial release. Six shape presets, five-size ramp, animated shimmer toggle.
