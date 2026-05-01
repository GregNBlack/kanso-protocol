import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpDropdownMenuComponent } from '../src/dropdown-menu.component';
import { KpMenuItemComponent } from '../src/menu-item.component';
import { KpMenuDividerComponent } from '../src/menu-divider.component';
import { KpMenuSectionLabelComponent } from '../src/menu-section-label.component';
import { KpCheckboxComponent } from '@kanso-protocol/checkbox';
import { KpRadioComponent, KpRadioGroupComponent } from '@kanso-protocol/radio';

const meta: Meta<KpDropdownMenuComponent> = {
  title: 'Components/DropdownMenu',
  component: KpDropdownMenuComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        KpMenuItemComponent,
        KpMenuDividerComponent,
        KpMenuSectionLabelComponent,
        KpCheckboxComponent,
        KpRadioComponent,
        KpRadioGroupComponent,
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<KpDropdownMenuComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <kp-dropdown-menu>
        <kp-menu-item label="Profile"></kp-menu-item>
        <kp-menu-item label="Settings"></kp-menu-item>
        <kp-menu-divider></kp-menu-divider>
        <kp-menu-item label="Help"></kp-menu-item>
        <kp-menu-item label="Sign out"></kp-menu-item>
      </kp-dropdown-menu>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;align-items:flex-start;padding:8px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-dropdown-menu>
            <kp-menu-item size="sm" label="Profile"></kp-menu-item>
            <kp-menu-item size="sm" label="Settings"></kp-menu-item>
            <kp-menu-item size="sm" label="Preferences"></kp-menu-item>
            <kp-menu-item size="sm" label="Sign out"></kp-menu-item>
          </kp-dropdown-menu>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">sm / 28px items</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-dropdown-menu>
            <kp-menu-item size="md" label="Profile"></kp-menu-item>
            <kp-menu-item size="md" label="Settings"></kp-menu-item>
            <kp-menu-item size="md" label="Preferences"></kp-menu-item>
            <kp-menu-item size="md" label="Sign out"></kp-menu-item>
          </kp-dropdown-menu>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">md / 32px items</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <kp-dropdown-menu>
            <kp-menu-item size="lg" label="Profile"></kp-menu-item>
            <kp-menu-item size="lg" label="Settings"></kp-menu-item>
            <kp-menu-item size="lg" label="Preferences"></kp-menu-item>
            <kp-menu-item size="lg" label="Sign out"></kp-menu-item>
          </kp-dropdown-menu>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">lg / 40px items</span>
        </div>
      </div>`,
  }),
};

export const ItemStates: Story = {
  name: 'Item States',
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;align-items:flex-start;padding:8px">
        <kp-dropdown-menu>
          <kp-menu-item label="Default (rest)"></kp-menu-item>
          <kp-menu-item label="Hover" forceState="hover"></kp-menu-item>
          <kp-menu-item label="Active" forceState="active"></kp-menu-item>
          <kp-menu-item label="Focus" forceState="focus"></kp-menu-item>
          <kp-menu-item label="Selected" [selected]="true"></kp-menu-item>
          <kp-menu-item label="Disabled" [disabled]="true"></kp-menu-item>
        </kp-dropdown-menu>
      </div>`,
  }),
};

export const RichContent: Story = {
  name: 'Rich Content',
  render: () => ({
    template: `
      <kp-dropdown-menu>
        <kp-menu-section-label label="Actions"></kp-menu-section-label>
        <kp-menu-item size="lg" label="Edit" shortcut="⌘E">
          <svg kpMenuItemIcon width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 20h4L18 10l-4-4L4 16v4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </kp-menu-item>
        <kp-menu-item size="lg" label="Duplicate" shortcut="⌘D">
          <svg kpMenuItemIcon width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="2"/></svg>
        </kp-menu-item>
        <kp-menu-item size="lg" label="Share" [hasChevron]="true">
          <svg kpMenuItemIcon width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/><path d="M8.5 10.5l7-4M8.5 13.5l7 4" stroke="currentColor" stroke-width="2"/></svg>
        </kp-menu-item>
        <kp-menu-divider></kp-menu-divider>
        <kp-menu-section-label label="Danger"></kp-menu-section-label>
        <kp-menu-item size="lg" label="Delete" [danger]="true">
          <svg kpMenuItemIcon width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </kp-menu-item>
      </kp-dropdown-menu>`,
  }),
};

export const WithDescriptions: Story = {
  name: 'With Descriptions',
  render: () => ({
    template: `
      <kp-dropdown-menu>
        <kp-menu-item size="lg" label="Export as PNG" description="High quality, best for sharing"></kp-menu-item>
        <kp-menu-item size="lg" label="Export as JPG" description="Smaller file size, some quality loss"></kp-menu-item>
        <kp-menu-item size="lg" label="Export as SVG" description="Vector format, scales perfectly — great for icons, logos, and illustrations"></kp-menu-item>
      </kp-dropdown-menu>`,
  }),
};

export const Sections: Story = {
  render: () => ({
    template: `
      <kp-dropdown-menu>
        <kp-menu-section-label label="Account"></kp-menu-section-label>
        <kp-menu-item label="Profile"></kp-menu-item>
        <kp-menu-item label="Settings"></kp-menu-item>
        <kp-menu-divider></kp-menu-divider>
        <kp-menu-section-label label="Workspace"></kp-menu-section-label>
        <kp-menu-item label="Team members"></kp-menu-item>
        <kp-menu-item label="Billing"></kp-menu-item>
        <kp-menu-divider></kp-menu-divider>
        <kp-menu-item label="Sign out"></kp-menu-item>
      </kp-dropdown-menu>`,
  }),
};

export const WithSearch: Story = {
  name: 'With Search',
  render: () => ({
    template: `
      <kp-dropdown-menu [hasSearch]="true" searchPlaceholder="Search actions...">
        <kp-menu-item label="New file"></kp-menu-item>
        <kp-menu-item label="New folder"></kp-menu-item>
        <kp-menu-item label="Upload"></kp-menu-item>
        <kp-menu-divider></kp-menu-divider>
        <kp-menu-item label="Move to trash" [danger]="true"></kp-menu-item>
      </kp-dropdown-menu>`,
  }),
};

export const WithFooter: Story = {
  name: 'With Footer',
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;align-items:flex-start">
        <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
          <kp-dropdown-menu [hasFooter]="true" [showCancel]="true" primaryLabel="Apply" cancelLabel="Cancel">
            <kp-menu-section-label label="Filters"></kp-menu-section-label>
            <kp-menu-item label="All items"></kp-menu-item>
            <kp-menu-item label="Recent" [selected]="true"></kp-menu-item>
            <kp-menu-item label="Starred"></kp-menu-item>
          </kp-dropdown-menu>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">2 buttons (Cancel + Apply)</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
          <kp-dropdown-menu [hasFooter]="true" [showCancel]="false" primaryLabel="Done">
            <kp-menu-item label="Option A"></kp-menu-item>
            <kp-menu-item label="Option B"></kp-menu-item>
            <kp-menu-item label="Option C"></kp-menu-item>
          </kp-dropdown-menu>
          <span style="font-size:11px;color: var(--kp-color-gray-500)">1 button only</span>
        </div>
      </div>`,
  }),
};

export const SearchAndFooter: Story = {
  name: 'Search + Footer (full chrome)',
  render: () => ({
    template: `
      <kp-dropdown-menu
        [hasSearch]="true"
        [hasFooter]="true"
        [showCancel]="true"
        searchPlaceholder="Find a member..."
        primaryLabel="Invite"
        cancelLabel="Cancel">
        <kp-menu-section-label label="Team members"></kp-menu-section-label>
        <kp-menu-item label="Alice Johnson"></kp-menu-item>
        <kp-menu-item label="Bob Smith" [selected]="true"></kp-menu-item>
        <kp-menu-item label="Charlie Brown"></kp-menu-item>
        <kp-menu-item label="Diana Prince"></kp-menu-item>
      </kp-dropdown-menu>`,
  }),
};

export const CheckboxesAndRadios: Story = {
  name: 'Checkboxes & Radios',
  render: () => ({
    props: {
      viewOptions: { grid: true, rulers: false, guides: true, pixel: false },
      selectedSize: 'md',
    },
    template: `
      <div style="display:flex;gap:16px;align-items:flex-start;padding:8px">
        <kp-dropdown-menu>
          <kp-menu-section-label label="View options"></kp-menu-section-label>
          <kp-menu-item label="Show grid">
            <kp-checkbox kpMenuItemLeading size="sm" [checked]="viewOptions.grid" [hasLabel]="false"></kp-checkbox>
          </kp-menu-item>
          <kp-menu-item label="Show rulers">
            <kp-checkbox kpMenuItemLeading size="sm" [checked]="viewOptions.rulers" [hasLabel]="false"></kp-checkbox>
          </kp-menu-item>
          <kp-menu-item label="Show guides">
            <kp-checkbox kpMenuItemLeading size="sm" [checked]="viewOptions.guides" [hasLabel]="false"></kp-checkbox>
          </kp-menu-item>
          <kp-menu-item label="Show pixel preview">
            <kp-checkbox kpMenuItemLeading size="sm" [checked]="viewOptions.pixel" [hasLabel]="false"></kp-checkbox>
          </kp-menu-item>
        </kp-dropdown-menu>

        <kp-dropdown-menu>
          <kp-menu-section-label label="Size"></kp-menu-section-label>
          <kp-radio-group [(value)]="selectedSize">
            <kp-menu-item label="Small">
              <kp-radio kpMenuItemLeading size="sm" value="sm" [hasLabel]="false"></kp-radio>
            </kp-menu-item>
            <kp-menu-item label="Medium">
              <kp-radio kpMenuItemLeading size="sm" value="md" [hasLabel]="false"></kp-radio>
            </kp-menu-item>
            <kp-menu-item label="Large">
              <kp-radio kpMenuItemLeading size="sm" value="lg" [hasLabel]="false"></kp-radio>
            </kp-menu-item>
            <kp-menu-item label="X-Large">
              <kp-radio kpMenuItemLeading size="sm" value="xl" [hasLabel]="false"></kp-radio>
            </kp-menu-item>
          </kp-radio-group>
        </kp-dropdown-menu>
      </div>`,
  }),
};
