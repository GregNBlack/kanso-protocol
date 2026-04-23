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
| `showSparkline` | `boolean` | `false` | Render the sparkline slot |

Slot: `[kpStatCardSparkline]` — drop in your real chart (recharts, ngx-charts, etc.). Empty slot renders a styled placeholder rectangle.

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

- **Figma**: `StatCard` Component Set on the [📐 Patterns page](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System).
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-statcard
- **Source**: `packages/patterns/stat-card/src/`

## Changelog

- `0.1.0` — Initial release. 3 sizes × 3 trend directions × 2 appearances, optional icon, optional sparkline slot.
