import type { TestRunnerConfig } from '@storybook/test-runner';
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
 * — no need for per-component DarkMode.story exports.
 *
 * Rules that only apply to full pages are disabled to match the behaviour of
 * the preview-layer a11y addon — isolated component stories should not be
 * penalised for missing landmarks / h1 / main region.
 */
const AXE_OPTIONS = {
  detailedReport: true,
  detailedReportOptions: { html: true },
  axeOptions: {
    rules: {
      'region': { enabled: false },
      'landmark-one-main': { enabled: false },
      'page-has-heading-one': { enabled: false },
    },
  },
  includedImpacts: ['moderate', 'serious', 'critical'] as ImpactValue[],
};

async function setTheme(page: Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0], theme: 'light' | 'dark') {
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
  async postVisit(page) {
    // Light pass — story already rendered in default theme.
    await checkA11y(page, '#storybook-root', AXE_OPTIONS);

    // Dark pass — flip theme and re-check. Catches dark-mode regressions
    // (missed tokens, hardcoded colors, contrast drops) on every story.
    await setTheme(page, 'dark');
    await checkA11y(page, '#storybook-root', AXE_OPTIONS);

    // Reset so the next story starts clean. Storybook normally tears down
    // the iframe between stories, but be defensive.
    await setTheme(page, 'light');
  },
};

export default config;
