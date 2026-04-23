import type { Preview, Decorator } from '@storybook/angular';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

/**
 * Light / Dark theme switcher.
 *
 * Backed by `@storybook/addon-themes` — flips a `data-theme` attribute
 * on the iframe `<html>`. The actual colour swap is driven by
 * `packages/core/styles/dark.css`, loaded in `preview-head.html`,
 * which inverts the primitive grayscale + brand ramps under
 * `[data-theme="dark"]`.
 *
 * The second decorator below is a belt-and-braces mirror: it copies
 * the chosen theme onto `<body>` (and re-asserts on `<html>`) every
 * render, in case the iframe document gets reset by HMR or autodocs.
 */
const mirrorThemeDecorator: Decorator = (storyFn, context) => {
  if (typeof document !== 'undefined') {
    const theme = (context.globals?.theme as string) || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }
  return storyFn();
};

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
    mirrorThemeDecorator,
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Backgrounds addon disabled — body background is driven by
    // `[data-theme]` rules in `packages/core/styles/dark.css`, so the
    // theme switcher alone flips both component colours and the canvas.
    backgrounds: { disable: true },
  },
};

export default preview;
