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

// One representative story per component / pattern family. Goal is
// "visual contract" coverage — every component + pattern + example has
// at least one snapshot pair (light + dark) that catches token drift,
// dark-mode regressions, and unintentional layout changes. Avoid
// animation-heavy or DOM-non-deterministic stories (toasts mid-fade,
// rich-text editors with caret state) — those are noise factories.
const STORIES: StorySpec[] = [
  // ─── Components ──────────────────────────────────────────────────────
  { id: 'components-accordion--default',          name: 'accordion — default' },
  { id: 'components-alert--default',              name: 'alert — default' },
  { id: 'components-avatar--playground',          name: 'avatar — playground' },
  { id: 'components-avatargroup--playground',     name: 'avatar group — playground' },
  { id: 'components-badge--default',              name: 'badge — default' },
  { id: 'components-breadcrumbs--default',        name: 'breadcrumbs — default' },
  { id: 'components-button--default',             name: 'button — default' },
  { id: 'components-button--all-variants',        name: 'button — all variants' },
  { id: 'components-card--default',               name: 'card — default' },
  { id: 'components-checkbox--default',           name: 'checkbox — default' },
  { id: 'components-combobox--default',           name: 'combobox — default' },
  { id: 'components-datepicker--default',         name: 'datepicker — default' },
  { id: 'components-dialog--default',             name: 'dialog — default' },
  { id: 'components-divider--orientations',       name: 'divider — orientations' },
  { id: 'components-drawer--default',             name: 'drawer — default' },
  { id: 'components-dropdownmenu--default',       name: 'dropdown menu — default' },
  { id: 'components-emptystate--default',         name: 'empty state — default' },
  { id: 'components-fileupload--playground',      name: 'file upload — playground' },
  { id: 'components-formfield--states',           name: 'form field — states' },
  { id: 'components-icon--sizes',                 name: 'icon — sizes' },
  { id: 'components-input--default',              name: 'input — default' },
  { id: 'components-markdownviewer--changelog-preview', name: 'markdown viewer — changelog preview' },
  { id: 'components-numberstepper--default',      name: 'number stepper — default' },
  { id: 'components-pagination--default',         name: 'pagination — default' },
  { id: 'components-popover--default',            name: 'popover — default' },
  { id: 'components-progress-circular--values',   name: 'progress circular — values' },
  { id: 'components-progress-linear--with-label', name: 'progress linear — with label' },
  { id: 'components-radio--default',              name: 'radio — default' },
  { id: 'components-segmentedcontrol--default',   name: 'segmented control — default' },
  { id: 'components-select--default',             name: 'select — default' },
  { id: 'components-skeleton--default',           name: 'skeleton — default' },
  { id: 'components-slider--default',             name: 'slider — default' },
  { id: 'components-table--default',              name: 'table — default' },
  { id: 'components-tabs--default',               name: 'tabs — default' },
  { id: 'components-textarea--default',           name: 'textarea — default' },
  { id: 'components-timepicker--default',         name: 'timepicker — default' },
  { id: 'components-toggle--default',             name: 'toggle — default' },
  { id: 'components-tooltip--default',            name: 'tooltip — default' },
  { id: 'components-tree--default',               name: 'tree — default' },
  { id: 'components-virtuallist--ten-thousand-rows', name: 'virtual list — 10k rows' },
  { id: 'components-variablevirtuallist--variable-messages', name: 'variable virtual list — variable messages' },
  { id: 'components-tablevirtual--ten-thousand-rows', name: 'table virtual — 5k rows' },

  // ─── Patterns ────────────────────────────────────────────────────────
  { id: 'patterns-appshell--playground',          name: 'app shell — playground' },
  { id: 'patterns-banner--appearances',           name: 'banner — appearances' },
  { id: 'patterns-filterbar--features',           name: 'filter bar — features' },
  { id: 'patterns-header--saa-s-app',             name: 'header — SaaS app shell' },
  { id: 'patterns-navitem--states',               name: 'nav item — states' },
  { id: 'patterns-notificationcenter--playground', name: 'notification center — playground' },
  { id: 'patterns-pageerror--not-found',          name: 'page error — not found' },
  { id: 'patterns-pageheader--composition',       name: 'page header — composition' },
  { id: 'patterns-searchbar--sizes',              name: 'search bar — sizes' },
  { id: 'patterns-settingspanel--playground',     name: 'settings panel — playground' },
  { id: 'patterns-sidebar--dark-variant',         name: 'sidebar — dark variant' },
  { id: 'patterns-statcard--compositions',        name: 'stat card — compositions' },
  { id: 'patterns-tabletoolbar--compositions',    name: 'table toolbar — compositions' },
  { id: 'patterns-themetoggle--variants',         name: 'theme toggle — variants' },
  { id: 'patterns-usermenu--with-plan-badge',     name: 'user menu — with plan badge' },

  // ─── Examples ────────────────────────────────────────────────────────
  { id: 'examples-dashboard--default',            name: 'dashboard example' },
  { id: 'examples-detail-view--default',          name: 'detail view example' },
  { id: 'examples-list-view--default',            name: 'list view example' },
  { id: 'examples-login--default',                name: 'login example' },
  { id: 'examples-settings--default',             name: 'settings example' },
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

// ─── RTL pass ──────────────────────────────────────────────────────────
//
// Components use CSS logical properties throughout; this freezes how every
// direction-sensitive story renders under `dir="rtl"` so a future change that
// reaches for a physical property (margin-left, left:, ::before chevrons,
// non-mirrored padding) shows up as a diff. Light theme only — RTL is about
// axis, not color; doubling by theme would just add noise.
//
// Coverage is the full catalog MINUS the handful of stories that mirror
// identically (centered glyphs / symmetric shapes) — snapshotting those would
// only add noise, per the suite's curated-not-exhaustive stance. Snapshots
// live in the same -snapshots dir so CI's [update-baselines] step picks them up.
const RTL_EXCLUDE = new Set<string>([
  'components-icon--sizes',               // centered glyphs — mirror-identical
  'components-skeleton--default',         // symmetric placeholder blocks
  'components-progress-circular--values', // centered ring
  'components-divider--orientations',     // symmetric rules
  'components-avatar--playground',        // centered circle
]);
const RTL_STORIES: StorySpec[] = STORIES.filter((s) => !RTL_EXCLUDE.has(s.id));

async function setDir(page: Page, dir: 'ltr' | 'rtl'): Promise<void> {
  await page.evaluate((d) => {
    document.documentElement.setAttribute('dir', d);
    document.body.setAttribute('dir', d);
  }, dir);
  await page.waitForTimeout(50);
}

for (const story of RTL_STORIES) {
  test(`${story.name} — rtl`, async ({ page }) => {
    await gotoStory(page, story.id);
    await setTheme(page, 'light');
    await setDir(page, 'rtl');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      `${story.id}-rtl.png`,
    );
  });
}
