import type { Preview, Decorator } from '@storybook/angular';

/**
 * Global toolbar theme switcher.
 *
 * Kanso tokens are currently light-only. This toggle sets the preview
 * background and a `data-theme="dark"` attribute on the document root
 * so future dark-mode tokens can key off it without another rebuild.
 */
export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Preview theme (light / dark background)',
    defaultValue: 'light',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'light', title: 'Light', icon: 'sun' },
        { value: 'dark',  title: 'Dark',  icon: 'moon' },
      ],
      dynamicTitle: true,
    },
  },
};

const applyTheme = (theme: string) => {
  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return;
  root.setAttribute('data-theme', theme);
  body.setAttribute('data-theme', theme);
  body.style.background = theme === 'dark' ? '#09090B' : '#FFFFFF';
  body.style.color = theme === 'dark' ? '#FAFAFA' : '#18181B';
};

const themeDecorator: Decorator = (storyFn, context) => {
  const theme = (context.globals?.theme as string) || 'light';
  applyTheme(theme);
  return storyFn();
};

const preview: Preview = {
  decorators: [themeDecorator],
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
