# StatCard

> Single-metric tile for dashboards. Big value, optional icon, optional trend, optional sparkline slot.

## Contract

`<kp-stat-card>` is a self-contained tile that shows one metric. The header has a label and an optional icon chip; the body has the big value; below it sits an optional trend row (icon + delta + description), then an optional sparkline slot.

Tone of the trend (green/red/gray) is computed from `trendDirection` × `trendAppearance`. Use `trendAppearance="negative"` for inverse metrics (error rate, churn, latency) — `down` becomes good, `up` becomes bad.

## API

### `KpStatCardComponent`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding, value typography, gap |
| `label` | `string` | `'Total revenue'` | Top-left label |
| `value` | `string \| number` | `'$12,482'` | The big number |
| `showIcon` | `boolean` | `false` | Render the icon chip in the header |
| `icon` | `string \| null` | `'trending-up'` | Tabler icon name (no `ti-` prefix) |
| `showTrend` | `boolean` | `true` | Render the trend row |
| `trendDirection` | `'up' \| 'down' \| 'neutral'` | `'up'` | Picks the trend icon |
| `trendAppearance` | `'positive' \| 'negative'` | `'positive'` | Inverts the good/bad mapping |
| `trendValue` | `string \| null` | `'+12.5%'` | The delta, formatted |
| `trendDescription` | `string \| null` | `'from last month'` | Trailing description |
| `showSparkline` | `boolean` | `false` | Render the sparkline region |
| `sparklineData` | `number[] \| null` | `null` | Built-in inline SVG trend line — pass a numeric series (≥2 points). No external dep. Ignored if you project your own `[kpStatCardSparkline]` |
| `sparklineTrend` | `'up' \| 'down' \| 'neutral' \| 'auto' \| null` | `null` | Colors the sparkline stroke. `null` inherits the trend row's tone; `up`/`down`/`neutral` set it explicitly (up = success, down = danger, neutral = accent); `auto` derives the direction from the series (last vs. first point) |

### Sparkline

The built-in sparkline is an inline `<svg>` polyline normalized to a `100 × 32` viewBox — no charting dependency. It is `aria-hidden` (decorative supplementary); the numeric `value` stays the accessible metric. It is fully opt-in: without `sparklineData` (and without projected slot content) the card renders exactly as before.

Stroke color comes from `sparklineTrend` mapped to the semantic tokens `--kp-color-accent-success-fg` (up), `--kp-color-accent-danger-fg` (down), and `--kp-color-accent-primary-fg` (neutral). Leave `sparklineTrend` unset to keep it in step with the trend row, or set it (or `auto`) to color the sparkline on its own — useful when `showTrend` is `false`.

Slot: `[kpStatCardSparkline]` — instead of the built-in line, drop in your real chart (recharts, ngx-charts, etc.). An empty slot with no `sparklineData` renders a styled placeholder rectangle.

## Tone matrix

|                | `trendAppearance="positive"` | `trendAppearance="negative"` |
|----------------|------------------------------|------------------------------|
| `direction=up` | green (good)                 | red (bad)                    |
| `direction=down` | red (bad)                  | green (good)                 |
| `direction=neutral` | gray                    | gray                         |

## Do / Don't

### Do
- **Use `negative` for inverse metrics** (latency, error rate, churn). A latency drop is good — let the color show that.
- **Keep `value` short**. If you need >7 chars, drop to `size="sm"` or split into two tiles.
- **Use `tabular-nums`** when listing tiles in a row so digits align — already on by default.
- **Pair StatCard with a real chart slot** for hero KPIs; leave the sparkline off for secondary tiles.

### Don't
- Don't put long sentences in `trendDescription`. Aim for ≤3 words ("vs last month", "this quarter").
- Don't use the icon chip for decoration alone — it should reinforce the metric (currency for revenue, users for MAU, clock for latency).
- Don't render >6 StatCards in a row. Wrap to a grid for dashboards.

## References

- **Figma**: `StatCard` Component Set on the [📐 Patterns page](https://www.figma.com/design/lhWTPOMJMCNhnwM9nNMCuH/Kanso-Protocol-Design-System).
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-statcard
- **Source**: `packages/ui/stat-card/src/`

## Changelog

- `0.2.0` — Add `sparklineTrend` (`up`/`down`/`neutral`/`auto`) to color the built-in sparkline independently of the trend row, deriving direction from the series with `auto`. Backward compatible: unset keeps the trend row's tone.
- `0.1.0` — Initial release. 3 sizes × 3 trend directions × 2 appearances, optional icon, built-in data-driven sparkline (`sparklineData`) + projectable sparkline slot.
