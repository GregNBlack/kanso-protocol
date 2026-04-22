import { Meta, StoryObj } from '@storybook/angular';
import { KpAvatarComponent } from '../src/avatar.component';

const meta: Meta<KpAvatarComponent> = {
  title: 'Components/Avatar',
  component: KpAvatarComponent,
  tags: ['autodocs'],
  argTypes: {
    size:       { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'], table: { defaultValue: { summary: 'md' } } },
    shape:      { control: 'inline-radio', options: ['circle', 'square'], table: { defaultValue: { summary: 'circle' } } },
    appearance: { control: 'select', options: ['default', 'primary', 'success', 'warning', 'danger', 'info', 'neutral'], table: { defaultValue: { summary: 'default' } } },
    initials:   { control: 'text' },
    src:        { control: 'text' },
    showStatus: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    status:     { control: 'inline-radio', options: ['online', 'offline', 'busy', 'away'], table: { defaultValue: { summary: 'online' } } },
    showRing:   { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Avatar represents a user, org, or entity via image, initials, or a glyph. Six sizes · two shapes · seven color roles · optional status dot · optional contrast ring for stacks.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<KpAvatarComponent>;

export const Playground: Story = {
  args: { size: 'md', shape: 'circle', appearance: 'default', initials: 'GB' },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;align-items:end">
        <kp-avatar size="xs" initials="GB"/>
        <kp-avatar size="sm" initials="GB"/>
        <kp-avatar size="md" initials="GB"/>
        <kp-avatar size="lg" initials="GB"/>
        <kp-avatar size="xl" initials="GB"/>
        <kp-avatar size="2xl" initials="GB"/>
      </div>
    `,
  }),
};

export const Shapes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;align-items:center">
        <kp-avatar size="lg" shape="circle" initials="GB"/>
        <kp-avatar size="lg" shape="square" initials="AB"/>
        <kp-avatar size="lg" shape="circle" appearance="neutral"/>
        <kp-avatar size="lg" shape="square" appearance="primary" initials="KP"/>
      </div>
    `,
  }),
};

export const ContentTypes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;align-items:center">
        <kp-avatar size="lg" initials="GB"/>
        <kp-avatar size="lg" appearance="primary" initials="AJ"/>
        <kp-avatar size="lg" appearance="neutral"/>
        <kp-avatar size="lg" shape="square" appearance="neutral">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14M15 21h4a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-4M7 8h2M7 12h2M7 16h2"/>
          </svg>
        </kp-avatar>
      </div>
    `,
  }),
};

export const Appearances: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;align-items:center">
        <kp-avatar size="md" appearance="default" initials="DE"/>
        <kp-avatar size="md" appearance="primary" initials="PR"/>
        <kp-avatar size="md" appearance="success" initials="SU"/>
        <kp-avatar size="md" appearance="warning" initials="WA"/>
        <kp-avatar size="md" appearance="danger"  initials="DA"/>
        <kp-avatar size="md" appearance="info"    initials="IN"/>
        <kp-avatar size="md" appearance="neutral" initials="NE"/>
      </div>
    `,
  }),
};

export const WithStatus: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:28px;align-items:center">
        <kp-avatar size="lg" initials="GB" [showStatus]="true" status="online"/>
        <kp-avatar size="lg" initials="AJ" appearance="primary" [showStatus]="true" status="busy"/>
        <kp-avatar size="lg" initials="MK" appearance="success" [showStatus]="true" status="away"/>
        <kp-avatar size="lg" initials="LR" [showStatus]="true" status="offline"/>
      </div>
    `,
  }),
};

export const WithRing: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center">
        <kp-avatar size="lg" initials="GB" [showRing]="true" style="margin-right:-12px"/>
        <kp-avatar size="lg" appearance="primary" initials="AJ" [showRing]="true" style="margin-right:-12px"/>
        <kp-avatar size="lg" appearance="success" initials="MK" [showRing]="true" style="margin-right:-12px"/>
        <kp-avatar size="lg" appearance="warning" initials="LR" [showRing]="true"/>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:28px;font-family:Onest,system-ui,sans-serif">
        <div style="display:flex;gap:10px;align-items:center">
          <kp-avatar size="md" initials="GB"/>
          <div style="display:flex;flex-direction:column;line-height:1.2">
            <span style="font-size:13px;font-weight:500">Greg Black</span>
            <span style="font-size:12px;color:#71717A">Admin</span>
          </div>
        </div>
        <div style="display:flex;gap:12px;align-items:flex-start">
          <kp-avatar size="md" initials="GB"/>
          <div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-size:13px;font-weight:500">Greg Black</span>
            <span style="font-size:13px;color:#3F3F46">Ship it — the last pass looks great.</span>
          </div>
        </div>
        <div style="display:flex;gap:12px;align-items:center">
          <kp-avatar size="md" initials="AJ" [showStatus]="true" status="online"/>
          <div style="display:flex;flex-direction:column;line-height:1.2">
            <span style="font-size:13px;font-weight:500">Anna Jones</span>
            <span style="font-size:12px;color:#71717A">anna@example.com</span>
          </div>
        </div>
      </div>
    `,
  }),
};
