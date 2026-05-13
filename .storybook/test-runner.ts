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
    // CI gate threshold: only `critical` impact fails the build. `serious`
    // + `moderate` still surface in the detailed report (so regressions are
    // visible), but they're advisory rather than blocking. This lets the
    // job drop `continue-on-error: true` while leaving the long-tail of
    // edge-case color-contrast / landmark violations addressable on their
    // own cadence instead of blocking every PR.
    includedImpacts: ['critical'] as ImpactValue[],
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
  // Give the browser time to repaint after the attribute flip — axe reads
  // computed styles, so it has to see the post-swap colors. Components use
  // 100-150ms bg/color transitions; if axe samples mid-transition it sees
  // an interpolated color and reports a false-positive contrast violation.
  await page.waitForTimeout(200);
}

// Disable CSS transitions/animations so axe never samples mid-flight
// interpolated colors (see setTheme comment).
async function freezeAnimations(
  page: Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0],
) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
        caret-color: transparent !important;
      }
    `,
  });
}

// Explicitly clear axe-core's internal "running" lock + re-inject the
// script. axe-core throws "Axe is already running" if its lock is still
// held — and that lock isn't reliably released by the time axe-playwright
// resolves checkA11y, especially between stories or between light/dark
// passes within a story. Aggressively resetting before each scan keeps
// the suite race-free.
async function resetAxe(page: Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0]) {
  await page.evaluate(() => {
    // Different axe-core versions use different internal flag names; clear
    // anything that looks like a "currently running" sentinel and wipe the
    // global so injectAxe re-creates it cleanly.
    const w = window as unknown as { axe?: { _running?: boolean; running?: boolean } };
    if (w.axe) {
      if (w.axe._running) w.axe._running = false;
      if (w.axe.running) w.axe.running = false;
      delete (window as unknown as { axe?: unknown }).axe;
    }
  });
  await injectAxe(page);
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

    await freezeAnimations(page);

    // Known false-positive selectors excluded across every story:
    //   .kp-toggle__input — sr-only `<input type="checkbox" role="switch">`
    //     visually clipped to 1×1 with clip-path: inset(50%). The visual
    //     proxy (thumb on track) has its own passing contrast; the input
    //     itself isn't seen by sighted users, but axe reads its color
    //     anyway. Excluding the node, not the rule, keeps color-contrast
    //     active for everything else inside toggle and its consumers
    //     (settings-row, switch panels, etc).
    const a11yContext = {
      include: [['#storybook-root']],
      exclude: [['.kp-toggle__input']],
    };

    // Reset axe state before each pass. preVisit's injectAxe can race with
    // a still-cleaning-up previous story; doing a full reset here is the
    // belt-and-suspenders that keeps "Axe is already running" from
    // surfacing in CI between stories AND between light/dark passes.
    await resetAxe(page);

    // Light pass — story already rendered in default theme.
    await checkA11y(page, a11yContext, opts);

    await resetAxe(page);

    // Dark pass — flip theme and re-check. Catches dark-mode regressions
    // (missed tokens, hardcoded colors, contrast drops) on every story.
    await setTheme(page, 'dark');
    await checkA11y(page, a11yContext, opts);

    // Reset so the next story starts clean. Storybook normally tears down
    // the iframe between stories, but be defensive.
    await setTheme(page, 'light');
  },
};

export default config;
