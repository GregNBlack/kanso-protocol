/**
 * Kanso Protocol — charts token bridge
 *
 * Kanso does **not** ship a charts component. Owning a charting engine means
 * owning axis math, tooltips, accessibility, locale formatting, animation and
 * a large bundle — none of which is a design-system concern. Instead this thin,
 * dependency-free module hands you a theme/config OBJECT built from the Kanso
 * design tokens; you register it with the charting library YOU already use.
 *
 * There is no runtime dependency on any chart library here — the return types
 * are plain objects, so nothing from `echarts` / `chart.js` is imported or
 * required at build time. Bring your own lib.
 *
 * @example
 * import * as echarts from 'echarts';
 * import { kansoEChartsTheme } from '@kanso-protocol/ui/charts';
 *
 * echarts.registerTheme('kanso', kansoEChartsTheme());
 * echarts.init(el, 'kanso');
 *
 * Colors are read from the CSS custom properties at CALL TIME via
 * `getComputedStyle`, so a theme built after a light/dark switch tracks the
 * active tokens automatically. Fallbacks (the resolved token hex values) cover
 * SSR and any environment where the stylesheet has not loaded.
 */

/** Options shared by the theme builders. */
export interface KpChartThemeOptions {
  /**
   * Element whose computed CSS custom properties are read. Defaults to the
   * document root (`<html>`). Pass a themed container to source tokens from a
   * scoped light/dark subtree.
   */
  root?: Element;
}

/** Plain ECharts-compatible theme object. Kept as an untyped record so no chart-lib types are needed. */
export type KpEChartsTheme = Record<string, unknown>;

/**
 * Resolved token fallbacks — the values the Kanso light-theme tokens resolve
 * to. Used when a custom property is unreadable (SSR, stylesheet not yet
 * applied, non-browser test env).
 */
const FALLBACK = {
  accentPrimary: '#1d4ed8', // blue.700
  accentSuccess: '#15803d', // green.700
  accentWarning: '#b45309', // amber.700
  accentDanger: '#b91c1c', // red.700
  accentInfo: '#0e7490', // cyan.700
  textStrong: '#18181b', // gray.900
  textDefault: '#3f3f46', // gray.700
  textMuted: '#71717a', // gray.500
  border: '#e4e4e7', // gray.200
  borderSubtle: '#f4f4f5', // gray.100
  surfaceBase: '#ffffff', // white
  surfaceSubtle: '#fafafa', // gray.50
  fontFamily: 'Onest, system-ui, sans-serif',
} as const;

/** Read a CSS custom property at call time; returns `fallback` when unreadable. */
function readToken(name: string, fallback: string, root?: Element): string {
  if (typeof getComputedStyle !== 'function') return fallback;
  const el = root ?? (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) return fallback;
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * The Kanso categorical color sequence for chart series — the five semantic
 * accent colors (primary, success, warning, danger, info), sourced from the
 * `--kp-color-accent-*-fg` tokens so it tracks the active theme.
 */
export function kansoChartColors(options?: KpChartThemeOptions): string[] {
  const root = options?.root;
  return [
    readToken('--kp-color-accent-primary-fg', FALLBACK.accentPrimary, root),
    readToken('--kp-color-accent-success-fg', FALLBACK.accentSuccess, root),
    readToken('--kp-color-accent-warning-fg', FALLBACK.accentWarning, root),
    readToken('--kp-color-accent-danger-fg', FALLBACK.accentDanger, root),
    readToken('--kp-color-accent-info-fg', FALLBACK.accentInfo, root),
  ];
}

/**
 * Build an ECharts theme object from the current Kanso tokens. Register it once
 * with `echarts.registerTheme('kanso', kansoEChartsTheme())`, then init charts
 * with the `'kanso'` theme id. Rebuild + re-register after a theme switch to
 * pick up the new token values.
 */
export function kansoEChartsTheme(options?: KpChartThemeOptions): KpEChartsTheme {
  const root = options?.root;

  const textStrong = readToken('--kp-color-text-strong', FALLBACK.textStrong, root);
  const textDefault = readToken('--kp-color-text-default', FALLBACK.textDefault, root);
  const textMuted = readToken('--kp-color-text-muted', FALLBACK.textMuted, root);
  const border = readToken('--kp-color-border-default', FALLBACK.border, root);
  const borderSubtle = readToken('--kp-color-border-subtle', FALLBACK.borderSubtle, root);
  const surfaceBase = readToken('--kp-color-surface-base', FALLBACK.surfaceBase, root);
  const surfaceSubtle = readToken('--kp-color-surface-subtle', FALLBACK.surfaceSubtle, root);
  const fontFamily = readToken('--kp-font-family-sans', FALLBACK.fontFamily, root);

  // Shared axis styling — fresh object per axis so consumers can safely mutate.
  const axis = () => ({
    axisLine: { show: true, lineStyle: { color: border } },
    axisTick: { show: true, lineStyle: { color: border } },
    axisLabel: { color: textMuted },
    splitLine: { show: true, lineStyle: { color: borderSubtle } },
    splitArea: { show: false, areaStyle: { color: [surfaceSubtle] } },
  });

  return {
    color: kansoChartColors(options),
    // Transparent so the chart sits on whatever Kanso surface hosts it.
    backgroundColor: 'transparent',
    textStyle: { fontFamily, color: textDefault },
    title: {
      textStyle: { color: textStrong, fontFamily },
      subtextStyle: { color: textMuted, fontFamily },
    },
    categoryAxis: axis(),
    valueAxis: axis(),
    logAxis: axis(),
    timeAxis: axis(),
    legend: { textStyle: { color: textDefault, fontFamily } },
    tooltip: {
      backgroundColor: surfaceBase,
      borderColor: border,
      borderWidth: 1,
      textStyle: { color: textDefault, fontFamily },
      axisPointer: {
        lineStyle: { color: border },
        crossStyle: { color: border },
      },
    },
  };
}
