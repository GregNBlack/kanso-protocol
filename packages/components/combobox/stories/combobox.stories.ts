import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { KpComboboxComponent, KpComboboxOption } from '../src/combobox.component';

const meta: Meta<KpComboboxComponent> = {
  title: 'Components/Combobox',
  component: KpComboboxComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpComboboxComponent, FormsModule] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
};
export default meta;
type Story = StoryObj<KpComboboxComponent>;

const fruits: KpComboboxOption[] = [
  { value: 'apple',      label: 'Apple' },
  { value: 'banana',     label: 'Banana' },
  { value: 'blackberry', label: 'Blackberry' },
  { value: 'blueberry',  label: 'Blueberry' },
  { value: 'cherry',     label: 'Cherry' },
  { value: 'grape',      label: 'Grape' },
  { value: 'orange',     label: 'Orange' },
  { value: 'peach',      label: 'Peach' },
  { value: 'pear',       label: 'Pear' },
  { value: 'strawberry', label: 'Strawberry' },
];

const countries: KpComboboxOption[] = [
  { value: 'au', label: 'Australia' },
  { value: 'br', label: 'Brazil' },
  { value: 'ca', label: 'Canada' },
  { value: 'de', label: 'Germany' },
  { value: 'es', label: 'Spain' },
  { value: 'fr', label: 'France' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'in', label: 'India' },
  { value: 'jp', label: 'Japan' },
  { value: 'ru', label: 'Russia' },
  { value: 'us', label: 'United States' },
];

const cap = `font-size:11px;color: var(--kp-color-gray-500);margin-top:8px;display:block`;

export const Default: Story = {
  args: { size: 'md', placeholder: 'Search fruit…' },
  render: (args) => ({
    props: { ...args, options: fruits, value: null as string | null },
    template: `
      <kp-combobox [size]="size" [placeholder]="placeholder" [options]="options" [(ngModel)]="value"/>
      <div style="${cap}">Selected: {{ value ?? '—' }}</div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { options: fruits, v1: null, v2: null, v3: null, v4: null, v5: null },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:320px">
        <kp-combobox size="xs" placeholder="Extra small" [options]="options" [(ngModel)]="v1"/>
        <kp-combobox size="sm" placeholder="Small" [options]="options" [(ngModel)]="v2"/>
        <kp-combobox size="md" placeholder="Medium (default)" [options]="options" [(ngModel)]="v3"/>
        <kp-combobox size="lg" placeholder="Large" [options]="options" [(ngModel)]="v4"/>
        <kp-combobox size="xl" placeholder="Extra large" [options]="options" [(ngModel)]="v5"/>
      </div>`,
  }),
};

export const WithValue: Story = {
  render: () => ({
    props: { options: fruits, value: 'banana' },
    template: `
      <kp-combobox placeholder="Pick a fruit" [options]="options" [(ngModel)]="value"/>
      <div style="${cap}">Selected: {{ value }}</div>`,
  }),
};

export const Multiple: Story = {
  render: () => ({
    props: { options: fruits, value: ['banana', 'cherry'] as string[] },
    template: `
      <kp-combobox [multiple]="true" placeholder="Pick multiple fruits" [options]="options" [(ngModel)]="value"/>
      <div style="${cap}">Selected: {{ value.join(', ') || '—' }}</div>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: { options: fruits, value: 'banana' },
    template: `
      <kp-combobox [disabled]="true" placeholder="Disabled" [options]="options" [(ngModel)]="value"/>`,
  }),
};

export const States: Story = {
  render: () => ({
    props: { options: fruits },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:320px">
        <kp-combobox placeholder="Rest"    [options]="options"/>
        <kp-combobox placeholder="Hover"   [options]="options" [forceState]="'hover'"/>
        <kp-combobox placeholder="Focus"   [options]="options" [forceState]="'focus'"/>
        <kp-combobox placeholder="Error"   [options]="options" [forceState]="'error'"/>
        <kp-combobox placeholder="Disabled" [options]="options" [disabled]="true"/>
      </div>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    props: { countries, country: 'ru', tags: [] as string[], tagOptions: fruits },
    template: `
      <div style="display:flex;flex-direction:column;gap:40px;width:360px">
        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:8px">Country</div>
          <kp-combobox placeholder="Search countries…" [options]="countries" [(ngModel)]="country"/>
          <div style="${cap}">Type "rus" to filter; matches get highlighted.</div>
        </div>

        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:8px">Favourite fruits</div>
          <kp-combobox [multiple]="true" placeholder="Add tags…" [options]="tagOptions" [(ngModel)]="tags"/>
          <div style="${cap}">Tags: {{ tags.join(', ') || '—' }}. Backspace removes the last one.</div>
        </div>
      </div>`,
  }),
};
