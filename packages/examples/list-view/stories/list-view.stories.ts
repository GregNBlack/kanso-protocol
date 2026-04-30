import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Component } from '@angular/core';

import { KpHeaderComponent, KpHeaderNavItem } from '@kanso-protocol/header';
import { KpSidebarComponent, KpSidebarSection } from '@kanso-protocol/sidebar';
import { KpPageHeaderComponent } from '@kanso-protocol/page-header';
import { KpTableToolbarComponent } from '@kanso-protocol/table-toolbar';
import { KpFilterBarComponent, KpFilterChip } from '@kanso-protocol/filter-bar';
import { KpTableComponent, KpTableColumn, KpTableCellDirective, KpTableHeaderDirective } from '@kanso-protocol/table';
import { KpPaginationComponent } from '@kanso-protocol/pagination';
import { KpAvatarComponent } from '@kanso-protocol/avatar';
import { KpBadgeComponent, KpBadgeColor } from '@kanso-protocol/badge';
import { KpButtonComponent } from '@kanso-protocol/button';
import { KpIconComponent } from '@kanso-protocol/icon';

interface TeamMember {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Pending' | 'Inactive';
}

@Component({
  selector: 'kp-example-list-view',
  standalone: true,
  imports: [KpHeaderComponent, KpSidebarComponent, KpPageHeaderComponent,
    KpTableToolbarComponent, KpFilterBarComponent,
    KpTableComponent, KpTableCellDirective, KpTableHeaderDirective,
    KpPaginationComponent, KpAvatarComponent, KpBadgeComponent, KpButtonComponent, KpIconComponent],
  template: `
    <div class="shell">
      <kp-header
        size="md" appearance="light"
        logoText="Kanso Protocol"
        [showSearch]="true"
        [navItems]="navItems"
        [notificationsCount]="3"
        [showUserMenu]="true">
      </kp-header>

      <div class="body">
        <kp-sidebar
          widthState="expanded" appearance="light"
          [showLogo]="false" [showUserFooter]="false"
          [sections]="sections">
        </kp-sidebar>

        <main class="main">
          <kp-page-header
            size="md"
            title="Team members"
            description="12 active members across your workspace."
            [showDescription]="true"
            [showActions]="true"
            [showBottomDivider]="false">
            <div kpPageHeaderActions class="ph-actions">
              <kp-button variant="ghost" color="neutral" size="sm">
                <kp-icon kpButtonIconLeft name="download" />
                <span>Export</span>
              </kp-button>
              <kp-button variant="default" color="primary" size="sm">
                <kp-icon kpButtonIconLeft name="plus" />
                <span>Invite</span>
              </kp-button>
            </div>
          </kp-page-header>

          <div class="table-card">
            <kp-table-toolbar
              searchPlaceholder="Search members…"
              [activeFilterCount]="2"
              createLabel="Invite">
            </kp-table-toolbar>

            <kp-filter-bar [filters]="filters" [showAddFilter]="true" [showClearAll]="true"/>

            <kp-table [columns]="columns" [data]="rows" [selectable]="true" size="md">
              <ng-template kpTableHeader="user"><span>Name</span></ng-template>
              <ng-template kpTableCell="user" let-row>
                <div class="user-cell">
                  <kp-avatar size="sm" content="initials" [initials]="row.initials"/>
                  <div class="user-text">
                    <span class="user-name">{{ row.name }}</span>
                    <span class="user-email">{{ row.email }}</span>
                  </div>
                </div>
              </ng-template>

              <ng-template kpTableCell="status" let-row>
                <kp-badge size="xs" pill [appearance]="'subtle'" [color]="statusColor(row.status)">
                  {{ row.status }}
                </kp-badge>
              </ng-template>

              <ng-template kpTableCell="actions">
                <kp-button variant="ghost" color="neutral" size="sm" [iconOnly]="true" aria-label="More">
                  <kp-icon kpButtonIconLeft name="dots" />
                </kp-button>
              </ng-template>
            </kp-table>

            <div class="table-footer">
              <kp-pagination
                size="md"
                [currentPage]="1"
                [totalPages]="3"
                [showItemsInfo]="true"
                [itemsPerPage]="8"
                [itemsTotal]="24">
              </kp-pagination>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .shell {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
      background: var(--kp-color-gray-50, #FAFAFA);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .body {
      display: flex;
      flex: 1 1 auto;
      align-items: stretch;
      min-height: 0;
    }

    .body > kp-sidebar {
      align-self: stretch;
      min-height: 100%;
      height: auto;
    }

    .main {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 24px 32px 48px;
      box-sizing: border-box;
    }

    .ph-actions { display: flex; gap: 8px; }

    .table-card {
      background: var(--kp-color-white, #FFFFFF);
      border: 1px solid var(--kp-color-gray-200, #E4E4E7);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .user-cell {
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }
    .user-text { display: inline-flex; flex-direction: column; line-height: 1.3; }
    .user-name { font-weight: 500; font-size: 13px; color: var(--kp-color-gray-900, #18181B); }
    .user-email { font-size: 12px; color: var(--kp-color-gray-500, #71717A); }

    .table-footer {
      display: flex;
      justify-content: flex-end;
      padding: 12px 16px;
      border-top: 1px solid var(--kp-color-gray-100, #F4F4F5);
    }
  `],
})
class KpExampleListViewComponent {
  navItems: KpHeaderNavItem[] = [
    { label: 'Dashboard' },
    { label: 'Projects' },
    { label: 'Team', active: true },
    { label: 'Documents' },
  ];

  sections: KpSidebarSection[] = [
    { label: 'Main', items: [
      { label: 'Dashboard',  icon: 'layout-dashboard' },
      { label: 'Projects',   icon: 'folder' },
      { label: 'Team',       icon: 'users', badge: '12', active: true },
      { label: 'Documents',  icon: 'file-text' },
    ]},
    { label: 'Workspace', items: [
      { label: 'Analytics',    icon: 'chart-bar' },
      { label: 'Reports',      icon: 'report' },
      { label: 'Integrations', icon: 'plug', badge: 'New' },
    ]},
    { label: 'Settings', items: [
      { label: 'Settings', icon: 'settings' },
      { label: 'Help',     icon: 'help-circle' },
    ]},
  ];

  filters: KpFilterChip[] = [
    { id: 'role',   label: 'Role: Admin',         color: 'primary' },
    { id: 'status', label: 'Status: Active',      color: 'success' },
  ];

  columns: KpTableColumn<TeamMember>[] = [
    { id: 'user',    label: 'Name', align: 'left' },
    { id: 'role',    label: 'Role', align: 'left' },
    { id: 'status',  label: 'Status', align: 'left' },
    { id: 'actions', label: '', align: 'right' },
  ];

  rows: TeamMember[] = [
    { id: '1', initials: 'GB', name: 'Greg Black',    email: 'greg@example.com',   role: 'Admin',  status: 'Active' },
    { id: '2', initials: 'SK', name: 'Sarah Kim',     email: 'sarah@example.com',  role: 'Editor', status: 'Active' },
    { id: '3', initials: 'AJ', name: 'Anna Johnson',  email: 'anna@example.com',   role: 'Editor', status: 'Active' },
    { id: '4', initials: 'LM', name: 'Liam Martin',   email: 'liam@example.com',   role: 'Viewer', status: 'Pending' },
    { id: '5', initials: 'OD', name: 'Olivia Diaz',   email: 'olivia@example.com', role: 'Viewer', status: 'Active' },
    { id: '6', initials: 'NB', name: 'Noah Brown',    email: 'noah@example.com',   role: 'Admin',  status: 'Active' },
    { id: '7', initials: 'EW', name: 'Eva Wong',      email: 'eva@example.com',    role: 'Editor', status: 'Inactive' },
    { id: '8', initials: 'MR', name: 'Mia Robertson', email: 'mia@example.com',    role: 'Viewer', status: 'Pending' },
  ];

  statusColor(status: TeamMember['status']): KpBadgeColor {
    if (status === 'Active')  return 'success';
    if (status === 'Pending') return 'warning';
    return 'neutral';
  }
}

const meta: Meta<KpExampleListViewComponent> = {
  title: 'Examples/List View',
  component: KpExampleListViewComponent,
  decorators: [moduleMetadata({ imports: [KpExampleListViewComponent] })],
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // Pattern stories compose multiple landmark-bearing components (Header,
    // Sidebar, footer, etc.) on a single page — that's the *correct* shape
    // for a real app shell, but it triggers landmark-unique / no-duplicate-*
    // rules in axe. Real consumers see only one shell per page; the demo
    // legitimately needs to render several side by side. Disable the rules
    // here, not in the components themselves.
    a11y: { config: { rules: [
      { id: 'landmark-unique', enabled: false },
      { id: 'landmark-no-duplicate-banner', enabled: false },
      { id: 'landmark-no-duplicate-contentinfo', enabled: false },
    ] } },
  },
};
export default meta;
type Story = StoryObj<KpExampleListViewComponent>;

export const Default: Story = {};
