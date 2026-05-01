import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpAvatarGroupComponent, KpAvatarGroupItem } from '../src/avatar-group.component';
import { KpAvatarComponent } from '@kanso-protocol/avatar';

const TEAM: KpAvatarGroupItem[] = [
  { initials: 'GB', appearance: 'default' },
  { initials: 'AJ', appearance: 'primary' },
  { initials: 'MK', appearance: 'success' },
  { initials: 'LR', appearance: 'warning' },
  { initials: 'NT', appearance: 'danger' },
  { initials: 'SF', appearance: 'info' },
  { initials: 'DS', appearance: 'neutral' },
  { initials: 'PV', appearance: 'default' },
];

const meta: Meta<KpAvatarGroupComponent> = {
  title: 'Components/AvatarGroup',
  component: KpAvatarGroupComponent,
  decorators: [
    moduleMetadata({ imports: [KpAvatarComponent] }),
  ],
  tags: ['autodocs'],
  argTypes: {
    size:      { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'], table: { defaultValue: { summary: 'md' } } },
    overlap:   { control: 'inline-radio', options: ['tight', 'normal', 'loose'], table: { defaultValue: { summary: 'normal' } } },
    max:       { control: { type: 'number', min: 1, max: 8 }, table: { defaultValue: { summary: '3' } } },
    total:     { control: 'number' },
    showCount: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
  },
};

export default meta;
type Story = StoryObj<KpAvatarGroupComponent>;

export const Playground: Story = {
  args: { size: 'md', overlap: 'normal', max: 3, showCount: true, total: 8, items: TEAM },
};

export const Sizes: Story = {
  render: () => ({
    props: { team: TEAM },
    template: `
      <div style="display:flex;flex-direction:column;gap:20px;font-family:Onest,system-ui,sans-serif">
        <div style="display:flex;align-items:center;gap:16px">
          <kp-avatar-group size="xs" [items]="team" [max]="3" [total]="8"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">xs</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px">
          <kp-avatar-group size="sm" [items]="team" [max]="3" [total]="8"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">sm</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px">
          <kp-avatar-group size="md" [items]="team" [max]="3" [total]="8"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">md</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px">
          <kp-avatar-group size="lg" [items]="team" [max]="3" [total]="8"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">lg</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px">
          <kp-avatar-group size="xl" [items]="team" [max]="3" [total]="8"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">xl</span>
        </div>
      </div>
    `,
  }),
};

export const Overlap: Story = {
  render: () => ({
    props: { team: TEAM },
    template: `
      <div style="display:flex;flex-direction:column;gap:20px;font-family:Onest,system-ui,sans-serif">
        <div style="display:flex;align-items:center;gap:16px">
          <kp-avatar-group size="md" overlap="tight" [items]="team" [max]="4" [total]="10"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">tight</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px">
          <kp-avatar-group size="md" overlap="normal" [items]="team" [max]="4" [total]="10"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">normal</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px">
          <kp-avatar-group size="md" overlap="loose" [items]="team" [max]="4" [total]="10"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">loose</span>
        </div>
      </div>
    `,
  }),
};

export const MaxVariants: Story = {
  render: () => ({
    props: { team: TEAM },
    template: `
      <div style="display:flex;flex-direction:column;gap:20px;font-family:Onest,system-ui,sans-serif">
        <kp-avatar-group size="md" [items]="team" [max]="3" [total]="10"/>
        <kp-avatar-group size="md" [items]="team" [max]="4" [total]="10"/>
        <kp-avatar-group size="md" [items]="team" [max]="5" [total]="10"/>
      </div>
    `,
  }),
};

export const WithoutCount: Story = {
  render: () => ({
    props: { team: TEAM },
    template: `
      <kp-avatar-group size="md" [items]="team" [max]="4" [showCount]="false"/>
    `,
  }),
};

export const UseCases: Story = {
  render: () => ({
    props: { team: TEAM },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;font-family:Onest,system-ui,sans-serif">
        <div style="display:flex;align-items:center;gap:10px">
          <kp-avatar-group size="sm" [items]="team" [max]="4" [total]="12"/>
          <span style="font-size:13px;color: var(--kp-color-gray-700)">12 team members</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <kp-avatar-group size="xs" [items]="team" [max]="5" [total]="24"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">24 people replied</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <kp-avatar-group size="md" [items]="team" [max]="3" [total]="7"/>
          <span style="font-size:13px;color: var(--kp-color-gray-700)">Shared with 7 people</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:12px;color: var(--kp-color-gray-600)">Assignees</span>
          <kp-avatar-group size="sm" [items]="team" [max]="3" [total]="5"/>
        </div>
      </div>
    `,
  }),
};
