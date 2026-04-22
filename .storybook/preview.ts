import type { Preview } from '@storybook/angular';
import '@tabler/icons-webfont/dist/tabler-icons.min.css';

const preview: Preview = {
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
