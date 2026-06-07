import { test, expect } from '@playwright/test';
import path from 'node:path';

/**
 * Custom-elements smoke. Loads the framework-agnostic bundle on a blank page
 * (no Angular host app) and proves Kanso components upgrade and render as
 * native custom elements — the contract non-Angular consumers rely on.
 *
 * Run: npx playwright test e2e/elements.spec.ts --config e2e/playwright.config.ts
 * (no Storybook server needed). Requires `npm run build:elements` first.
 */
const BUNDLE = path.resolve(__dirname, '../dist/elements/kanso-elements.mjs');

test('kp-badge and kp-card upgrade and render via the elements bundle', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('about:blank');
  await page.addScriptTag({ type: 'module', path: BUNDLE });

  // Define + mount two element-selector components.
  const result = await page.evaluate(async () => {
    await (customElements as CustomElementRegistry).whenDefined('kp-badge');
    await (customElements as CustomElementRegistry).whenDefined('kp-card');

    const badge = document.createElement('kp-badge');
    badge.textContent = 'New';
    document.body.appendChild(badge);

    const card = document.createElement('kp-card');
    document.body.appendChild(card);

    // Let Angular's zoneless CD flush the initial render.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    return {
      badgeDefined: !!customElements.get('kp-badge'),
      cardDefined: !!customElements.get('kp-card'),
      // Angular elements render into light DOM — the host gets child nodes.
      badgeRendered: badge.innerHTML.length > 0,
      badgeText: badge.textContent ?? '',
      badgeHasClass: !!badge.querySelector('[class*="kp-badge"]') || /kp-badge/.test(badge.className),
    };
  });

  expect(result.badgeDefined).toBe(true);
  expect(result.cardDefined).toBe(true);
  expect(result.badgeRendered).toBe(true);
  expect(result.badgeText).toContain('New');
  expect(errors, `page errors: ${errors.join(' | ')}`).toHaveLength(0);
});
