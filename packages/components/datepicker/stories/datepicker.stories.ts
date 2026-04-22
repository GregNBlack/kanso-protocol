import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { KpDatePickerComponent } from '../src/datepicker.component';

const meta: Meta<KpDatePickerComponent> = {
  title: 'Components/DatePicker',
  component: KpDatePickerComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpDatePickerComponent, FormsModule] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    mode: { control: 'inline-radio', options: ['single', 'range'] },
  },
};
export default meta;
type Story = StoryObj<KpDatePickerComponent>;

const cap = `font-size:11px;color:#A1A1AA;margin-top:8px;display:block`;

export const Default: Story = {
  args: { size: 'md', mode: 'single', placeholder: 'Select date' },
  render: (args) => ({
    props: { ...args, value: null as Date | null },
    template: `
      <kp-date-picker [size]="size" [mode]="mode" [placeholder]="placeholder" [(ngModel)]="value"/>
      <div style="${cap}">Selected: {{ value?.toDateString() ?? '—' }}</div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { v1: null, v2: null, v3: null, v4: null, v5: null },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:320px">
        <kp-date-picker size="xs" placeholder="Extra small" [(ngModel)]="v1"/>
        <kp-date-picker size="sm" placeholder="Small" [(ngModel)]="v2"/>
        <kp-date-picker size="md" placeholder="Medium (default)" [(ngModel)]="v3"/>
        <kp-date-picker size="lg" placeholder="Large" [(ngModel)]="v4"/>
        <kp-date-picker size="xl" placeholder="Extra large" [(ngModel)]="v5"/>
      </div>`,
  }),
};

export const Single: Story = {
  render: () => ({
    props: { value: new Date() },
    template: `
      <kp-date-picker placeholder="Pick a date" [(ngModel)]="value"/>
      <div style="${cap}">Selected: {{ value?.toDateString() ?? '—' }}</div>`,
  }),
};

export const Range: Story = {
  render: () => ({
    props: { value: [new Date(Date.now() - 6*86400000), new Date()] as [Date, Date] },
    template: `
      <kp-date-picker mode="range" placeholder="Pick a range" [(ngModel)]="value"/>
      <div style="${cap}">
        Range: {{ value?.[0]?.toDateString() }} – {{ value?.[1]?.toDateString() }}
      </div>`,
  }),
};

export const WithPresets: Story = {
  render: () => ({
    props: { value: null as any },
    template: `
      <kp-date-picker mode="range" [showPresets]="true" placeholder="Pick a range" [(ngModel)]="value"/>
      <div style="${cap}">
        Click a preset on the left or pick any range manually.
      </div>`,
  }),
};

export const MinMax: Story = {
  name: 'Min / max constraints',
  render: () => ({
    props: {
      min: new Date(Date.now() - 14 * 86400000),
      max: new Date(Date.now() + 14 * 86400000),
      value: new Date(),
    },
    template: `
      <kp-date-picker [min]="min" [max]="max" [(ngModel)]="value"/>
      <div style="${cap}">
        Selectable only within [today − 14d, today + 14d].
      </div>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: { value: new Date() },
    template: `<kp-date-picker [disabled]="true" [(ngModel)]="value"/>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    props: {
      birth: null as Date | null,
      eventStart: null as Date | null,
      eventEnd: null as Date | null,
      reportRange: null as any,
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:40px;width:420px">
        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:8px">Date of birth</div>
          <kp-date-picker placeholder="Select your birthday" [(ngModel)]="birth"/>
        </div>

        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:8px">Event dates</div>
          <div style="display:flex;gap:12px">
            <kp-date-picker placeholder="Start" [(ngModel)]="eventStart"/>
            <kp-date-picker placeholder="End" [(ngModel)]="eventEnd"/>
          </div>
        </div>

        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:4px">Report range</div>
          <div style="font-size:12px;color:#71717A;margin-bottom:8px">Select a range — presets cover the common cases.</div>
          <kp-date-picker mode="range" [showPresets]="true" placeholder="Choose range" [(ngModel)]="reportRange"/>
        </div>
      </div>`,
  }),
};
