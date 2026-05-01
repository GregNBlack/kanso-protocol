import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { KpTimePickerComponent } from '../src/timepicker.component';

const meta: Meta<KpTimePickerComponent> = {
  title: 'Components/TimePicker',
  component: KpTimePickerComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpTimePickerComponent, FormsModule] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    format: { control: 'inline-radio', options: ['12h', '24h'] },
  },
};
export default meta;
type Story = StoryObj<KpTimePickerComponent>;

const cap = `font-size:11px;color: var(--kp-color-gray-500);margin-top:8px;display:block`;

export const Default: Story = {
  args: { size: 'md', format: '24h', placeholder: 'Select time' },
  render: (args) => ({
    props: { ...args, value: null as string | null },
    template: `
      <kp-time-picker [size]="size" [format]="format" [placeholder]="placeholder" [(ngModel)]="value"/>
      <div style="${cap}">Selected: {{ value ?? '—' }}</div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { v1: '09:00', v2: '12:30', v3: '18:45' },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:240px">
        <kp-time-picker size="sm" [(ngModel)]="v1"/>
        <kp-time-picker size="md" [(ngModel)]="v2"/>
        <kp-time-picker size="lg" [(ngModel)]="v3"/>
      </div>`,
  }),
};

export const Formats: Story = {
  render: () => ({
    props: { v1: '14:30', v2: '14:30', v3: '09:45:12' },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:240px">
        <div>
          <kp-time-picker format="24h" [(ngModel)]="v1"/>
          <div style="${cap}">24h format — stored as "HH:mm"</div>
        </div>
        <div>
          <kp-time-picker format="12h" [(ngModel)]="v2"/>
          <div style="${cap}">12h format — same canonical value, displayed with AM/PM</div>
        </div>
        <div>
          <kp-time-picker [showSeconds]="true" [(ngModel)]="v3"/>
          <div style="${cap}">With seconds — "HH:mm:ss"</div>
        </div>
      </div>`,
  }),
};

export const SteppedMinutes: Story = {
  name: 'Stepped minutes',
  render: () => ({
    props: { v: '10:30' },
    template: `
      <kp-time-picker [minuteStep]="15" [(ngModel)]="v"/>
      <div style="${cap}">Minute column only shows 00 / 15 / 30 / 45.</div>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: { v: '12:00' },
    template: `<kp-time-picker [disabled]="true" [(ngModel)]="v"/>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    props: {
      meetingStart: '09:30',
      opensAt: '08:00',
      closesAt: '22:00',
      eventDate: new Date(),
      eventTime: '19:00',
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:40px;width:420px">
        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:8px">Meeting start time</div>
          <kp-time-picker format="12h" [(ngModel)]="meetingStart"/>
        </div>

        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:8px">Opening hours</div>
          <div style="display:flex;gap:12px;align-items:center">
            <kp-time-picker placeholder="Opens at" [minuteStep]="15" [(ngModel)]="opensAt"/>
            <span style="color: var(--kp-color-gray-500)">—</span>
            <kp-time-picker placeholder="Closes at" [minuteStep]="15" [(ngModel)]="closesAt"/>
          </div>
        </div>

        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:4px">Event starts</div>
          <div style="font-size:12px;color: var(--kp-color-gray-500);margin-bottom:8px">Pick a time (minutes snap to 15).</div>
          <kp-time-picker format="24h" [minuteStep]="15" [(ngModel)]="eventTime"/>
        </div>
      </div>`,
  }),
};
