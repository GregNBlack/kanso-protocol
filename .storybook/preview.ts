import type { Preview } from '@storybook/angular';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

/**
 * Native theme switcher from `@storybook/addon-themes`.
 *
 * Adds a Light/Dark toggle to the top toolbar and sets
 * `data-theme="light|dark"` on the document root. Kanso tokens are
 * currently light-only; once dark tokens land they can key off this
 * attribute and the components will adapt automatically.
 *
 * Preview background is driven by the built-in `backgrounds` addon
 * (configured below) — the values line up with the two themes.
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
