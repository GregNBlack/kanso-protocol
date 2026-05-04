import { defineConfig, devices } from '@playwright/test';

/**
 * Visual-regression suite. Runs a small spec that visits a curated set of
 * Storybook stories, screenshots each in light + dark mode, and diffs against
 * baselines committed to the repo (`e2e/visual.spec.ts-snapshots/`).
 *
 * Why curated and not all-stories: visual regression on 350+ stories produces
 * noisy diffs (animations, focus rings, sub-pixel font shifts). Better to
 * cover the canonical surface — one representative story per component
 * family — and rely on axe + unit tests for the long tail.
 *
 * Run locally:
 *   npm run build-storybook
 *   npx http-server storybook-static --port 6006 --silent &
 *   npm run test:visual
 *   # update baselines: npm run test:visual:update
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.STORYBOOK_URL || 'http://localhost:6006',
    // Pixel-diff tolerance — accommodates sub-pixel font rendering across
    // CI runners and local Macs without losing real visual changes.
    expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
      },
    },
  ],
});
