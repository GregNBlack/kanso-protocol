import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpDividerComponent } from '../src/divider.component';

const meta: Meta<KpDividerComponent> = {
  title: 'Components/Divider',
  component: KpDividerComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpDividerComponent] })],
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    labelPosition: { control: 'inline-radio', options: ['center', 'start', 'end'] },
  },
};
export default meta;
type Story = StoryObj<KpDividerComponent>;

const caption = `font-size:11px;color: var(--kp-color-gray-600);margin-top:6px;display:block`;

export const Default: Story = {
  args: { orientation: 'horizontal', label: 'Or', labelPosition: 'center' },
  render: (args) => ({
    props: args,
    template: `
      <div style="width:600px">
        <kp-divider [orientation]="orientation" [label]="label" [labelPosition]="labelPosition"/>
      </div>`,
  }),
};

export const Orientations: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div style="width:600px">
          <kp-divider/>
          <span style="${caption}">Horizontal — width fills container</span>
        </div>
        <div style="display:inline-flex;align-items:center;gap:12px">
          <span style="font-size:12px;color: var(--kp-color-gray-600)">Above</span>
          <kp-divider orientation="vertical" style="height:80px"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">Below</span>
          <span style="${caption}">Vertical — fixed height by parent</span>
        </div>
      </div>`,
  }),
};

export const WithLabel: Story = {
  name: 'With Label',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:600px">
        <div><kp-divider label="Or"/><span style="${caption}">Center — default</span></div>
        <div><kp-divider label="Section 1" labelPosition="start"/><span style="${caption}">Start</span></div>
        <div><kp-divider label="More below" labelPosition="end"/><span style="${caption}">End</span></div>
      </div>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;width:600px">
        <div>
          <p style="font-size:14px;color: var(--kp-color-gray-600);margin:0 0 16px">Personal info fields…</p>
          <kp-divider label="Billing details" labelPosition="start"/>
          <p style="font-size:14px;color: var(--kp-color-gray-600);margin:16px 0 0">Billing fields…</p>
          <span style="${caption}">Form section separator</span>
        </div>

        <div>
          <div style="display:inline-flex;align-items:center;gap:16px">
            <a style="font-size:14px;color: var(--kp-color-gray-700);text-decoration:none">Home</a>
            <kp-divider orientation="vertical" style="height:16px"/>
            <a style="font-size:14px;color: var(--kp-color-gray-700);text-decoration:none">About</a>
            <kp-divider orientation="vertical" style="height:16px"/>
            <a style="font-size:14px;color: var(--kp-color-gray-700);text-decoration:none">Contact</a>
          </div>
          <div><span style="${caption}">Nav separator — short vertical dividers between inline links</span></div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px;width:320px">
          <button style="all:unset;background:#2563EB;color:#fff;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:Onest,system-ui;font-size:14px;font-weight:500;cursor:pointer">Sign in with email</button>
          <kp-divider label="Or continue with"/>
          <button style="all:unset;background: var(--kp-color-white);color: var(--kp-color-gray-900);height:40px;border-radius:8px;border:1px solid #D4D4D8;display:flex;align-items:center;justify-content:center;font-family:Onest,system-ui;font-size:14px;font-weight:500;cursor:pointer">Sign in with Google</button>
          <span style="${caption}">Login methods — centered "Or continue with"</span>
        </div>
      </div>`,
  }),
};
