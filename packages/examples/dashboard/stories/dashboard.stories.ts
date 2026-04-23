import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Component } from '@angular/core';

import { KpHeaderComponent, KpHeaderNavItem } from '@kanso-protocol/header';
import { KpSidebarComponent, KpSidebarSection } from '@kanso-protocol/sidebar';
import { KpBannerComponent } from '@kanso-protocol/banner';
import { KpPageHeaderComponent } from '@kanso-protocol/page-header';
import { KpStatCardComponent } from '@kanso-protocol/stat-card';
import { KpCardComponent } from '@kanso-protocol/card';
import { KpButtonComponent } from '@kanso-protocol/button';
import { KpNotificationItemComponent } from '@kanso-protocol/notification-center';

@Component({
  selector: 'kp-example-dashboard',
  standalone: true,
  imports: [
    KpHeaderComponent, KpSidebarComponent, KpBannerComponent, KpPageHeaderComponent,
    KpStatCardComponent, KpCardComponent, KpButtonComponent, KpNotificationItemComponent,
  ],
  template: `
    <div class="shell">
      <kp-header
        size="md"
        appearance="light"
        logoText="Kanso Protocol"
        [showSearch]="true"
        [navItems]="navItems"
        [notificationsCount]="3"
        [showUserMenu]="true">
      </kp-header>

      <div class="body">
        <kp-sidebar
          widthState="expanded"
          appearance="light"
          [showLogo]="false"
          [showUserFooter]="false"
          [sections]="sections">
        </kp-sidebar>

        <main class="main">
          <kp-banner
            color="warning"
            size="md"
            title="Your trial ends in 5 days. Upgrade now to keep your data."
            [showClose]="true">
          </kp-banner>

          <kp-page-header
            size="md"
            title="Dashboard"
            [showActions]="true"
            [showBottomDivider]="false">
            <div kpPageHeaderActions style="display:flex;gap:8px">
              <kp-button variant="ghost" color="neutral" size="sm">
                <i kpButtonIconLeft class="ti ti-download"></i>
                <span>Export</span>
              </kp-button>
              <kp-button variant="default" color="primary" size="sm">
                <i kpButtonIconLeft class="ti ti-plus"></i>
                <span>Create report</span>
              </kp-button>
            </div>
          </kp-page-header>

          <div class="stats-row">
            <kp-stat-card label="Total Revenue" value="$12,482" [showIcon]="true" icon="currency-dollar"
                          trendDirection="up" trendValue="+12.5%" trendDescription="from last month"/>
            <kp-stat-card label="Active Users" value="2,847" [showIcon]="true" icon="users"
                          trendDirection="up" trendValue="+5.2%" trendDescription="from last week"/>
            <kp-stat-card label="Churn Rate" value="2.4%" [showIcon]="true" icon="trending-up"
                          trendDirection="up" trendAppearance="negative" trendValue="+0.3%" trendDescription="from last month"/>
            <kp-stat-card label="Avg Response Time" value="142ms" [showIcon]="true" icon="clock"
                          trendDirection="down" trendAppearance="negative" trendValue="-8ms" trendDescription="from last week"/>
          </div>

          <div class="charts-row">
            <kp-card title="Revenue over time" description="Last 30 days"
                     [showDescription]="true" [showHeaderDivider]="true">
              <div class="chart-placeholder">— chart placeholder —</div>
            </kp-card>

            <kp-card title="Top customers" description="By revenue this month"
                     [showDescription]="true" [showHeaderDivider]="true">
              <div class="cust-table">
                @for (r of topCustomers; track r.name; let i = $index) {
                  <div class="cust-row" [class.cust-row--alt]="i % 2 === 1">
                    <span class="cust-name">{{ r.name }}</span>
                    <span class="cust-value">{{ r.value }}</span>
                  </div>
                }
              </div>
            </kp-card>
          </div>

          <kp-card title="Recent activity" [showHeaderDivider]="true">
            <div class="activity">
              <kp-notification-item
                appearance="success" icon="circle-check"
                title="Build completed"
                message="Deployment to production successful."
                time="1h ago"/>
              <kp-notification-item
                appearance="warning" icon="alert-triangle"
                title="Database load high"
                message="Production DB at 82% CPU — investigate."
                time="3h ago"/>
              <kp-notification-item
                appearance="info" icon="info-circle"
                title="System maintenance"
                message="Scheduled for Sunday 2 AM UTC."
                time="6h ago"
                [read]="true"/>
            </div>
          </kp-card>
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

    /* Stretch the sidebar to fill the body height regardless of how
       short the main content is. Override the sidebar's own
       min-height: 100vh — we want it tied to the row, not the
       viewport, so the right border of the sidebar reaches the
       bottom of the page in this composition. */
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
      padding: 24px;
      box-sizing: border-box;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }

    .charts-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    /* Cards inside the dashboard grow with their grid track instead
       of holding their per-size fixed width. Override the kp-card
       width custom property locally — leave the component default
       intact for everyone else. */
    .charts-row > kp-card,
    .main > kp-card {
      --kp-card-w: 100%;
      width: 100%;
    }

    .chart-placeholder {
      height: 220px;
      border-radius: 8px;
      background: var(--kp-color-gray-50, #FAFAFA);
      border: 1px dashed var(--kp-color-gray-200, #E4E4E7);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px;
      color: var(--kp-color-gray-500, #71717A);
    }

    .cust-table { display: flex; flex-direction: column; }
    .cust-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      font-size: 13px;
      color: var(--kp-color-gray-900, #18181B);
    }
    .cust-row--alt { background: var(--kp-color-gray-50, #FAFAFA); }
    .cust-name { font-weight: 500; }
    .cust-value { font-weight: 600; font-variant-numeric: tabular-nums; }

    .activity { display: flex; flex-direction: column; }
  `],
})
class KpExampleDashboardComponent {
  navItems: KpHeaderNavItem[] = [
    { label: 'Dashboard', active: true },
    { label: 'Projects' },
    { label: 'Team' },
    { label: 'Documents' },
  ];

  sections: KpSidebarSection[] = [
    { label: 'Main', items: [
      { label: 'Dashboard',  icon: 'layout-dashboard', active: true },
      { label: 'Projects',   icon: 'folder' },
      { label: 'Team',       icon: 'users', badge: '12' },
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

  topCustomers = [
    { name: 'Acme Corp', value: '$48,210' },
    { name: 'Globex',    value: '$32,108' },
    { name: 'Initech',   value: '$27,540' },
    { name: 'Soylent',   value: '$19,830' },
    { name: 'Hooli',     value: '$14,202' },
  ];
}

const meta: Meta<KpExampleDashboardComponent> = {
  title: 'Examples/Dashboard',
  component: KpExampleDashboardComponent,
  decorators: [moduleMetadata({ imports: [KpExampleDashboardComponent] })],
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<KpExampleDashboardComponent>;

export const Default: Story = {};
