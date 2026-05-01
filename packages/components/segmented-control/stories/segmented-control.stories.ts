import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import {
  KpSegmentedControlComponent,
  KpSegmentOption,
} from '../src/segmented-control.component';

// Tabler-style SVG path `d` attributes (stroke currentColor)
const ICON = {
  layoutGrid:    'M4 4h6v6h-6zM14 4h6v6h-6zM4 14h6v6h-6zM14 14h6v6h-6z',
  list:          'M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01',
  layoutColumns: 'M4 4h7v16h-7zM13 4h7v16h-7z',
  layoutKanban:  'M4 4h5v12h-5zM10 4h5v16h-5zM16 4h4v8h-4z',
  user:          'M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2',
  settings:      'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z',
  bell:          'M10 5a2 2 0 0 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6zM9 17v1a3 3 0 0 0 6 0v-1',
};

const DAY_WEEK_MONTH: KpSegmentOption[] = [
  { value: 'day',   label: 'Day' },
  { value: 'week',  label: 'Week' },
  { value: 'month', label: 'Month' },
];

const meta: Meta<KpSegmentedControlComponent> = {
  title: 'Components/SegmentedControl',
  component: KpSegmentedControlComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FormsModule] })],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'], table: { defaultValue: { summary: 'md' } } },
    display: { control: 'select', options: ['text', 'icon', 'icon-text'], table: { defaultValue: { summary: 'text' } } },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<KpSegmentedControlComponent>;

export const Default: Story = {
  args: { size: 'md', display: 'text', options: DAY_WEEK_MONTH },
  render: (args) => ({
    props: { ...args, value: 'week' },
    template: `<kp-segmented-control [(ngModel)]="value" [size]="size" [options]="options" [display]="display" [disabled]="disabled"></kp-segmented-control>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { options: DAY_WEEK_MONTH, v1: 'week', v2: 'week', v3: 'week', v4: 'week', v5: 'week' },
    template: `
      <div style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control size="xs" [(ngModel)]="v1" [options]="options"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">xs</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control size="sm" [(ngModel)]="v2" [options]="options"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">sm</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control size="md" [(ngModel)]="v3" [options]="options"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">md</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control size="lg" [(ngModel)]="v4" [options]="options"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">lg</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control size="xl" [(ngModel)]="v5" [options]="options"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">xl</span></div>
      </div>`,
  }),
};

export const NumberOfSegments: Story = {
  name: 'Number of Segments',
  render: () => ({
    props: {
      two:  [{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }],
      three: DAY_WEEK_MONTH,
      four:  [...DAY_WEEK_MONTH, { value: 'quarter', label: 'Quarter' }],
      five:  [...DAY_WEEK_MONTH, { value: 'quarter', label: 'Quarter' }, { value: 'year', label: 'Year' }],
      v2: 'grid', v3: 'week', v4: 'week', v5: 'week',
    },
    template: `
      <div style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control [(ngModel)]="v2" [options]="two"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">2 segments</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control [(ngModel)]="v3" [options]="three"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">3 segments</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control [(ngModel)]="v4" [options]="four"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">4 segments</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control [(ngModel)]="v5" [options]="five"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">5 segments</span></div>
      </div>`,
  }),
};

export const ContentTypes: Story = {
  name: 'Content Types',
  render: () => ({
    props: {
      textOpts: DAY_WEEK_MONTH,
      iconOpts: [
        { value: 'grid',    icon: ICON.layoutGrid },
        { value: 'list',    icon: ICON.list },
        { value: 'columns', icon: ICON.layoutColumns },
      ],
      iconTextOpts: [
        { value: 'grid',    label: 'Grid',    icon: ICON.layoutGrid },
        { value: 'list',    label: 'List',    icon: ICON.list },
        { value: 'columns', label: 'Columns', icon: ICON.layoutColumns },
      ],
      vText: 'week', vIcon: 'list', vIconText: 'list',
    },
    template: `
      <div style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control [(ngModel)]="vText" [options]="textOpts" display="text"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">Text</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control [(ngModel)]="vIcon" [options]="iconOpts" display="icon"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">Icons</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control [(ngModel)]="vIconText" [options]="iconTextOpts" display="icon-text"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">Icon + text</span></div>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    props: {
      normal: DAY_WEEK_MONTH,
      disabledThird: [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month', disabled: true },
      ],
      v1: 'week', v2: 'week',
    },
    template: `
      <div style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control [(ngModel)]="v1" [options]="normal"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">Default</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control [(ngModel)]="v2" [options]="disabledThird"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">One segment disabled</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px"><kp-segmented-control [disabled]="true" [options]="normal" value="week"></kp-segmented-control><span style="font-size:11px;color: var(--kp-color-gray-500)">Entire control disabled</span></div>
      </div>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    props: {
      period: [
        { value: 'day',     label: 'Day' },
        { value: 'week',    label: 'Week' },
        { value: 'month',   label: 'Month' },
        { value: 'quarter', label: 'Quarter' },
        { value: 'year',    label: 'Year' },
      ],
      view: [
        { value: 'grid',    icon: ICON.layoutGrid },
        { value: 'list',    icon: ICON.list },
        { value: 'kanban',  icon: ICON.layoutKanban },
      ],
      pricing: [
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly',  label: 'Yearly (save 20%)' },
      ],
      settings: [
        { value: 'profile',       label: 'Profile',       icon: ICON.user },
        { value: 'preferences',   label: 'Preferences',   icon: ICON.settings },
        { value: 'notifications', label: 'Notifications', icon: ICON.bell },
      ],
      vPeriod: 'week', vView: 'grid', vPricing: 'monthly', vSettings: 'preferences',
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;align-items:flex-start">
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
          <kp-segmented-control size="sm" [(ngModel)]="vPeriod" [options]="period"></kp-segmented-control>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Time period filter</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
          <kp-segmented-control [(ngModel)]="vView" [options]="view" display="icon"></kp-segmented-control>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">View switcher</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
          <kp-segmented-control size="lg" [(ngModel)]="vPricing" [options]="pricing"></kp-segmented-control>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Pricing toggle</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
          <kp-segmented-control [(ngModel)]="vSettings" [options]="settings" display="icon-text"></kp-segmented-control>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Settings navigation</span>
        </div>
      </div>`,
  }),
};
