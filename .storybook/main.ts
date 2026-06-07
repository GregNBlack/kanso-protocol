import { dirname, join } from "path";
import type { StorybookConfig } from '@storybook/angular';

// The Dark Theme Audit page is an internal tuning surface — useful while we
// iterate on dark-mode token values, but irrelevant (and confusing) for
// people browsing the published Storybook on gh-pages. Hide it from CI
// builds via env var; locally it's always present.
//
// Set KANSO_HIDE_AUDIT=1 (CI does this in .github/workflows/ci.yml's
// build-storybook step) to drop the audit file from the stories glob.
const HIDE_AUDIT = process.env.KANSO_HIDE_AUDIT === '1';

const auditStories = HIDE_AUDIT
  ? []
  : ['../packages/ui/stories/dark-theme-audit.stories.@(ts|tsx)'];

const config: StorybookConfig = {
  stories: [
    // Per-entry-point stories: packages/ui/<name>/stories (single segment,
    // so this does NOT match the root packages/ui/stories — that's handled
    // separately below with the audit gate).
    '../packages/ui/*/stories/*.stories.@(ts|tsx)',
    '../packages/examples/**/stories/*.stories.@(ts|tsx)',
    // Foundational stories at the ui root (non-audit; audit gated above).
    '../packages/ui/stories/!(dark-theme-audit).stories.@(ts|tsx)',
    ...auditStories,
    '../packages/ui/stories/*.mdx',
  ],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-a11y"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/angular"),
    options: {
      browserTarget: 'kanso-protocol:build',
    },
  },
  docs: {
    autodocs: true,
  },
  staticDirs: [
    { from: '../packages/ui/styles', to: '/styles' },
  ],
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
