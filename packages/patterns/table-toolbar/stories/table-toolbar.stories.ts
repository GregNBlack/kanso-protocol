import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpTableToolbarComponent } from '../src/table-toolbar.component';
import { KpButtonComponent } from '@kanso-protocol/button';
import { KpBadgeComponent } from '@kanso-protocol/badge';
import { KpSearchBarComponent } from '@kanso-protocol/search-bar';

const meta: Meta<KpTableToolbarComponent> = {
  title: 'Patterns/TableToolbar',
  component: KpTableToolbarComponent,
  decorators: [moduleMetadata({ imports: [KpButtonComponent, KpBadgeComponent, KpSearchBarComponent] })],
  tags: ['autodocs'],
  argTypes: {
    mode:              { control: 'inline-radio', options: ['default', 'bulk-select'], table: { defaultValue: { summary: 'default' } } },
    showSearch:        { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showFilter:        { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showSort:          { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showDensity:       { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showColumnPicker:  { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showExport:        { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showCreate:        { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    density:           { control: 'inline-radio', options: ['compact', 'comfortable', 'spacious'] },
    activeFilterCount: { control: { type: 'number', min: 0, max: 10 } },
    selectedCount:     { control: { type: 'number', min: 0, max: 999 } },
  },
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<KpTableToolbarComponent>;

export const Playground: Story = {
  args: {
    mode: 'default',
    showSearch: true,
    showFilter: true,
    activeFilterCount: 2,
    showCreate: true,
  },
  render: (args) => ({
    props: args,
    template: `<div style="width:100%;box-sizing:border-box;border: 1px solid var(--kp-color-gray-200);border-radius:8px;overflow:hidden"><kp-table-toolbar ${Object.keys(args).map(k => `[${k}]="${k}"`).join(' ')}></kp-table-toolbar></div>`,
  }),
};

export const Modes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;padding:24px">
        <div style="width:100%;box-sizing:border-box;border: 1px solid var(--kp-color-gray-200);border-radius:8px;overflow:hidden">
          <kp-table-toolbar mode="default" [activeFilterCount]="2"></kp-table-toolbar>
        </div>
        <div style="width:100%;box-sizing:border-box;border: 1px solid var(--kp-color-gray-200);border-radius:8px;overflow:hidden">
          <kp-table-toolbar mode="bulk-select" [selectedCount]="5"></kp-table-toolbar>
        </div>
      </div>
    `,
  }),
};

export const Compositions: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;padding:24px">
        <div style="width:100%;box-sizing:border-box;border: 1px solid var(--kp-color-gray-200);border-radius:8px;overflow:hidden">
          <kp-table-toolbar [showFilter]="false"></kp-table-toolbar>
        </div>
        <div style="width:100%;box-sizing:border-box;border: 1px solid var(--kp-color-gray-200);border-radius:8px;overflow:hidden">
          <kp-table-toolbar [activeFilterCount]="3" [showSort]="true"></kp-table-toolbar>
        </div>
        <div style="width:100%;box-sizing:border-box;border: 1px solid var(--kp-color-gray-200);border-radius:8px;overflow:hidden">
          <kp-table-toolbar
            [activeFilterCount]="2"
            [showSort]="true"
            [showDensity]="true"
            [showColumnPicker]="true"
            [showExport]="true"></kp-table-toolbar>
        </div>
        <div style="width:100%;box-sizing:border-box;border: 1px solid var(--kp-color-gray-200);border-radius:8px;overflow:hidden">
          <kp-table-toolbar
            [showDensity]="true"
            [showColumnPicker]="true"
            density="compact"></kp-table-toolbar>
        </div>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;padding:24px">
        <div>
          <div style="font:500 12px Onest;color: var(--kp-color-gray-500);margin-bottom:6px">Admin users table</div>
          <div style="width:100%;box-sizing:border-box;border: 1px solid var(--kp-color-gray-200);border-radius:8px;overflow:hidden">
            <kp-table-toolbar
              searchPlaceholder="Search users…"
              [activeFilterCount]="2"
              createLabel="New user"></kp-table-toolbar>
          </div>
        </div>

        <div>
          <div style="font:500 12px Onest;color: var(--kp-color-gray-500);margin-bottom:6px">E-commerce products</div>
          <div style="width:100%;box-sizing:border-box;border: 1px solid var(--kp-color-gray-200);border-radius:8px;overflow:hidden">
            <kp-table-toolbar
              searchPlaceholder="Search products…"
              [activeFilterCount]="1"
              [showSort]="true"
              [showDensity]="true"
              [showColumnPicker]="true"
              [showExport]="true"
              createLabel="New product"></kp-table-toolbar>
          </div>
        </div>

        <div>
          <div style="font:500 12px Onest;color: var(--kp-color-gray-500);margin-bottom:6px">Bulk delete scenario</div>
          <div style="width:100%;box-sizing:border-box;border: 1px solid var(--kp-color-gray-200);border-radius:8px;overflow:hidden">
            <kp-table-toolbar mode="bulk-select" [selectedCount]="5"></kp-table-toolbar>
          </div>
        </div>
      </div>
    `,
  }),
};
