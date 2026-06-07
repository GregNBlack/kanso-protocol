import { Meta, StoryObj } from '@storybook/angular';
import { KpPageHeaderComponent } from '../src/page-header.component';

const meta: Meta<KpPageHeaderComponent> = {
  title: 'Patterns/PageHeader',
  component: KpPageHeaderComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm','md','lg'], table: { defaultValue: { summary: 'md' } } },
  },
  parameters: {
    layout: 'padded',
    a11y: { config: { rules: [
      { id: 'landmark-unique', enabled: false },
      { id: 'landmark-no-duplicate-banner', enabled: false },
    ] } },
  },
};
export default meta;
type Story = StoryObj<KpPageHeaderComponent>;

const BTN_PRIMARY = `<button style="padding:8px 16px;background:#2563EB;color:#fff;border:none;border-radius:8px;font:500 14px Onest,system-ui,sans-serif;cursor:pointer">Create</button>`;
const BTN_GHOST = `<button style="padding:8px 16px;background: var(--kp-color-white);color: var(--kp-color-gray-700);border: 1px solid var(--kp-color-gray-200);border-radius:8px;font:500 14px Onest,system-ui,sans-serif;cursor:pointer">Export</button>`;
const CRUMBS = `<nav kpPageHeaderBreadcrumbs style="display:flex;gap:6px;align-items:center;font:13px Onest,system-ui,sans-serif;color: var(--kp-color-gray-600)"><span>Home</span><span>›</span><span>Projects</span><span>›</span><span style="color: var(--kp-color-gray-900)">Kanso Protocol</span></nav>`;
const TABS = `<div kpPageHeaderTabs style="display:flex;gap:24px;border-bottom:1px solid #E4E4E7;font:14px Onest,system-ui,sans-serif"><span style="padding:8px 0;border-bottom:2px solid #2563EB;color:#1D4ED8;font-weight:500">Overview</span><span style="padding:8px 0;color: var(--kp-color-gray-600)">Details</span><span style="padding:8px 0;color: var(--kp-color-gray-600)">Activity</span></div>`;
const ACTIONS = `<div kpPageHeaderActions style="display:flex;gap:8px">${BTN_GHOST}${BTN_PRIMARY}</div>`;

export const Playground: Story = {
  args: { size: 'md', title: 'All projects', description: '12 active projects', showDescription: true, showActions: true },
  render: (args) => ({
    props: args,
    template: `<kp-page-header [size]="size" [title]="title" [description]="description" [showDescription]="showDescription" [showActions]="showActions">${ACTIONS}</kp-page-header>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:40px">
        <kp-page-header size="sm" title="Small header" description="Short description." [showDescription]="true"/>
        <kp-page-header size="md" title="Medium header" description="This is the default size." [showDescription]="true"/>
        <kp-page-header size="lg" title="Large header" description="Marketing / hero pages." [showDescription]="true"/>
      </div>
    `,
  }),
};

export const Composition: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:40px">
        <kp-page-header title="Minimal"/>
        <kp-page-header title="With description" description="Some context below the title." [showDescription]="true"/>
        <kp-page-header title="Notification preferences" description="Manage how you receive updates." [showDescription]="true" [showBackButton]="true"/>
        <kp-page-header title="All projects" [showActions]="true">${ACTIONS}</kp-page-header>
        <kp-page-header title="Kanso Protocol" description="Open-source Angular design system" [showDescription]="true" [showBreadcrumbs]="true" [showActions]="true">${CRUMBS}${ACTIONS}</kp-page-header>
        <kp-page-header title="All projects" description="12 active projects" [showDescription]="true" [showBreadcrumbs]="true" [showActions]="true" [showTabs]="true">${CRUMBS}${ACTIONS}${TABS}</kp-page-header>
      </div>
    `,
  }),
};
