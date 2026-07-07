import { kansoEChartsTheme, kansoChartColors } from './public-api';

/** Stub getComputedStyle so custom-property reads resolve to a known token map. */
function mockTokens(map: Record<string, string>) {
  return vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: (prop: string) => map[prop] ?? '',
  } as unknown as CSSStyleDeclaration);
}

const TOKENS = {
  '--kp-color-accent-primary-fg': '#111111',
  '--kp-color-accent-success-fg': '#222222',
  '--kp-color-accent-warning-fg': '#333333',
  '--kp-color-accent-danger-fg': '#444444',
  '--kp-color-accent-info-fg': '#555555',
  '--kp-color-text-strong': '#101010',
  '--kp-color-text-default': '#202020',
  '--kp-color-text-muted': '#303030',
  '--kp-color-border-default': '#404040',
  '--kp-color-border-subtle': '#505050',
  '--kp-color-surface-base': '#606060',
  '--kp-color-surface-subtle': '#707070',
  '--kp-font-family-sans': 'TestFont, sans-serif',
};

describe('@kanso-protocol/ui/charts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('kansoChartColors', () => {
    it('returns the five semantic accent colors from tokens, in order', () => {
      mockTokens(TOKENS);
      expect(kansoChartColors()).toEqual([
        '#111111', // primary
        '#222222', // success
        '#333333', // warning
        '#444444', // danger
        '#555555', // info
      ]);
    });

    it('falls back to the resolved token hex values when properties are empty', () => {
      mockTokens({}); // every getPropertyValue → ''
      expect(kansoChartColors()).toEqual([
        '#1d4ed8',
        '#15803d',
        '#b45309',
        '#b91c1c',
        '#0e7490',
      ]);
    });
  });

  describe('kansoEChartsTheme', () => {
    it('has the expected top-level shape', () => {
      mockTokens(TOKENS);
      const theme = kansoEChartsTheme() as Record<string, unknown>;
      expect(Object.keys(theme)).toEqual(
        expect.arrayContaining([
          'color',
          'backgroundColor',
          'textStyle',
          'title',
          'categoryAxis',
          'valueAxis',
          'logAxis',
          'timeAxis',
          'legend',
          'tooltip',
        ]),
      );
      expect(Array.isArray(theme['color'])).toBe(true);
      expect((theme['color'] as string[]).length).toBe(5);
      expect(theme['backgroundColor']).toBe('transparent');
    });

    it('sources colors, font and surfaces from tokens', () => {
      mockTokens(TOKENS);
      const theme = kansoEChartsTheme() as any;
      expect(theme.color).toEqual(['#111111', '#222222', '#333333', '#444444', '#555555']);
      expect(theme.textStyle.fontFamily).toBe('TestFont, sans-serif');
      expect(theme.textStyle.color).toBe('#202020');
      expect(theme.title.textStyle.color).toBe('#101010'); // text-strong
      expect(theme.title.subtextStyle.color).toBe('#303030'); // text-muted
      expect(theme.tooltip.backgroundColor).toBe('#606060'); // surface-base
      expect(theme.tooltip.borderColor).toBe('#404040'); // border-default
      expect(theme.legend.textStyle.color).toBe('#202020'); // text-default
    });

    it('styles every axis type from border/text tokens', () => {
      mockTokens(TOKENS);
      const theme = kansoEChartsTheme() as any;
      for (const key of ['categoryAxis', 'valueAxis', 'logAxis', 'timeAxis']) {
        const axis = theme[key];
        expect(axis.axisLine.lineStyle.color).toBe('#404040'); // border-default
        expect(axis.axisLabel.color).toBe('#303030'); // text-muted
        expect(axis.splitLine.lineStyle.color).toBe('#505050'); // border-subtle
      }
    });

    it('returns fresh axis objects (safe to mutate independently)', () => {
      mockTokens(TOKENS);
      const theme = kansoEChartsTheme() as any;
      expect(theme.categoryAxis).not.toBe(theme.valueAxis);
    });

    it('falls back to token hex values when no custom properties resolve', () => {
      mockTokens({});
      const theme = kansoEChartsTheme() as any;
      expect(theme.color[0]).toBe('#1d4ed8');
      expect(theme.textStyle.color).toBe('#3f3f46'); // text-default fallback
      expect(theme.tooltip.backgroundColor).toBe('#ffffff'); // surface-base fallback
      expect(theme.textStyle.fontFamily).toBe('Onest, system-ui, sans-serif');
    });

    it('reads tokens from a provided root element', () => {
      const spy = mockTokens(TOKENS);
      const root = document.createElement('div');
      kansoEChartsTheme({ root });
      // Every getComputedStyle call must target the supplied root, not <html>.
      expect(spy).toHaveBeenCalled();
      for (const call of spy.mock.calls) {
        expect(call[0]).toBe(root);
      }
    });
  });
});
