# Progress

> Three independent components — `ProgressLinear`, `ProgressCircular`, `ProgressSegmented` — that share the same semantic color tokens and the same idea of "show how far along we are." Pick the one whose *shape* fits the context, not the one whose feature set is biggest.

## Contract

All three components live in `@kanso-protocol/progress` and share:

- **Color roles** — `primary` (default) / `success` / `danger` / `warning` / `neutral`, mapped to the `--kp-color-progress-{role}-fill` tokens. The empty track is always `--kp-color-progress-track`, and the label / value typography is driven by `--kp-color-progress-label` and `--kp-color-progress-value`.
- **Determinate API** — a numeric `value` (0–100) clamped internally.
- **Indeterminate mode** (Linear and Circular only) — a purely visual "working…" state driven by CSS keyframes. No `value` semantics while indeterminate.

Pick by shape:

- **`ProgressLinear`** — bounded operations the user is waiting on. Uploads, downloads, "applying your settings." Takes horizontal space; label/value can sit above or inline to the right.
- **`ProgressCircular`** — small-footprint contexts (icon-button corners, inline with short copy). Use `indeterminate` for infinite loaders; use a sized variant with `showValue` for determinate percentages that must be legible.
- **`ProgressSegmented`** — discrete-step flows. Multi-step forms, onboarding wizards. Always determinate; the "value" is *which step* you're on (`current`), not a percentage.

---

## ProgressLinear

### API

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Bar height (2 / 4 / 6 / 8 px) |
| `color` | `KpProgressColor` | `'primary'` | Semantic color role |
| `value` | `number` | `0` | Progress value 0–100. Clamped |
| `indeterminate` | `boolean` | `false` | Show an infinite-loading animation |
| `showLabel` | `boolean` | `false` | Render the label / value row |
| `labelPosition` | `'top' \| 'right'` | `'top'` | Where the label sits when `showLabel=true` |
| `label` | `string` | `''` | Label text |

### Layout

Top layout stacks label + percentage above the bar (`space-between`). Right layout puts the percentage inline next to the bar (good for very short labels). When `indeterminate` is on, the percentage is hidden even when `showLabel=true` (there's nothing useful to show).

### Accessibility

Host is `role="progressbar"` with `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow=<clamped value>`. In indeterminate mode `aria-valuenow` is omitted so SRs announce the bar as "busy, progressbar." Pass `label` to also wire up `aria-label`.

---

## ProgressCircular

### API

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Diameter (16 / 24 / 32 / 48 / 64 px). Stroke width scales with size |
| `color` | `KpProgressColor` | `'primary'` | Semantic color role |
| `value` | `number` | `0` | Progress value 0–100. Clamped |
| `indeterminate` | `boolean` | `false` | Infinite-rotation spinner |
| `showValue` | `boolean` | `false` | Render the centered percentage text. No-op for xs/sm (too small to fit a number) |

### Implementation notes

- Two concentric SVG `<circle>`s. The track is a full ring; the arc is a stroked circle whose visible portion is driven by `stroke-dasharray` + `stroke-dashoffset`. The SVG is rotated -90° so `dashoffset=0` starts at 12 o'clock and the arc sweeps **clockwise** — this matches the Figma design and user expectation.
- `indeterminate` replaces the value-driven dashoffset with a fixed 25 % chunk and adds a 1 s `rotate` animation. No value is announced to SRs in this mode.
- Value text at xs/sm is explicitly suppressed; rendering a legible "45 %" inside a 16 px or 24 px circle isn't readable and would compete visually with the ring. If you need the percentage next to the spinner, use `ProgressLinear` in `labelPosition="right"` instead.

### Accessibility

Same contract as Linear (`role="progressbar"`, min/max/now). Consider pairing with `aria-label` or a visually-hidden description when the percentage alone doesn't convey meaning.

---

## ProgressSegmented

### API

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Segment height (2 / 4 / 6 / 8 px) |
| `color` | `KpProgressColor` | `'primary'` | Semantic color role |
| `total` | `number` | `5` | Number of segments. Clamped to 2–12 |
| `current` | `number` | `1` | 1-based index of the first *incomplete* step (so `current=3` with `total=5` paints 3 segments filled and 2 empty). Clamped |
| `showLabels` | `boolean` | `false` | Render the labels row below segments |
| `showStepCounter` | `boolean` | `false` | Render "Step N of M" above segments |
| `labels` | `string[]` | `[]` | Optional labels per segment. Missing entries fall back to `"Step N"` |
| `stepCounterText` | `string \| null` | `null` | Overrides the auto-generated "Step N of M" text |

### Layout

Segments flex to fill the host width equally, separated by a 4 px gap. Labels, when shown, align to segments 1-to-1 via a matching flex row. The step-counter line is simple inline text above segments; use `stepCounterText` for custom copy (e.g., `"Review (2 of 5)"`).

### Label states

- **complete** (index < current) — label color bumps to `fg-value` and weight to medium, matching the filled segment underneath.
- **current** (index == current) — label color takes the role fill color and weight goes semibold. The active step gets visual priority even when the rest of the labels are readable.
- **upcoming** (index > current) — muted `fg-label` gray, regular weight.

### Accessibility

Host is `role="progressbar"` with `aria-valuemin=1`, `aria-valuemax=<total>`, `aria-valuenow=<current>`. The label and step-counter DOM are in the accessibility tree and announced naturally after the host's ARIA summary.

---

## Do / Don't (shared)

### Do
- Use role color to signal state: `success` for "completed" (100 % Linear / filled final Segmented / 100 % Circular), `warning` for "almost there / approaching limit", `danger` for failure states (e.g., upload aborted).
- Keep labels short and scannable — the progress bar is the main signal, the label is a hint.
- Use `ProgressSegmented` instead of a numeric Circular when the task is genuinely step-based; percentages are misleading for discrete flows ("40 % through checkout" is meaningless).

### Don't
- Don't animate `value` manually on every render — the components already transition `stroke-dashoffset` / bar width with a 240 ms ease-out curve. Just update `value`.
- Don't rely on the visual-only "current" color difference in Segmented to communicate state to screen readers — the labels and ARIA values carry that; color is decoration.
- Don't run two indeterminate spinners in the same view. One "busy" signal at a time.

## References

- **Figma component sets**:
  - [`ProgressLinear`](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3326-8625)
  - [`ProgressCircular`](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3329-8649)
  - [`ProgressSegmented`](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3334-9288)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-progress
- **Source**: `packages/components/progress/src/`
- **Tokens used**:
  - Track: `progress/track`
  - Role fills: `progress/{primary|success|danger|warning|neutral}/fill`
  - Label text: `progress/label`
  - Value text: `progress/value`

## Changelog

- `0.1.0` — Initial release. `ProgressLinear` (4 sizes × 5 colors, indeterminate, top/right label), `ProgressCircular` (5 sizes × 5 colors, indeterminate, optional centered value), `ProgressSegmented` (4 sizes × 5 colors, 2–12 segments, optional labels and step counter). Determinate transitions animate over 240 ms; indeterminate modes use CSS keyframe animations.
