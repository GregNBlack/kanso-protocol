import { Meta, StoryObj } from '@storybook/angular';
import { KpContainerComponent } from '../src/container.component';

const meta: Meta<KpContainerComponent> = {
  title: 'Patterns/Container',
  component: KpContainerComponent,
  tags: ['autodocs'],
  argTypes: {
    width:   { control: 'inline-radio', options: ['narrow', 'medium', 'wide', 'full'], table: { defaultValue: { summary: 'wide' } } },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'], table: { defaultValue: { summary: 'md' } } },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Responsive content wrapper with four max-width breakpoints and four horizontal padding scales. Purely layout — no colors, borders, or vertical rhythm.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<KpContainerComponent>;

const BG = 'background: var(--kp-color-gray-100);min-height:180px;padding:40px 0;';
const SLOT = 'background: var(--kp-color-white);border:1px dashed #D4D4D8;border-radius:6px;padding:32px;color: var(--kp-color-gray-600);text-align:center;font-family:Onest,system-ui,sans-serif;';

export const Widths: Story = {
  render: () => ({
    template: `
      <div style="${BG}">
        <div style="display:flex;flex-direction:column;gap:16px">
          <kp-container width="narrow" padding="md"><div style="${SLOT}">narrow · max 640</div></kp-container>
          <kp-container width="medium" padding="md"><div style="${SLOT}">medium · max 960</div></kp-container>
          <kp-container width="wide"   padding="md"><div style="${SLOT}">wide · max 1280</div></kp-container>
          <kp-container width="full"   padding="md"><div style="${SLOT}">full · 100%</div></kp-container>
        </div>
      </div>
    `,
  }),
};

export const Paddings: Story = {
  render: () => ({
    template: `
      <div style="${BG}">
        <div style="display:flex;flex-direction:column;gap:16px">
          <kp-container width="medium" padding="none"><div style="${SLOT}">padding=none</div></kp-container>
          <kp-container width="medium" padding="sm"  ><div style="${SLOT}">padding=sm · 16</div></kp-container>
          <kp-container width="medium" padding="md"  ><div style="${SLOT}">padding=md · 24</div></kp-container>
          <kp-container width="medium" padding="lg"  ><div style="${SLOT}">padding=lg · 32</div></kp-container>
        </div>
      </div>
    `,
  }),
};

export const RealContent: Story = {
  render: () => ({
    template: `
      <div style="${BG}">
        <kp-container width="medium" padding="md">
          <div style="font-family:Onest,system-ui,sans-serif;display:flex;flex-direction:column;gap:20px">
            <div>
              <div style="font-size:24px;font-weight:600;color: var(--kp-color-gray-900)">Settings</div>
              <div style="font-size:14px;color: var(--kp-color-gray-600);margin-top:4px">Manage your account preferences and integrations.</div>
            </div>
            <div style="${SLOT}">Profile card</div>
            <div style="height:1px;background:#E4E4E7"></div>
            <div style="${SLOT}">Notifications card</div>
          </div>
        </kp-container>
      </div>
    `,
  }),
};

export const DashboardWide: Story = {
  render: () => ({
    template: `
      <div style="${BG}">
        <kp-container width="wide" padding="md">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
            <div style="${SLOT}">Column 1</div>
            <div style="${SLOT}">Column 2</div>
            <div style="${SLOT}">Column 3</div>
          </div>
        </kp-container>
      </div>
    `,
  }),
};
