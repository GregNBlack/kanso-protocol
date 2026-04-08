import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../packages/components/**/stories/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  staticDirs: [
    { from: '../packages/core/styles', to: '/styles' },
  ],
};

export default config;
