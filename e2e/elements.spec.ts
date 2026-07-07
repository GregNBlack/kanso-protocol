import { test, expect } from '@playwright/test';
import path from 'node:path';
import http from 'node:http';
import fs from 'node:fs';
import type { AddressInfo } from 'node:net';

/**
 * Custom-elements smoke. Loads the framework-agnostic bundle on a blank page
 * (no Angular host app) and proves Kanso components upgrade, render, accept
 * property inputs, and emit CustomEvent outputs — the contract non-Angular
 * consumers rely on (see docs/web-components.md).
 *
 * Run: npm run test:elements   (requires `npm run build:elements` first).
 */
const BUNDLE = path.resolve(__dirname, '../dist/packages/elements/kanso-elements.mjs');

// The granular per-component entries (`@kanso-protocol/elements/<subpath>`, the
// tag minus `kp-`, built by `npm run build:elements`) are code-split — `define/<x>.mjs` imports
// shared `../chunks/*.mjs`. Those relative imports only resolve when the module
// is loaded over a real origin (import specifiers resolve against the module's
// own URL, not the page's). So we serve dist/packages/elements over a tiny
// static HTTP server and load granular entries by URL. (The all-in-one bundle
// is self-contained, so it can still load via a file path.)
const ELEMENTS_DIST = path.resolve(__dirname, '../dist/packages/elements');
let server: http.Server;
let elementsBase = '';

test.beforeAll(async () => {
  const types: Record<string, string> = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.map': 'application/json', '.json': 'application/json' };
  server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/' || urlPath === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
      return;
    }
    const filePath = path.join(ELEMENTS_DIST, path.normalize(urlPath));
    if (!filePath.startsWith(ELEMENTS_DIST) || !fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  elementsBase = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

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

/**
 * Feature A — a granular per-component import registers ONLY that element.
 * Loads just `define/badge.mjs` on a fresh page and proves kp-badge upgrades
 * while a component it never imports (kp-card) stays unregistered.
 */
test('a granular per-component import registers only that element', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  // Load from the served origin so the entry's `../chunks/*.mjs` imports resolve.
  await page.goto(`${elementsBase}/`);
  await page.addScriptTag({ type: 'module', url: `${elementsBase}/define/badge.mjs` });

  const result = await page.evaluate(async () => {
    await customElements.whenDefined('kp-badge');
    const badge = document.createElement('kp-badge');
    badge.textContent = 'Solo';
    document.body.appendChild(badge);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return {
      badgeDefined: !!customElements.get('kp-badge'),
      badgeRendered: badge.innerHTML.length > 0,
      // kp-card is never imported by the badge entry → must remain undefined.
      cardDefined: !!customElements.get('kp-card'),
    };
  });

  expect(result.badgeDefined).toBe(true);
  expect(result.badgeRendered).toBe(true);
  expect(result.cardDefined, 'granular badge import must NOT register kp-card').toBe(false);
  expect(errors, `page errors: ${errors.join(' | ')}`).toHaveLength(0);
});

/**
 * Feature B — form-control elements participate in a native <form> via
 * ElementInternals: their value lands in FormData under the host `name`, and
 * they reset with the form. Uses the all-in-one bundle (form association is
 * wired the same way there and in the granular entries).
 */
test('form-control elements contribute to FormData and reset with the form', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('about:blank');
  await page.addScriptTag({ type: 'module', path: BUNDLE });

  const result = await page.evaluate(async () => {
    await customElements.whenDefined('kp-input');
    await customElements.whenDefined('kp-checkbox');

    const form = document.createElement('form');
    form.innerHTML =
      '<kp-input name="email"></kp-input>' +
      '<kp-checkbox name="agree" value="yes"></kp-checkbox>';
    document.body.appendChild(form);

    // Wait for the inner native controls (light DOM) to render.
    const until = async (fn: () => boolean) => {
      for (let i = 0; i < 90 && !fn(); i++) await new Promise((r) => requestAnimationFrame(r));
    };
    const inputEl = () => form.querySelector('kp-input input') as HTMLInputElement | null;
    const checkEl = () => form.querySelector('kp-checkbox input') as HTMLInputElement | null;
    await until(() => !!inputEl() && !!checkEl());

    // Type into the text field (native input event bubbles to the host) and
    // tick the checkbox.
    const inp = inputEl()!;
    inp.value = 'a@b.com';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    checkEl()!.click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const submitted = new FormData(form);
    const afterEdit = { email: submitted.get('email'), agree: submitted.get('agree') };

    // Native reset → text back to empty, checkbox unchecked (omitted).
    form.reset();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const afterReset = Object.fromEntries(new FormData(form).entries());

    return { afterEdit, afterReset };
  });

  expect(result.afterEdit.email).toBe('a@b.com');
  expect(result.afterEdit.agree).toBe('yes');
  expect(result.afterReset.email).toBe('');
  expect(result.afterReset.agree).toBeUndefined();
  expect(errors, `page errors: ${errors.join(' | ')}`).toHaveLength(0);
});
