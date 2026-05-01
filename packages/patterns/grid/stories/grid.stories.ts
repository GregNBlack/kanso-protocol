import { Meta, StoryObj } from '@storybook/angular';
import { KpGridComponent } from '../src/grid.component';

const meta: Meta<KpGridComponent> = {
  title: 'Patterns/Grid',
  component: KpGridComponent,
  tags: ['autodocs'],
  argTypes: {
    columns: { control: 'inline-radio', options: [2, 3, 4, 6, 12], table: { defaultValue: { summary: '3' } } },
    gap:     { control: 'inline-radio', options: ['xs','sm','md','lg','xl'], table: { defaultValue: { summary: 'md' } } },
    gapRow:  { control: 'select', options: [null,'xs','sm','md','lg','xl'] },
  },
};
export default meta;
type Story = StoryObj<KpGridComponent>;

const cell = (n: number) => `<div style="background:#E4E4E7;border-radius:6px;height:80px;display:flex;align-items:center;justify-content:center;color: var(--kp-color-gray-500);font-size:12px;font-family:Onest,system-ui,sans-serif">${n}</div>`;

export const Columns: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;font-family:Onest,system-ui,sans-serif;font-size:12px;color: var(--kp-color-gray-500)">
        ${[2,3,4,6,12].map(c => `
          <div>
            <div style="margin-bottom:8px">columns=${c}</div>
            <kp-grid [columns]="${c}" gap="md">
              ${Array.from({length: c}, (_, i) => cell(i + 1)).join('')}
            </kp-grid>
          </div>
        `).join('')}
      </div>
    `,
  }),
};

export const Gaps: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;font-family:Onest,system-ui,sans-serif;font-size:12px;color: var(--kp-color-gray-500)">
        ${['xs','sm','md','lg','xl'].map(g => `
          <div>
            <div style="margin-bottom:8px">gap=${g}</div>
            <kp-grid [columns]="4" gap="${g}">
              ${cell(1)}${cell(2)}${cell(3)}${cell(4)}
            </kp-grid>
          </div>
        `).join('')}
      </div>
    `,
  }),
};

export const RealExample: Story = {
  render: () => ({
    template: `
      <kp-grid [columns]="3" gap="md">
        ${[1,2,3,4,5,6].map(n => `
          <div style="background: var(--kp-color-white);border: 1px solid var(--kp-color-gray-200);border-radius:8px;padding:16px;font-family:Onest,system-ui,sans-serif">
            <div style="height:100px;background: var(--kp-color-gray-100);border-radius:6px;margin-bottom:12px"></div>
            <div style="font-weight:600;font-size:14px;color: var(--kp-color-gray-900)">Product ${n}</div>
            <div style="font-size:13px;color: var(--kp-color-gray-500);margin-top:4px">$${n * 24}.00</div>
          </div>
        `).join('')}
      </kp-grid>
    `,
  }),
};
