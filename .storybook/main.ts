import { dirname, join } from "path";
import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../packages/components/**/stories/*.stories.@(ts|tsx)',
    '../packages/patterns/**/stories/*.stories.@(ts|tsx)',
    '../packages/core/stories/*.stories.@(ts|tsx)',
  ],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-themes"),
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
    { from: '../packages/core/styles', to: '/styles' },
  ],
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
