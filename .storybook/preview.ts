import type { Preview } from '@storybook/angular';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

/**
 * Light / Dark theme switcher.
 *
 * Backed by `@storybook/addon-themes` — flips a `data-theme` attribute
 * on the iframe `<html>`. The actual colour swap is driven by
 * `packages/core/styles/dark.css`, loaded in `preview-head.html`,
 * which inverts the primitive grayscale + brand ramps under
 * `[data-theme="dark"]`.
 */
const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'dark', value: '#09090B' },
        { name: 'gray', value: '#FAFAFA' },
      ],
    },
  },
};

export default preview;
