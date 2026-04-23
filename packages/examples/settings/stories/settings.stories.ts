import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Component } from '@angular/core';

import { KpHeaderComponent, KpHeaderNavItem } from '@kanso-protocol/header';
import { KpSidebarComponent, KpSidebarSection } from '@kanso-protocol/sidebar';
import { KpPageHeaderComponent } from '@kanso-protocol/page-header';
import { KpTabsComponent } from '@kanso-protocol/tabs';
import { KpTabComponent } from '@kanso-protocol/tabs';
import { KpSettingsPanelComponent } from '@kanso-protocol/settings-panel';
import { KpSettingsRowComponent } from '@kanso-protocol/settings-panel';
import { KpAvatarComponent } from '@kanso-protocol/avatar';
import { KpInputComponent } from '@kanso-protocol/input';
import { KpToggleComponent } from '@kanso-protocol/toggle';
import { KpSelectComponent } from '@kanso-protocol/select';
import { KpButtonComponent } from '@kanso-protocol/button';
import { KpTextareaComponent } from '@kanso-protocol/textarea';

@Component({
  selector: 'kp-example-settings',
  standalone: true,
  imports: [
    KpHeaderComponent, KpSidebarComponent, KpPageHeaderComponent,
    KpTabsComponent, KpTabComponent,
    KpSettingsPanelComponent, KpSettingsRowComponent,
    KpAvatarComponent, KpInputComponent, KpToggleComponent, KpSelectComponent,
    KpButtonComponent, KpTextareaComponent,
  ],
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
            title="Settings"
            description="Manage your account, preferences, and workspace."
            [showDescription]="true"
            [showTabs]="true"
            [showBottomDivider]="true">
            <kp-tabs kpPageHeaderTabs size="md">
              <kp-tab label="General"      [selected]="true"/>
              <kp-tab label="Notifications"/>
              <kp-tab label="Billing"/>
              <kp-tab label="Team"/>
              <kp-tab label="Security"/>
            </kp-tabs>
          </kp-page-header>

          <div class="container">
            <kp-settings-panel title="Profile"
                               description="Your public profile across the workspace.">
              <kp-settings-row title="Avatar"
                               description="Shown next to your name in mentions, comments, and lists.">
                <div class="avatar-row">
                  <kp-avatar size="lg" content="initials" initials="GB"/>
                  <kp-button variant="outline" color="neutral" size="sm">
                    <span>Change</span>
                  </kp-button>
                </div>
              </kp-settings-row>
              <kp-settings-row title="Full name"
                               description="Use your real name so teammates can find you.">
                <kp-input placeholder="Greg Black"/>
              </kp-settings-row>
              <kp-settings-row title="Email"
                               description="Used for notifications and account recovery.">
                <kp-input type="email" placeholder="greg@example.com"/>
              </kp-settings-row>
              <kp-settings-row title="Bio"
                               description="A short description that appears on your profile."
                               [showDivider]="false">
                <kp-textarea placeholder="Designer who loves typography." [rows]="3"/>
              </kp-settings-row>
            </kp-settings-panel>

            <kp-settings-panel title="Preferences"
                               description="Personalise how the app feels and behaves.">
              <kp-settings-row title="Theme"
                               description="Light, dark, or follow the system.">
                <kp-select placeholder="System" [options]="[]"/>
              </kp-settings-row>
              <kp-settings-row title="Language"
                               description="The interface language across the workspace.">
                <kp-select placeholder="English (US)" [options]="[]"/>
              </kp-settings-row>
              <kp-settings-row title="Timezone"
                               description="Times across the app are shown in this zone."
                               [showDivider]="false">
                <kp-select placeholder="America/Los_Angeles" [options]="[]"/>
              </kp-settings-row>
            </kp-settings-panel>

            <kp-settings-panel title="Danger zone"
                               description="Irreversible actions. Be sure before you click."
                               class="danger">
              <kp-settings-row title="Delete account"
                               description="Permanently remove your account and all data. This action cannot be undone."
                               [showDivider]="false">
                <kp-button variant="outline" color="danger" size="sm">
                  <span>Delete account</span>
                </kp-button>
              </kp-settings-row>
            </kp-settings-panel>
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

    .container {
      width: 100%;
      max-width: 720px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .avatar-row {
      display: inline-flex;
      align-items: center;
      gap: 16px;
    }

    /* Danger-zone accent — red border + red title via CSS variable.
       The component itself is not "danger-coloured"; we add the
       affordance at the example layer. */
    .danger {
      --kp-color-gray-200: var(--kp-color-red-300, #FCA5A5);
    }
    .danger ::ng-deep .kp-sp__title { color: var(--kp-color-red-600, #DC2626); }
  `],
})
class KpExampleSettingsComponent {
  navItems: KpHeaderNavItem[] = [
    { label: 'Dashboard' },
    { label: 'Projects' },
    { label: 'Team' },
    { label: 'Documents' },
    { label: 'Settings', active: true },
  ];

  sections: KpSidebarSection[] = [
    { label: 'Main', items: [
      { label: 'Dashboard',  icon: 'layout-dashboard' },
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
      { label: 'Settings', icon: 'settings', active: true },
      { label: 'Help',     icon: 'help-circle' },
    ]},
  ];
}

const meta: Meta<KpExampleSettingsComponent> = {
  title: 'Examples/Settings',
  component: KpExampleSettingsComponent,
  decorators: [moduleMetadata({ imports: [KpExampleSettingsComponent] })],
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<KpExampleSettingsComponent>;

export const Default: Story = {};
