import type { Preview, Decorator } from '@storybook/angular';

/**
 * Global toolbar theme switcher.
 *
 * Kanso tokens are currently light-only. This toggle sets a
 * `data-theme` attribute on the document root + body so future
 * dark-mode tokens can key off it, and injects an override style tag
 * that paints all Storybook preview containers (html / body /
 * #storybook-root / .sb-show-main / .docs-story) — Storybook's own
 * backgrounds addon paints those elements with !important, so we
 * match it.
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

const STYLE_ID = 'kp-theme-override';

const applyTheme = (theme: string) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  if (root) root.setAttribute('data-theme', theme);
  if (body) body.setAttribute('data-theme', theme);

  const bg = theme === 'dark' ? '#09090B' : '#FFFFFF';
  const fg = theme === 'dark' ? '#FAFAFA' : '#18181B';

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    html, body,
    #storybook-root,
    #storybook-docs,
    .sb-show-main,
    .sb-main-padded,
    .sb-main-fullscreen,
    .docs-story,
    .sbdocs.sbdocs-preview,
    .sbdocs-content {
      background: ${bg} !important;
      color: ${fg};
    }
  `;
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
    // Disable the built-in backgrounds addon — the theme toolbar above
    // is the single source of truth for preview background.
    backgrounds: { disable: true },
  },
};

export default preview;
