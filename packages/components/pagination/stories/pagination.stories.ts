import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { KpPaginationComponent } from '../src/pagination.component';
import { KpPaginationItemComponent } from '../src/pagination-item.component';

const meta: Meta<KpPaginationComponent> = {
  title: 'Components/Pagination',
  component: KpPaginationComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [KpPaginationComponent, KpPaginationItemComponent, FormsModule],
    }),
  ],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], table: { defaultValue: { summary: 'md' } } },
    navMode: { control: 'inline-radio', options: ['icon', 'text', 'icon-text'], table: { defaultValue: { summary: 'icon' } } },
    currentPage: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1 } },
  },
};
export default meta;
type Story = StoryObj<KpPaginationComponent>;

const caption = `font-size:11px;color:#A1A1AA;margin-top:6px;display:block`;

export const Default: Story = {
  args: { size: 'md', navMode: 'icon', currentPage: 3, totalPages: 20 },
  render: (args) => ({
    props: { ...args, onPage: (p: number) => (args.currentPage = p) },
    template: `
      <kp-pagination
        [size]="size"
        [navMode]="navMode"
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        (pageChange)="onPage($event); currentPage = $event"
      />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { p: 3 },
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div>
          <kp-pagination size="sm" [currentPage]="p" [totalPages]="20" (pageChange)="p = $event"/>
          <span style="${caption}">Small</span>
        </div>
        <div>
          <kp-pagination size="md" [currentPage]="p" [totalPages]="20" (pageChange)="p = $event"/>
          <span style="${caption}">Medium (default)</span>
        </div>
        <div>
          <kp-pagination size="lg" [currentPage]="p" [totalPages]="20" (pageChange)="p = $event"/>
          <span style="${caption}">Large</span>
        </div>
      </div>`,
  }),
};

export const Truncation: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:20px">
        <div>
          <kp-pagination [currentPage]="4" [totalPages]="7"/>
          <span style="${caption}">None — all pages visible</span>
        </div>
        <div>
          <kp-pagination [currentPage]="3" [totalPages]="20"/>
          <span style="${caption}">End — current near start</span>
        </div>
        <div>
          <kp-pagination [currentPage]="10" [totalPages]="20"/>
          <span style="${caption}">Both — current in middle</span>
        </div>
        <div>
          <kp-pagination [currentPage]="18" [totalPages]="20"/>
          <span style="${caption}">Start — current near end</span>
        </div>
      </div>`,
  }),
};

export const NavModes: Story = {
  name: 'Nav Modes',
  render: () => ({
    props: { p: 3 },
    template: `
      <div style="display:flex;flex-direction:column;gap:20px">
        <div>
          <kp-pagination navMode="icon" [currentPage]="p" [totalPages]="20" (pageChange)="p = $event"/>
          <span style="${caption}">Icon only (default)</span>
        </div>
        <div>
          <kp-pagination navMode="text" [currentPage]="p" [totalPages]="20" (pageChange)="p = $event"/>
          <span style="${caption}">Text only</span>
        </div>
        <div>
          <kp-pagination navMode="icon-text" [currentPage]="p" [totalPages]="20" (pageChange)="p = $event"/>
          <span style="${caption}">Icon + text</span>
        </div>
      </div>`,
  }),
};

export const WithItemsInfo: Story = {
  name: 'With Items Info',
  render: () => ({
    props: { p: 5, p2: 1 },
    template: `
      <div style="display:flex;flex-direction:column;gap:20px">
        <div>
          <kp-pagination
            [currentPage]="p"
            [totalPages]="20"
            [showItemsInfo]="true"
            [itemsPerPage]="10"
            [itemsTotal]="1234"
            (pageChange)="p = $event"
          />
          <span style="${caption}">With items info</span>
        </div>
        <div>
          <kp-pagination
            [currentPage]="p2"
            [totalPages]="1"
            [showItemsInfo]="true"
            [itemsPerPage]="25"
            [itemsTotal]="25"
          />
          <span style="${caption}">Single page (all items shown)</span>
        </div>
      </div>`,
  }),
};

export const WithItemsPerPage: Story = {
  name: 'With Items Per Page',
  render: () => ({
    props: { p: 5, pp: 50 },
    template: `
      <div style="width:900px">
        <kp-pagination
          [currentPage]="p"
          [totalPages]="20"
          [showItemsInfo]="true"
          [showItemsPerPage]="true"
          [itemsPerPage]="pp"
          [itemsTotal]="1234"
          (pageChange)="p = $event"
          (itemsPerPageChange)="pp = $event"
        />
        <p style="font-size:11px;color:#A1A1AA;margin:8px 0 0">Full pagination: items info + controls + per page selector. Default options [25, 50, 75, 100].</p>
      </div>`,
  }),
};

export const ItemStates: Story = {
  name: 'Item States',
  render: () => ({
    template: `
      <div style="display:inline-flex;align-items:center;gap:6px">
        <kp-pagination-item type="page" [page]="1"/>
        <kp-pagination-item type="page" [page]="2" [selected]="true"/>
        <kp-pagination-item type="page" [page]="3" [disabled]="true"/>
        <kp-pagination-item type="ellipsis"/>
        <kp-pagination-item type="nav" navDirection="prev" [disabled]="true"/>
        <kp-pagination-item type="nav" navDirection="next"/>
      </div>
      <p style="font-size:11px;color:#A1A1AA;margin:8px 0 0">Rest, selected (current), disabled, ellipsis, disabled-nav, enabled-nav.</p>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    props: { tbl: 3, srch: 2, cat: 3, pp: 50 },
    template: `
      <div style="display:flex;flex-direction:column;gap:32px">
        <div style="width:900px">
          <kp-pagination
            size="sm"
            [currentPage]="tbl"
            [totalPages]="14"
            [showItemsInfo]="true"
            [showItemsPerPage]="true"
            [itemsPerPage]="25"
            [itemsTotal]="342"
            (pageChange)="tbl = $event"
          />
          <span style="${caption}">Table pagination with density controls</span>
        </div>
        <div>
          <kp-pagination
            navMode="icon-text"
            [currentPage]="srch"
            [totalPages]="8"
            (pageChange)="srch = $event"
          />
          <span style="${caption}">Search results with directional buttons</span>
        </div>
        <div style="width:1100px">
          <kp-pagination
            size="lg"
            [currentPage]="cat"
            [totalPages]="37"
            [showItemsInfo]="true"
            [showItemsPerPage]="true"
            [itemsPerPage]="pp"
            [itemsTotal]="1847"
            (pageChange)="cat = $event"
            (itemsPerPageChange)="pp = $event"
          />
          <span style="${caption}">Product catalog with larger controls</span>
        </div>
      </div>`,
  }),
};
