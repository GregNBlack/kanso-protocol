import { Meta, StoryObj } from '@storybook/angular';
import { KpMarkdownViewerComponent } from '../src/markdown-viewer.component';

const meta: Meta<KpMarkdownViewerComponent> = {
  title: 'Components/MarkdownViewer',
  component: KpMarkdownViewerComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], table: { defaultValue: { summary: 'md' } } },
    content: { control: 'text' },
    trusted: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Read-only markdown renderer. Default parser is `marked`. Pass `[parser]` to swap in `markdown-it`, `remark`, or any custom `(md: string) => string` function.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<KpMarkdownViewerComponent>;

const sample = `# Hello, Kanso

A read-only markdown renderer for **READMEs**, **changelogs**, and other prose surfaces inside the app.

## Features

- CommonMark + GFM via \`marked\`
- Pluggable parser via \`[parser]\`
- Sanitized output by default (Angular DOM sanitizer)
- Three sizes: \`sm\`, \`md\`, \`lg\`

## Code

\`\`\`ts
import { KpMarkdownViewerComponent } from '@kanso-protocol/ui/markdown-viewer';
const html = marked.parse(readme);
\`\`\`

> Use the larger size for full-page viewers; the small size fits inline help text.

## Table

| Stat | Value |
|------|-------|
| Bundle | small |
| Deps | 1 (marked) |

[Read the contract →](https://example.com)`;

export const Playground: Story = {
  args: {
    size: 'md',
    content: sample,
  },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;max-width:980px">
        <kp-markdown-viewer size="sm" [content]="md"/>
        <kp-markdown-viewer size="md" [content]="md"/>
        <kp-markdown-viewer size="lg" [content]="md"/>
      </div>
    `,
    props: { md: '## A heading\n\nA short paragraph with `code` and **bold**.\n\n- one\n- two' },
  }),
};

export const ChangelogPreview: Story = {
  args: {
    size: 'md',
    content: `## 2026-04-28 — un-invert brand action shades + white solid-button fg

Step B of the dark architecture rebuild.

### Bumps

- \`@kanso-protocol/core\` \`0.4.0\` → \`0.5.0\`

### Migration

None for token consumers using \`--kp-color-accent-*\`.`,
  },
};

export const Empty: Story = {
  args: { content: '' },
};
