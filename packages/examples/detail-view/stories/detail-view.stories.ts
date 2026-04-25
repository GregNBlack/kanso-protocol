import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Component } from '@angular/core';

import { KpHeaderComponent, KpHeaderNavItem } from '@kanso-protocol/header';
import { KpSidebarComponent, KpSidebarSection } from '@kanso-protocol/sidebar';
import { KpPageHeaderComponent } from '@kanso-protocol/page-header';
import { KpBreadcrumbsComponent } from '@kanso-protocol/breadcrumbs';
import { KpTabsComponent, KpTabComponent } from '@kanso-protocol/tabs';
import { KpCardComponent } from '@kanso-protocol/card';
import { KpButtonComponent } from '@kanso-protocol/button';
import { KpBadgeComponent } from '@kanso-protocol/badge';
import { KpAvatarComponent } from '@kanso-protocol/avatar';
import { KpAvatarGroupComponent, KpAvatarGroupItem } from '@kanso-protocol/avatar-group';
import { KpSettingsRowComponent } from '@kanso-protocol/settings-panel';
import { KpIconComponent } from '@kanso-protocol/icon';

interface ActivityEvent {
  initials: string;
  name: string;
  action: string;
  target: string;
  time: string;
}

interface MemberCard {
  initials: string;
  name: string;
  role: string;
}

@Component({
  selector: 'kp-example-detail-view',
  standalone: true,
  imports: [KpHeaderComponent, KpSidebarComponent, KpPageHeaderComponent,
    KpBreadcrumbsComponent,
    KpTabsComponent, KpTabComponent,
    KpCardComponent, KpButtonComponent, KpBadgeComponent,
    KpAvatarComponent, KpAvatarGroupComponent,
    KpSettingsRowComponent, KpIconComponent],
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
            title="Kanso Protocol"
            description="Open-source Angular design system."
            [showBreadcrumbs]="true"
            [showBackButton]="true"
            [showDescription]="true"
            [showActions]="true"
            [showTabs]="true"
            [showBottomDivider]="true">
            <kp-breadcrumbs kpPageHeaderBreadcrumbs size="md">
              <a href="#">Projects</a>
              <a href="#">Design System</a>
              <span aria-current="page">Kanso Protocol</span>
            </kp-breadcrumbs>

            <div kpPageHeaderTitle class="title-row">
              <h1 class="title">Kanso Protocol</h1>
              <kp-badge size="sm" pill color="success" appearance="subtle">Active</kp-badge>
            </div>

            <div kpPageHeaderActions class="actions">
              <kp-button variant="outline" color="neutral" size="sm">
                <kp-icon kpButtonIconLeft name="share" />
                <span>Share</span>
              </kp-button>
              <kp-button variant="default" color="primary" size="sm">
                <kp-icon kpButtonIconLeft name="edit" />
                <span>Edit</span>
              </kp-button>
              <kp-button variant="ghost" color="neutral" size="sm" [iconOnly]="true" aria-label="More">
                <kp-icon kpButtonIconLeft name="dots" />
              </kp-button>
            </div>

            <kp-tabs kpPageHeaderTabs size="md">
              <kp-tab label="Overview" [selected]="true"/>
              <kp-tab label="Activity"/>
              <kp-tab label="Files"/>
              <kp-tab label="Members"/>
              <kp-tab label="Settings"/>
            </kp-tabs>
          </kp-page-header>

          <div class="grid">
            <div class="grid-main">
              <kp-card title="About" description="Project overview and goals."
                       [showDescription]="true" [showHeaderDivider]="true">
                <p class="prose">
                  Kanso Protocol is a tokens-first design system for ambitious B2B apps.
                  It ships a tight set of accessible Angular components and Figma
                  variants that share the same primitive + semantic token graph, so a
                  designer's red-300 stroke and an engineer's
                  <code>--kp-color-red-300</code> are guaranteed to be the same colour.
                </p>
              </kp-card>

              <kp-card title="Recent activity" description="Last 7 days"
                       [showDescription]="true" [showHeaderDivider]="true">
                <div class="timeline">
                  @for (e of activity; track e.name + e.time) {
                    <div class="event">
                      <kp-avatar size="sm" content="initials" [initials]="e.initials"/>
                      <div class="event-text">
                        <span><strong>{{ e.name }}</strong> {{ e.action }} <em>{{ e.target }}</em></span>
                        <span class="event-time">{{ e.time }}</span>
                      </div>
                    </div>
                  }
                </div>
              </kp-card>
            </div>

            <div class="grid-side">
              <kp-card title="Details" [showHeaderDivider]="true" class="details-card">
                <kp-settings-row title="Owner" [showDescription]="false" [showDivider]="true">
                  <span class="kv">Greg Black</span>
                </kp-settings-row>
                <kp-settings-row title="Created" [showDescription]="false" [showDivider]="true">
                  <span class="kv">Jan 12, 2026</span>
                </kp-settings-row>
                <kp-settings-row title="Visibility" [showDescription]="false" [showDivider]="true">
                  <kp-badge size="xs" pill color="primary" appearance="subtle">Public</kp-badge>
                </kp-settings-row>
                <kp-settings-row title="License" [showDescription]="false" [showDivider]="false">
                  <span class="kv">MIT</span>
                </kp-settings-row>
              </kp-card>

              <kp-card title="Members" description="7 collaborators"
                       [showDescription]="true" [showHeaderDivider]="true">
                <div class="members">
                  <kp-avatar-group size="md" overlap="normal" [items]="memberAvatars" [max]="4" [total]="7"/>
                  <div class="member-list">
                    @for (m of members; track m.name) {
                      <div class="member">
                        <kp-avatar size="sm" content="initials" [initials]="m.initials"/>
                        <div class="member-text">
                          <span class="member-name">{{ m.name }}</span>
                          <span class="member-role">{{ m.role }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </kp-card>
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

    .title-row {
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }
    .title {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: var(--kp-color-gray-900, #18181B);
    }

    .actions { display: inline-flex; gap: 8px; }

    .grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      align-items: start;
    }
    .grid-main, .grid-side {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }
    .grid > kp-card,
    .grid-main > kp-card,
    .grid-side > kp-card {
      --kp-card-w: 100%;
      width: 100%;
    }

    .prose {
      margin: 0;
      font-size: 14px;
      line-height: 1.55;
      color: var(--kp-color-gray-800, #27272A);
    }
    .prose code {
      font-family: var(--kp-font-family-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: 12.5px;
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--kp-color-gray-100, #F4F4F5);
    }

    .timeline { display: flex; flex-direction: column; gap: 14px; }
    .event { display: flex; align-items: flex-start; gap: 12px; }
    .event-text { display: flex; flex-direction: column; font-size: 13px; line-height: 1.4; color: var(--kp-color-gray-800, #27272A); }
    .event-text strong { font-weight: 600; }
    .event-text em { font-style: normal; color: var(--kp-color-gray-900, #18181B); font-weight: 500; }
    .event-time { font-size: 12px; color: var(--kp-color-gray-500, #71717A); }

    .kv { font-size: 13px; color: var(--kp-color-gray-900, #18181B); }

    /* Details card sits in the narrow side column. SettingsRow ships
       with a 280px control column for forms — way too wide here. Pin
       it to a tight 120px so Owner / Created / License values stay
       inside the card. */
    .details-card kp-settings-row {
      --kp-sr-control-w: 120px;
    }

    .members { display: flex; flex-direction: column; gap: 16px; }
    .member-list { display: flex; flex-direction: column; gap: 10px; }
    .member { display: flex; align-items: center; gap: 10px; }
    .member-text { display: flex; flex-direction: column; line-height: 1.3; }
    .member-name { font-size: 13px; font-weight: 500; color: var(--kp-color-gray-900, #18181B); }
    .member-role { font-size: 12px; color: var(--kp-color-gray-500, #71717A); }
  `],
})
class KpExampleDetailViewComponent {
  navItems: KpHeaderNavItem[] = [
    { label: 'Dashboard' },
    { label: 'Projects', active: true },
    { label: 'Team' },
    { label: 'Documents' },
  ];

  sections: KpSidebarSection[] = [
    { label: 'Main', items: [
      { label: 'Dashboard',  icon: 'layout-dashboard' },
      { label: 'Projects',   icon: 'folder', active: true, badge: '12' },
      { label: 'Team',       icon: 'users' },
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

  activity: ActivityEvent[] = [
    { initials: 'GB', name: 'Greg',  action: 'merged',     target: 'feat/toast — signal-driven queue', time: '2h ago' },
    { initials: 'SK', name: 'Sarah', action: 'commented on', target: 'PR #128 — Token migration', time: '4h ago' },
    { initials: 'AJ', name: 'Anna',  action: 'created',     target: 'issue #142 — Dark theme tokens', time: 'yesterday' },
    { initials: 'NB', name: 'Noah',  action: 'opened',      target: 'PR #133 — FilterBar wrap fix', time: '2d ago' },
  ];

  memberAvatars: KpAvatarGroupItem[] = [
    { initials: 'GB' }, { initials: 'SK' }, { initials: 'AJ' }, { initials: 'NB' },
  ];

  members: MemberCard[] = [
    { initials: 'GB', name: 'Greg Black',    role: 'Owner'  },
    { initials: 'SK', name: 'Sarah Kim',     role: 'Editor' },
    { initials: 'AJ', name: 'Anna Johnson',  role: 'Editor' },
    { initials: 'NB', name: 'Noah Brown',    role: 'Editor' },
  ];
}

const meta: Meta<KpExampleDetailViewComponent> = {
  title: 'Examples/Detail View',
  component: KpExampleDetailViewComponent,
  decorators: [moduleMetadata({ imports: [KpExampleDetailViewComponent] })],
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<KpExampleDetailViewComponent>;

export const Default: Story = {};
