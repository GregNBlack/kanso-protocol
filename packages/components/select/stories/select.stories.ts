import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { KpSelectComponent, KpSelectOption } from '../src/select.component';
import { KpFormFieldComponent } from '@kanso-protocol/form-field';

const countries: KpSelectOption[] = [
  { value: 'jp', label: 'Japan' },
  { value: 'kr', label: 'South Korea' },
  { value: 'us', label: 'United States' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'br', label: 'Brazil' },
  { value: 'au', label: 'Australia' },
];

const tags: KpSelectOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'research', label: 'Research' },
  { value: 'product', label: 'Product' },
  { value: 'ops', label: 'Operations' },
];

// Reserves vertical room in Storybook docs canvas so the dropdown isn't clipped
const ROOM = 'min-height:440px;padding:8px 0';

const meta: Meta<KpSelectComponent> = {
  title: 'Components/Select',
  component: KpSelectComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [FormsModule, KpFormFieldComponent] }),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { defaultValue: { summary: 'md' } },
    },
    placeholder: { control: 'text' },
    label: { control: 'text', description: 'Floating label (lg/xl only)' },
    floatingLabel: { control: 'boolean' },
    multiple: { control: 'boolean' },
    showClear: { control: 'boolean' },
    disabled: { control: 'boolean' },
    forceState: {
      control: 'select',
      options: [null, 'rest', 'hover', 'active', 'focus', 'disabled', 'error'],
    },
  },
};
export default meta;
type Story = StoryObj<KpSelectComponent>;

export const Default: Story = {
  args: { size: 'md', placeholder: 'Select a country', options: countries },
  render: (args) => ({
    props: args,
    template: `
      <div style="${ROOM}">
        <kp-select [size]="size" [placeholder]="placeholder" [options]="options" [multiple]="multiple" [showClear]="showClear" [disabled]="disabled" [floatingLabel]="floatingLabel" [label]="label" [forceState]="forceState"></kp-select>
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { options: countries },
    template: `
      <div style="${ROOM};display:flex;flex-direction:column;align-items:flex-start;gap:12px">
        <kp-select size="xs" placeholder="XS · 24px" [options]="options"></kp-select>
        <kp-select size="sm" placeholder="SM · 28px" [options]="options"></kp-select>
        <kp-select size="md" placeholder="MD · 36px" [options]="options"></kp-select>
        <kp-select size="lg" placeholder="LG · 44px" [options]="options"></kp-select>
        <kp-select size="xl" placeholder="XL · 52px" [options]="options"></kp-select>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    props: { options: countries },
    template: `
      <div style="${ROOM};display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-500);text-transform:uppercase;letter-spacing:.06em">Rest</span>
          <kp-select forceState="rest" placeholder="Placeholder" [options]="options"></kp-select>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-500);text-transform:uppercase;letter-spacing:.06em">Hover</span>
          <kp-select forceState="hover" placeholder="Placeholder" [options]="options"></kp-select>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-500);text-transform:uppercase;letter-spacing:.06em">Focus</span>
          <kp-select forceState="focus" placeholder="Placeholder" [options]="options"></kp-select>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-500);text-transform:uppercase;letter-spacing:.06em">Disabled</span>
          <kp-select forceState="disabled" placeholder="Placeholder" [options]="options"></kp-select>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-500);text-transform:uppercase;letter-spacing:.06em">Error</span>
          <kp-select forceState="error" placeholder="Error state" [options]="options"></kp-select>
        </div>
      </div>`,
  }),
};

export const SingleVsMulti: Story = {
  name: 'Single vs Multi',
  render: () => ({
    props: { options: tags, single: null, multi: [] },
    template: `
      <div style="${ROOM};display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-select [(ngModel)]="single" placeholder="Pick one tag" [options]="options"></kp-select>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Single · value: {{ single ?? '—' }}</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-select [(ngModel)]="multi" [multiple]="true" placeholder="Pick any" [options]="options"></kp-select>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Multi · value: [{{ multi.join(', ') || '—' }}]</span>
        </div>
      </div>`,
  }),
};

export const WithValue: Story = {
  name: 'With Value',
  render: () => ({
    props: { options: countries, v1: 'jp', v2: ['design', 'engineering'], tags },
    template: `
      <div style="${ROOM};display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-select [(ngModel)]="v1" [options]="options" placeholder="Pick a country"></kp-select>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Single w/ value + clear</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-select [(ngModel)]="v2" [multiple]="true" [options]="tags" placeholder="Pick tags"></kp-select>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">Multi w/ 2 values</span>
        </div>
      </div>`,
  }),
};

export const FloatingLabel: Story = {
  name: 'Floating Label',
  render: () => ({
    props: {
      options: countries,
      tags,
      vSingleEmpty: null,
      vSingleFilled: 'jp',
      vMultiEmpty: [],
      vMultiFilled: ['design', 'engineering', 'product'],
    },
    template: `
      <div style="${ROOM};display:flex;flex-direction:column;gap:32px">

        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-500);text-transform:uppercase;letter-spacing:.06em">LG · Single · Rest (label inside)</span>
          <kp-select size="lg" [floatingLabel]="true" label="Country" [options]="options" [(ngModel)]="vSingleEmpty"></kp-select>
        </div>

        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-500);text-transform:uppercase;letter-spacing:.06em">LG · Single · With value (label floated)</span>
          <kp-select size="lg" [floatingLabel]="true" label="Country" [options]="options" [(ngModel)]="vSingleFilled"></kp-select>
        </div>

        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-500);text-transform:uppercase;letter-spacing:.06em">XL · Multi · Rest (label inside)</span>
          <kp-select size="xl" [floatingLabel]="true" [multiple]="true" label="Tags" [options]="tags" [(ngModel)]="vMultiEmpty"></kp-select>
        </div>

        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">
          <span style="font-size:10px;color: var(--kp-color-gray-500);text-transform:uppercase;letter-spacing:.06em">XL · Multi · With values (label floated, "Selected N out of M")</span>
          <kp-select size="xl" [floatingLabel]="true" [multiple]="true" label="Tags" [options]="tags" [(ngModel)]="vMultiFilled"></kp-select>
        </div>

      </div>`,
  }),
};

export const InFormField: Story = {
  name: 'In FormField',
  render: () => ({
    props: { options: countries, tags, v1: null, v2: [] },
    template: `
      <div style="${ROOM};display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
        <kp-form-field label="Country" helper="Required for shipping" style="width:320px">
          <kp-select [(ngModel)]="v1" placeholder="Select a country" [options]="options"></kp-select>
        </kp-form-field>
        <kp-form-field label="Tags" helper="Pick any that apply" style="width:320px">
          <kp-select [(ngModel)]="v2" [multiple]="true" placeholder="Pick tags" [options]="tags"></kp-select>
        </kp-form-field>
      </div>`,
  }),
};
