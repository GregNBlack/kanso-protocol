import { Meta, StoryObj } from '@storybook/angular';
import { KpRowComponent } from '../src/row.component';

const meta: Meta<KpRowComponent> = {
  title: 'Patterns/Row',
  component: KpRowComponent,
  tags: ['autodocs'],
  argTypes: {
    gap:     { control: 'select', options: ['none','2xs','xs','sm','md','lg','xl','2xl'], table: { defaultValue: { summary: 'md' } } },
    align:   { control: 'select', options: ['start','center','end','stretch','baseline'], table: { defaultValue: { summary: 'center' } } },
    justify: { control: 'select', options: ['start','center','end','space-between','space-around'], table: { defaultValue: { summary: 'start' } } },
    wrap:    { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
};
export default meta;
type Story = StoryObj<KpRowComponent>;

const box = (w: number, h = 32) => `<div style="width:${w}px;height:${h}px;background:#E4E4E7;border-radius:6px"></div>`;

export const Gaps: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;font-family:Onest,system-ui,sans-serif;font-size:12px;color: var(--kp-color-gray-600)">
        ${['none','2xs','xs','sm','md','lg','xl','2xl'].map(g => `
          <div>
            <div style="margin-bottom:6px">gap=${g}</div>
            <kp-row gap="${g}">${box(80)}${box(80)}${box(80)}</kp-row>
          </div>
        `).join('')}
      </div>
    `,
  }),
};

export const Justify: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;font-family:Onest,system-ui,sans-serif;font-size:12px;color: var(--kp-color-gray-600)">
        ${['start','center','end','space-between','space-around'].map(j => `
          <div>
            <div style="margin-bottom:6px">justify=${j}</div>
            <div style="background: var(--kp-color-gray-50);padding:12px;border-radius:6px;width:600px">
              <kp-row gap="sm" justify="${j}">${box(80)}${box(80)}${box(80)}</kp-row>
            </div>
          </div>
        `).join('')}
      </div>
    `,
  }),
};

export const Align: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;font-family:Onest,system-ui,sans-serif;font-size:12px;color: var(--kp-color-gray-600)">
        ${['start','center','end','stretch','baseline'].map(a => `
          <div>
            <div style="margin-bottom:6px">align=${a}</div>
            <div style="background: var(--kp-color-gray-50);padding:12px;border-radius:6px;height:100px">
              <kp-row gap="sm" align="${a}">${box(60, 32)}${box(60, 56)}${box(60, 40)}</kp-row>
            </div>
          </div>
        `).join('')}
      </div>
    `,
  }),
};

export const UseCases: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;font-family:Onest,system-ui,sans-serif">
        <div>
          <div style="font-size:12px;color: var(--kp-color-gray-600);margin-bottom:6px">Button group (justify=end)</div>
          <div style="background: var(--kp-color-gray-50);padding:12px;border-radius:6px;width:600px">
            <kp-row gap="sm" justify="end">
              <button style="padding:8px 16px;background: var(--kp-color-white);border: 1px solid var(--kp-color-gray-200);border-radius:6px">Cancel</button>
              <button style="padding:8px 16px;background:#2563EB;color:#fff;border:none;border-radius:6px">Save</button>
            </kp-row>
          </div>
        </div>
        <div>
          <div style="font-size:12px;color: var(--kp-color-gray-600);margin-bottom:6px">Header (justify=space-between)</div>
          <div style="background: var(--kp-color-gray-50);padding:12px;border-radius:6px;width:600px">
            <kp-row justify="space-between" align="center">
              <span style="font-weight:600">Logo</span>
              <kp-row gap="md">
                <span>Home</span><span>Docs</span><span>About</span>
              </kp-row>
            </kp-row>
          </div>
        </div>
      </div>
    `,
  }),
};
