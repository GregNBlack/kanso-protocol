import type { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * Storybook test-runner configuration.
 *
 * Runs on every story (`npm run test:storybook`) and asserts:
 *   1. Each story renders without throwing.
 *   2. axe-core finds no violations above `moderate` severity.
 *
 * Rules that only apply to full pages are disabled here to match the
 * behaviour of the preview-layer a11y addon — isolated component stories
 * should not be penalised for missing landmarks / h1 / main region.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        rules: {
          'region': { enabled: false },
          'landmark-one-main': { enabled: false },
          'page-has-heading-one': { enabled: false },
        },
      },
      includedImpacts: ['moderate', 'serious', 'critical'],
    });
  },
};

export default config;
