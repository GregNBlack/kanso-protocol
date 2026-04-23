import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpFilterBarComponent, KpFilterChip } from '../src/filter-bar.component';
import { KpButtonComponent } from '@kanso-protocol/button';
import { KpBadgeComponent } from '@kanso-protocol/badge';

const DEFAULT_FILTERS: KpFilterChip[] = [
  { id: 'status',   label: 'Status: Active',       color: 'primary' },
  { id: 'date',     label: 'Date: Last 30 days',   color: 'neutral' },
  { id: 'category', label: 'Category: 3 selected', color: 'neutral' },
];

const MANY_FILTERS: KpFilterChip[] = [
  { id: 'status',   label: 'Status: Active',           color: 'primary' },
  { id: 'date',     label: 'Date: Last 30 days',       color: 'neutral' },
  { id: 'category', label: 'Category: 3 selected',     color: 'neutral' },
  { id: 'tags',     label: 'Tags: design, frontend',   color: 'neutral' },
  { id: 'owner',    label: 'Owner: Greg',              color: 'neutral' },
  { id: 'priority', label: 'Priority: High',           color: 'neutral' },
];

const meta: Meta<KpFilterBarComponent> = {
  title: 'Patterns/FilterBar',
  component: KpFilterBarComponent,
  decorators: [moduleMetadata({ imports: [KpButtonComponent, KpBadgeComponent] })],
  tags: ['autodocs'],
  argTypes: {
    showAddFilter:  { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showSaveFilter: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showClearAll:   { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
  },
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<KpFilterBarComponent>;

export const Playground: Story = {
  args: {
    filters: DEFAULT_FILTERS,
    showAddFilter: true,
    showSaveFilter: false,
    showClearAll: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:24px;width:100%;box-sizing:border-box">
        <div style="width:100%;border:1px solid #E4E4E7;border-radius:8px;overflow:hidden">
          <kp-filter-bar
            [filters]="filters"
            [showAddFilter]="showAddFilter"
            [showSaveFilter]="showSaveFilter"
            [showClearAll]="showClearAll"
          ></kp-filter-bar>
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    props: { empty: [], one: DEFAULT_FILTERS.slice(0, 1), three: DEFAULT_FILTERS, many: MANY_FILTERS },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;padding:24px">
        <div>
          <div style="font:500 12px Onest;color:#71717A;margin-bottom:6px">Empty</div>
          <div style="width:100%;border:1px solid #E4E4E7;border-radius:8px;overflow:hidden">
            <kp-filter-bar [filters]="empty"></kp-filter-bar>
          </div>
        </div>
        <div>
          <div style="font:500 12px Onest;color:#71717A;margin-bottom:6px">With 1 filter</div>
          <div style="width:100%;border:1px solid #E4E4E7;border-radius:8px;overflow:hidden">
            <kp-filter-bar [filters]="one"></kp-filter-bar>
          </div>
        </div>
        <div>
          <div style="font:500 12px Onest;color:#71717A;margin-bottom:6px">With 3 filters</div>
          <div style="width:100%;border:1px solid #E4E4E7;border-radius:8px;overflow:hidden">
            <kp-filter-bar [filters]="three"></kp-filter-bar>
          </div>
        </div>
        <div>
          <div style="font:500 12px Onest;color:#71717A;margin-bottom:6px">With 6 filters (wrap behaviour)</div>
          <div style="width:100%;border:1px solid #E4E4E7;border-radius:8px;overflow:hidden">
            <kp-filter-bar [filters]="many"></kp-filter-bar>
          </div>
        </div>
      </div>
    `,
  }),
};

export const Features: Story = {
  render: () => ({
    props: { three: DEFAULT_FILTERS },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;padding:24px">
        <div>
          <div style="font:500 12px Onest;color:#71717A;margin-bottom:6px">Default — Add filter + Clear all</div>
          <div style="width:100%;border:1px solid #E4E4E7;border-radius:8px;overflow:hidden">
            <kp-filter-bar [filters]="three"></kp-filter-bar>
          </div>
        </div>
        <div>
          <div style="font:500 12px Onest;color:#71717A;margin-bottom:6px">Full — Add filter + Save filter + Clear all</div>
          <div style="width:100%;border:1px solid #E4E4E7;border-radius:8px;overflow:hidden">
            <kp-filter-bar [filters]="three" [showSaveFilter]="true"></kp-filter-bar>
          </div>
        </div>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  render: () => ({
    props: {
      products: [
        { id: 'brand', label: 'Brand: Apple',         color: 'primary' },
        { id: 'price', label: 'Price: $500–$1500',    color: 'neutral' },
        { id: 'color', label: 'Color: Silver, Black', color: 'neutral' },
        { id: 'stock', label: 'In stock',             color: 'success' },
      ] as KpFilterChip[],
      logs: [
        { id: 'level', label: 'Level: Error',                 color: 'danger'  },
        { id: 'user',  label: 'User: greg@example.com',       color: 'neutral' },
        { id: 'date',  label: 'Date: Today',                  color: 'neutral' },
      ] as KpFilterChip[],
      saved: DEFAULT_FILTERS,
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;padding:24px">
        <div>
          <div style="font:500 12px Onest;color:#71717A;margin-bottom:6px">Product catalog filters</div>
          <div style="width:100%;border:1px solid #E4E4E7;border-radius:8px;overflow:hidden">
            <kp-filter-bar [filters]="products"></kp-filter-bar>
          </div>
        </div>
        <div>
          <div style="font:500 12px Onest;color:#71717A;margin-bottom:6px">Admin log filters</div>
          <div style="width:100%;border:1px solid #E4E4E7;border-radius:8px;overflow:hidden">
            <kp-filter-bar [filters]="logs"></kp-filter-bar>
          </div>
        </div>
        <div>
          <div style="font:500 12px Onest;color:#71717A;margin-bottom:6px">With saved filter preset loaded</div>
          <div style="width:100%;border:1px solid #E4E4E7;border-radius:8px;overflow:hidden">
            <kp-filter-bar [filters]="saved" [showSaveFilter]="true"></kp-filter-bar>
          </div>
        </div>
      </div>
    `,
  }),
};
