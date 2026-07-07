# Charts

> Kanso does **not** ship a charts component. It ships a token *theme* for the
> charting library you already use.

## Stance

A charting engine is a big thing to own: axis math, tooltips, locale-aware
number/date formatting, accessibility, animation, and a non-trivial bundle. None
of that is a design-system concern, and every serious charting library
(ECharts, Chart.js, …) already solves it. Wrapping one in a `<kp-chart>` would
mean either re-exposing its entire API (and pinning its version + bundle onto
every consumer) or amputating it down to the 10% we happened to need.

So Kanso stays out of the rendering business and does the one thing a design
system *should*: it makes your charts **look like Kanso**. The
`@kanso-protocol/ui/charts` entry point is a thin, dependency-free token bridge —
it reads the Kanso design tokens and returns a plain theme/config object you
hand to your chart library.

- **No chart library is a dependency of Kanso.** Nothing from `echarts` /
  `chart.js` is imported. You install and version your charting lib yourself.
- **Return types are plain objects** (`Record<string, unknown>` / a small typed
  interface) — no chart-lib types leak into your build.
- **Colors are read at call time** from the CSS custom properties via
  `getComputedStyle`, so a theme built after a light/dark switch tracks the
  active tokens automatically. Resolved token hex values are baked in as
  fallbacks for SSR / not-yet-loaded stylesheets.

Import: `@kanso-protocol/ui/charts`

## API

### `kansoEChartsTheme(options?)`

Returns a plain ECharts theme object built from the current Kanso tokens.

| Sourced from token | Applied to |
|---|---|
| `--kp-color-accent-{primary,success,warning,danger,info}-fg` | `color` — categorical series sequence |
| `--kp-font-family-sans` | `textStyle` / `title` / `legend` / `tooltip` font |
| `--kp-color-text-{strong,default,muted}` | title, body, axis labels |
| `--kp-color-border-{default,subtle}` | axis lines, ticks, split lines |
| `--kp-color-surface-{base,subtle}` | tooltip surface, split areas |

`backgroundColor` is `'transparent'` so the chart sits on whatever Kanso surface
hosts it.

### `kansoChartColors(options?)`

Returns just the categorical color sequence (`string[]`) — the five semantic
accent colors in order: primary, success, warning, danger, info. Use it when you
drive a lib that wants a bare palette rather than a full theme.

### `KpChartThemeOptions`

```ts
interface KpChartThemeOptions {
  /** Element whose computed custom properties are read. Defaults to <html>. */
  root?: Element;
}
```

Pass `root` to source tokens from a scoped light/dark subtree instead of the
document root.

## Usage — ECharts

```ts
import * as echarts from 'echarts';
import { kansoEChartsTheme } from '@kanso-protocol/ui/charts';

// Register once at app start.
echarts.registerTheme('kanso', kansoEChartsTheme());

// Init any chart with the theme id.
const chart = echarts.init(hostEl, 'kanso');
chart.setOption({
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [120, 200, 150] }],
});
```

### Reacting to a theme switch

The token values change when Kanso flips light ↔ dark. Rebuild + re-register
after the switch, then re-init (or `setOption` with the new theme):

```ts
themeToggle.changed.subscribe(() => {
  echarts.registerTheme('kanso', kansoEChartsTheme());
  chart.dispose();
  chart = echarts.init(hostEl, 'kanso');
  chart.setOption(currentOption);
});
```

## Usage — bare palette (e.g. Chart.js)

```ts
import { kansoChartColors } from '@kanso-protocol/ui/charts';

const palette = kansoChartColors();
new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [10, 20, 30], backgroundColor: palette }],
  },
});
```

## Do / Don't

### Do
- Register the theme **once** at app start; rebuild it only when the active
  theme (light/dark) changes.
- Use `kansoChartColors()` for series color so every chart in the app shares one
  categorical ramp.
- Keep your charting library as *your* dependency — pin and upgrade it on your
  schedule.

### Don't
- Don't add `echarts` / `chart.js` to Kanso — that is the whole point of the
  bridge. The consumer owns the lib.
- Don't hardcode hex values for series — read them from
  `kansoChartColors()` so they track the tokens (and dark mode).
- Don't build the theme before the Kanso stylesheet has loaded and expect token
  values — you will get the (correct-for-light) fallbacks until it does.

## References

- **Source**: `packages/ui/charts/src/`
- **Tokens used**: `--kp-color-accent-*-fg`, `--kp-color-text-*`,
  `--kp-color-border-*`, `--kp-color-surface-*`, `--kp-font-family-sans`.

## Changelog

- `0.1.0` — Initial release. `kansoEChartsTheme()` + `kansoChartColors()` token
  bridge, `root` option for scoped subtrees, SSR-safe token fallbacks. No chart
  library dependency.
