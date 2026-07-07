import { test, expect, type Page } from '@playwright/test';

/**
 * prefers-reduced-motion enforcement.
 *
 * Every animated Kanso component ships an
 * `@media (prefers-reduced-motion: reduce)` block that collapses transitions
 * to ~0. Those blocks are inert in normal rendering (and in the visual /
 * a11y suites, which don't emulate the feature), so nothing tested them.
 *
 * This spec emulates `reducedMotion: 'reduce'` and asserts that, for stories
 * whose components carry transitions, EVERY element under #storybook-root has
 * an effectively-zero transition-duration. A component that regressed (lost
 * its reduced-motion block, or a new component added without one) would keep
 * its ~120ms transition and fail here.
 *
 * Spinner / infinite-loop stories are intentionally excluded — those keep a
 * (slowed) animation running by design to preserve the "busy" affordance.
 */

// Components with real hover/expand/color transitions (not infinite loops).
const STORIES = [
  'components-card--default',
  'components-checkbox--default',
  'components-accordion--default',
  'components-tabs--default',
  'components-alert--default',
  'components-input--default',
  'components-toggle--default',
  'components-segmentedcontrol--default',
];

function toMs(value: string): number {
  return (value || '0s')
    .split(',')
    .map((raw) => {
      const s = raw.trim();
      if (s.endsWith('ms')) return parseFloat(s);
      if (s.endsWith('s')) return parseFloat(s) * 1000;
      return 0;
    })
    .reduce((a, b) => Math.max(a, b), 0);
}

async function maxTransitionMs(page: Page): Promise<number> {
  return page.evaluate(() => {
    // Re-declare toMs inside the browser context.
    const parse = (value: string): number =>
      (value || '0s')
        .split(',')
        .map((raw) => {
          const s = raw.trim();
          if (s.endsWith('ms')) return parseFloat(s);
          if (s.endsWith('s')) return parseFloat(s) * 1000;
          return 0;
        })
        .reduce((a, b) => Math.max(a, b), 0);
    let max = 0;
    const root = document.querySelector('#storybook-root');
    if (!root) return 0;
    for (const el of root.querySelectorAll('*')) {
      const cs = getComputedStyle(el as Element);
      max = Math.max(max, parse(cs.transitionDuration));
    }
    return max;
  });
}

test.describe('prefers-reduced-motion: reduce collapses transitions', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const id of STORIES) {
    test(id, async ({ page }) => {
      await page.goto(`/iframe.html?id=${id}&viewMode=story`);
      await page.waitForSelector('#storybook-root', { state: 'attached' });
      await page.waitForLoadState('networkidle');
      // Sanity: without reduced-motion these components transition at ~120ms;
      // the media block must bring every element to effectively zero (0.01ms).
      const max = await maxTransitionMs(page);
      expect(max, `${id}: a transition survived reduced-motion (max ${max}ms)`).toBeLessThanOrEqual(1);
    });
  }
});
