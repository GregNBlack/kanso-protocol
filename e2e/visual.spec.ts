import { test, expect, type Page } from '@playwright/test';

/**
 * Visual-regression spec.
 *
 * Visits a curated set of Storybook stories and snapshots each in both
 * `[data-theme]` modes. Baselines live in `e2e/visual.spec.ts-snapshots/`.
 *
 * To update baselines after an intentional visual change:
 *   npm run test:visual:update
 *
 * Then commit the updated PNGs alongside the code change. The CI gate
 * runs without `--update-snapshots`, so any unexpected diff fails the build.
 */

interface StorySpec {
  /** Slug after `?path=/story/`. */
  id: string;
  /** Human label for the test name. */
  name: string;
}

// One representative story per component family. Add more as components
// stabilize — the goal is "visual contract", not "exhaustive coverage".
const STORIES: StorySpec[] = [
  // Atoms
  { id: 'components-button--default',         name: 'button — default' },
  { id: 'components-button--variants',        name: 'button — variants showcase' },
  { id: 'components-badge--default',          name: 'badge — default' },
  { id: 'components-input--default',          name: 'input — default' },
  { id: 'components-checkbox--default',       name: 'checkbox — default' },
  { id: 'components-radio--default',          name: 'radio — default' },
  { id: 'components-toggle--default',         name: 'toggle — default' },
  { id: 'components-select--default',         name: 'select — default' },
  { id: 'components-card--default',           name: 'card — default' },
  { id: 'components-alert--default',          name: 'alert — default' },
  { id: 'components-tabs--default',           name: 'tabs — default' },
  { id: 'components-table--default',          name: 'table — default' },
  // Patterns / examples
  { id: 'patterns-header--default',           name: 'header pattern' },
  { id: 'examples-dashboard--default',        name: 'dashboard example' },
];

const THEMES = ['light', 'dark'] as const;

async function gotoStory(page: Page, id: string): Promise<void> {
  // Storybook serves each story at /iframe.html?id=…&viewMode=story. Hitting
  // the iframe directly skips the manager UI and keeps the screenshot focused
  // on the rendered component.
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  // Wait for the story root + Storybook's "loaded" signal.
  await page.waitForSelector('#storybook-root', { state: 'attached' });
  await page.waitForLoadState('networkidle');
}

async function setTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.evaluate((t) => {
    document.documentElement.setAttribute('data-theme', t);
    document.body.setAttribute('data-theme', t);
  }, theme);
  // One frame for the new theme to settle.
  await page.waitForTimeout(50);
}

for (const story of STORIES) {
  for (const theme of THEMES) {
    test(`${story.name} — ${theme}`, async ({ page }) => {
      await gotoStory(page, story.id);
      await setTheme(page, theme);
      await expect(page.locator('#storybook-root')).toHaveScreenshot(
        `${story.id}-${theme}.png`,
      );
    });
  }
}
