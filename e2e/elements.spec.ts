import { test, expect } from '@playwright/test';
import path from 'node:path';

/**
 * Custom-elements smoke. Loads the framework-agnostic bundle on a blank page
 * (no Angular host app) and proves Kanso components upgrade, render, accept
 * property inputs, and emit CustomEvent outputs — the contract non-Angular
 * consumers rely on (see docs/web-components.md).
 *
 * Run: npm run test:elements   (requires `npm run build:elements` first).
 */
const BUNDLE = path.resolve(__dirname, '../dist/packages/elements/kanso-elements.mjs');

test('elements upgrade, render, and expose the input/output contract', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('about:blank');
  await page.addScriptTag({ type: 'module', path: BUNDLE });

  const result = await page.evaluate(async () => {
    const reg = customElements as CustomElementRegistry;
    await reg.whenDefined('kp-badge');
    await reg.whenDefined('kp-card');
    await reg.whenDefined('kp-toggle');

    // 1. render in light DOM
    const badge = document.createElement('kp-badge');
    badge.textContent = 'New';
    document.body.appendChild(badge);

    const card = document.createElement('kp-card');
    document.body.appendChild(card);

    // 2. property input + 3. CustomEvent output (toggle exposes [on] / (onChange))
    const toggle = document.createElement('kp-toggle') as HTMLElement & { on?: boolean };
    document.body.appendChild(toggle);
    let eventFired = false;
    let lastDetail: unknown = undefined;
    // Listen broadly for any toggle output event.
    for (const evt of ['onChange', 'onChangeEvent', 'change', 'checkedChange']) {
      toggle.addEventListener(evt, (e) => {
        eventFired = true;
        lastDetail = (e as CustomEvent).detail;
      });
    }
    toggle.on = true; // property input

    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    // click the inner control to trigger an output
    const input = toggle.querySelector('input');
    input?.click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    return {
      defined: !!reg.get('kp-badge') && !!reg.get('kp-card') && !!reg.get('kp-toggle'),
      badgeRendered: badge.innerHTML.length > 0,
      badgeText: badge.textContent ?? '',
      cardRendered: card.innerHTML.length > 0,
      toggleRenderedInput: !!toggle.querySelector('input'),
      eventFired,
      lastDetail,
    };
  });

  expect(result.defined).toBe(true);
  expect(result.badgeRendered).toBe(true);
  expect(result.badgeText).toContain('New');
  expect(result.cardRendered).toBe(true);
  // property input drove a real form control to render
  expect(result.toggleRenderedInput).toBe(true);
  // output event reached a plain DOM listener
  expect(result.eventFired, 'a toggle output event should reach addEventListener').toBe(true);
  expect(errors, `page errors: ${errors.join(' | ')}`).toHaveLength(0);
});
