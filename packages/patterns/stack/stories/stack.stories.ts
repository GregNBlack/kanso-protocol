import { Meta, StoryObj } from '@storybook/angular';
import { KpStackComponent } from '../src/stack.component';

const meta: Meta<KpStackComponent> = {
  title: 'Patterns/Stack',
  component: KpStackComponent,
  tags: ['autodocs'],
  argTypes: {
    gap:   { control: 'select', options: ['none','2xs','xs','sm','md','lg','xl','2xl'], table: { defaultValue: { summary: 'md' } } },
    align: { control: 'inline-radio', options: ['start','center','end','stretch'], table: { defaultValue: { summary: 'stretch' } } },
  },
};
export default meta;
type Story = StoryObj<KpStackComponent>;

const box = (w: number) => `<div style="width:${w}px;height:40px;background:#E4E4E7;border-radius:6px"></div>`;

export const Gaps: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:32px;flex-wrap:wrap;font-family:Onest,system-ui,sans-serif;font-size:12px;color: var(--kp-color-gray-600)">
        ${['none','2xs','xs','sm','md','lg','xl','2xl'].map(g => `
          <div style="display:flex;flex-direction:column;gap:8px">
            <span>gap=${g}</span>
            <kp-stack gap="${g}">${box(200)}${box(200)}${box(200)}</kp-stack>
          </div>
        `).join('')}
      </div>
    `,
  }),
};

export const Align: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:32px;font-family:Onest,system-ui,sans-serif;font-size:12px;color: var(--kp-color-gray-600)">
        ${['start','center','end','stretch'].map(a => `
          <div style="display:flex;flex-direction:column;gap:8px;width:240px">
            <span>align=${a}</span>
            <div style="background: var(--kp-color-gray-50);padding:12px;border-radius:6px">
              <kp-stack gap="sm" align="${a}">
                <div style="width:120px;height:32px;background:#E4E4E7;border-radius:6px"></div>
                <div style="width:80px;height:32px;background:#E4E4E7;border-radius:6px"></div>
                <div style="width:160px;height:32px;background:#E4E4E7;border-radius:6px"></div>
              </kp-stack>
            </div>
          </div>
        `).join('')}
      </div>
    `,
  }),
};
