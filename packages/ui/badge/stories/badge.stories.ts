import { Meta, StoryObj } from '@storybook/angular';
import { KpBadgeComponent } from '../src/badge.component';

// Tabler-style SVG `d` attributes (stroke=currentColor)
const ICON = {
  check:    'M5 12l5 5L20 7',
  alertCircle:   'M12 8v4M12 16v.01M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z',
  alertTriangle: 'M12 9v4M12 17v.01M10.24 3.957L3.2 16.104a2 2 0 0 0 1.737 3h14.118a2 2 0 0 0 1.737-3L13.76 3.957a2 2 0 0 0-3.52 0z',
  infoCircle:    'M12 8v.01M11 12h1v4h1M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z',
  star:     'M12 17.75l-6.172 3.245 1.179-6.873-4.993-4.867 6.9-1.002L12 2.5l3.086 6.253 6.9 1.002-4.993 4.867 1.179 6.873z',
  lock:     'M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM11 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0zM8 11V7a4 4 0 1 1 8 0v4',
};

function icon(d: string): string {
  return `<svg kpBadgeIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
}

const meta: Meta<KpBadgeComponent> = {
  title: 'Components/Badge',
  component: KpBadgeComponent,
  tags: ['autodocs'],
  argTypes: {
    size:       { control: 'inline-radio', options: ['xs', 'sm', 'md'], table: { defaultValue: { summary: 'md' } } },
    appearance: { control: 'select', options: ['filled', 'subtle', 'outline', 'dot'], table: { defaultValue: { summary: 'filled' } } },
    color:      { control: 'select', options: ['primary', 'danger', 'success', 'warning', 'info', 'neutral'], table: { defaultValue: { summary: 'primary' } } },
    pill:           { control: 'boolean', description: 'Fully rounded sides — for chips and word-bearing tags', table: { defaultValue: { summary: 'false' } } },
    count:          { control: 'boolean', description: 'Counter shape — tight circle for short numeric content (1, 12, 99+)', table: { defaultValue: { summary: 'false' } } },
    showLeadingDot: { control: 'boolean', description: 'Force a leading dot marker (auto-shown when appearance=dot)', table: { defaultValue: { summary: 'false' } } },
    closable:       { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
};
export default meta;
type Story = StoryObj<KpBadgeComponent>;

export const Default: Story = {
  args: { size: 'md', appearance: 'filled', color: 'primary', pill: false, count: false, showLeadingDot: false, closable: false },
  render: (args) => ({
    props: args,
    template: `<kp-badge [size]="size" [appearance]="appearance" [color]="color" [pill]="pill" [count]="count" [showLeadingDot]="showLeadingDot" [closable]="closable">Badge</kp-badge>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-badge size="xs">Badge</kp-badge><span style="font-size:11px;color: var(--kp-color-gray-600)">xs</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-badge size="sm">Badge</kp-badge><span style="font-size:11px;color: var(--kp-color-gray-600)">sm</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-badge size="md">Badge</kp-badge><span style="font-size:11px;color: var(--kp-color-gray-600)">md</span></div>
      </div>`,
  }),
};

export const Appearances: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-badge appearance="filled">Primary</kp-badge><span style="font-size:11px;color: var(--kp-color-gray-600)">Filled</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-badge appearance="subtle">Primary</kp-badge><span style="font-size:11px;color: var(--kp-color-gray-600)">Subtle</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-badge appearance="outline">Primary</kp-badge><span style="font-size:11px;color: var(--kp-color-gray-600)">Outline</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-badge appearance="dot">Primary</kp-badge><span style="font-size:11px;color: var(--kp-color-gray-600)">Dot</span></div>
      </div>`,
  }),
};

export const ColorRoles: Story = {
  name: 'Color Roles',
  render: () => {
    const roles = ['primary', 'danger', 'success', 'warning', 'info', 'neutral'] as const;
    const row = (role: string) =>
      `<div style="display:flex;align-items:center;gap:16px">
        <kp-badge color="${role}" appearance="filled">${cap(role)}</kp-badge>
        <kp-badge color="${role}" appearance="subtle">${cap(role)}</kp-badge>
        <kp-badge color="${role}" appearance="outline">${cap(role)}</kp-badge>
        <kp-badge color="${role}" appearance="dot">${cap(role)}</kp-badge>
      </div>`;
    return {
      template: `<div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">${roles.map(row).join('')}</div>`,
    };
    function cap(s: string) { return s[0].toUpperCase() + s.slice(1); }
  },
};

export const Shapes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:24px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-badge appearance="subtle">Rounded</kp-badge><span style="font-size:11px;color: var(--kp-color-gray-600)">Rounded</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-badge appearance="subtle" [pill]="true">Pill</kp-badge><span style="font-size:11px;color: var(--kp-color-gray-600)">Pill</span></div>
      </div>`,
  }),
};

export const WithIcon: Story = {
  name: 'With Icon',
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <kp-badge color="success" appearance="subtle">${icon(ICON.check)}Active</kp-badge>
        <kp-badge color="danger" appearance="subtle">${icon(ICON.alertCircle)}Error</kp-badge>
        <kp-badge color="warning" appearance="subtle">${icon(ICON.alertTriangle)}Warning</kp-badge>
        <kp-badge color="info" appearance="subtle">${icon(ICON.infoCircle)}Info</kp-badge>
        <kp-badge color="primary" appearance="subtle">${icon(ICON.star)}Featured</kp-badge>
        <kp-badge color="neutral" appearance="subtle">${icon(ICON.lock)}Private</kp-badge>
      </div>`,
  }),
};

export const WithDot: Story = {
  name: 'With Dot',
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <kp-badge appearance="dot" color="success">Online</kp-badge>
        <kp-badge appearance="dot" color="warning">Away</kp-badge>
        <kp-badge appearance="dot" color="danger">Busy</kp-badge>
        <kp-badge appearance="dot" color="neutral">Offline</kp-badge>
        <kp-badge appearance="dot" color="info">Syncing</kp-badge>
      </div>`,
  }),
};

export const Closable: Story = {
  render: () => ({
    props: { onClose: (_e: any) => undefined },
    template: `
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <kp-badge color="primary" appearance="subtle" [pill]="true" [closable]="true" (close)="onClose($event)">Design</kp-badge>
        <kp-badge color="success" appearance="subtle" [pill]="true" [closable]="true" (close)="onClose($event)">Development</kp-badge>
        <kp-badge color="warning" appearance="subtle" [pill]="true" [closable]="true" (close)="onClose($event)">Marketing</kp-badge>
        <kp-badge color="info"    appearance="subtle" [pill]="true" [closable]="true" (close)="onClose($event)">Research</kp-badge>
        <kp-badge color="neutral" appearance="subtle" [pill]="true" [closable]="true" (close)="onClose($event)">Archived</kp-badge>
      </div>`,
  }),
};

export const Counters: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:16px">
        <kp-badge size="xs" [count]="true" color="danger">1</kp-badge>
        <kp-badge size="xs" [count]="true" color="danger">5</kp-badge>
        <kp-badge size="xs" [count]="true" color="danger">12</kp-badge>
        <kp-badge size="xs" [count]="true" color="danger">99</kp-badge>
        <kp-badge size="xs" [count]="true" color="danger">99+</kp-badge>
      </div>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    props: { onClose: (_e: any) => undefined },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:12px;color: var(--kp-color-gray-600)">User status:</span>
          <kp-badge appearance="dot" color="success">Online</kp-badge>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:12px;color: var(--kp-color-gray-600)">Order #1234:</span>
          <kp-badge appearance="subtle" color="warning">Pending</kp-badge>
          <kp-badge appearance="subtle" color="info">Priority</kp-badge>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:12px;color: var(--kp-color-gray-600)">Article tags:</span>
          <kp-badge color="neutral" appearance="subtle" [pill]="true" [closable]="true" (close)="onClose($event)">Design</kp-badge>
          <kp-badge color="neutral" appearance="subtle" [pill]="true" [closable]="true" (close)="onClose($event)">UX</kp-badge>
          <kp-badge color="neutral" appearance="subtle" [pill]="true" [closable]="true" (close)="onClose($event)">Product</kp-badge>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:12px;color: var(--kp-color-gray-600)">Notifications:</span>
          <kp-badge size="xs" [count]="true" color="danger">3</kp-badge>
        </div>
      </div>`,
  }),
};
