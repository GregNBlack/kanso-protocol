import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';
import type { ImpactValue } from 'axe-core';

/**
 * Storybook test-runner configuration.
 *
 * Runs on every story (`npm run test:storybook`) and asserts:
 *   1. Each story renders without throwing — in BOTH light and dark themes.
 *   2. axe-core finds no `moderate+` violations in either theme.
 *
 * Why both themes: dark-mode regressions (a hardcoded color, a missed token,
 * a contrast drop) used to slip past Storybook because the test-runner only
 * exercised the default theme. By driving `data-theme="dark"` programmatically
 * after the default pass, every component automatically gets a dark "storyshot"
 * — no need for per-component DarkMode story exports.
 *
 * Per-story rule overrides:
 *   parameters: {
 *     a11y: {
 *       disable: true,                                            // skip whole check
 *       config: { rules: [{ id: 'color-contrast', enabled: false }] },  // disable one
 *     },
 *   }
 *
 * The default disabled rules (region / landmark-one-main / page-has-heading-one)
 * are page-level — they don't apply to isolated component stories and would
 * flood the report otherwise.
 */
const BASE_DISABLED_RULES = ['region', 'landmark-one-main', 'page-has-heading-one'] as const;

type AxeRulesMap = Record<string, { enabled: boolean }>;

function buildRules(
  storyDisabledIds: string[] = [],
  storyEnabledOverrides: Record<string, boolean> = {},
): AxeRulesMap {
  const out: AxeRulesMap = {};
  for (const id of BASE_DISABLED_RULES) out[id] = { enabled: false };
  for (const id of storyDisabledIds) out[id] = { enabled: false };
  for (const [id, enabled] of Object.entries(storyEnabledOverrides)) {
    out[id] = { enabled };
  }
  return out;
}

function axeOptions(rules: AxeRulesMap) {
  return {
    detailedReport: true,
    detailedReportOptions: { html: true },
    axeOptions: { rules },
    includedImpacts: ['moderate', 'serious', 'critical'] as ImpactValue[],
  };
}

async function setTheme(
  page: Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0],
  theme: 'light' | 'dark',
) {
  await page.evaluate((t) => {
    document.documentElement.setAttribute('data-theme', t);
    document.body.setAttribute('data-theme', t);
  }, theme);
  // Give the browser a frame to repaint after the attribute flip — axe reads
  // computed styles, so it has to see the post-swap colors.
  await page.waitForTimeout(50);
}

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    const a11yParams = (storyContext.parameters as { a11y?: any }).a11y || {};

    if (a11yParams.disable === true) return;

    // Convert Storybook addon-a11y story-level rules into our axe rules map.
    // Story authors can disable specific rules by id when a story is
    // intentionally outside WCAG bounds (e.g. raw color-swatch demos).
    const storyRules = (a11yParams.config?.rules as { id: string; enabled?: boolean }[]) || [];
    const storyDisabled = storyRules.filter((r) => r.enabled === false).map((r) => r.id);
    const storyEnabled = Object.fromEntries(
      storyRules.filter((r) => r.enabled === true).map((r) => [r.id, true]),
    );
    const opts = axeOptions(buildRules(storyDisabled, storyEnabled));

    // Light pass — story already rendered in default theme.
    await checkA11y(page, '#storybook-root', opts);

    // Dark pass — flip theme and re-check. Catches dark-mode regressions
    // (missed tokens, hardcoded colors, contrast drops) on every story.
    await setTheme(page, 'dark');
    await checkA11y(page, '#storybook-root', opts);

    // Reset so the next story starts clean. Storybook normally tears down
    // the iframe between stories, but be defensive.
    await setTheme(page, 'light');
  },
};

export default config;
