import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpAlertComponent } from '../src/alert.component';
import { KpButtonComponent } from '@kanso-protocol/button';

const ICON = {
  infoCircle:    'M12 8v.01M11 12h1v4h1M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z',
  alertCircle:   'M12 8v4M12 16v.01M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z',
  alertTriangle: 'M12 9v4M12 17v.01M10.24 3.957L3.2 16.104a2 2 0 0 0 1.737 3h14.118a2 2 0 0 0 1.737-3L13.76 3.957a2 2 0 0 0-3.52 0z',
  checkCircle:   'M9 12l2 2 4-4M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z',
  bell:          'M10 5a2 2 0 0 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6zM9 17v1a3 3 0 0 0 6 0v-1',
};

function icon(d: string): string {
  return `<svg kpAlertIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
}

const meta: Meta<KpAlertComponent> = {
  title: 'Components/Alert',
  component: KpAlertComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpButtonComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], table: { defaultValue: { summary: 'md' } } },
    appearance: { control: 'select', options: ['subtle', 'solid', 'outline', 'left-accent'], table: { defaultValue: { summary: 'subtle' } } },
    color: { control: 'select', options: ['primary', 'danger', 'success', 'warning', 'info', 'neutral'], table: { defaultValue: { summary: 'primary' } } },
    actionPlacement: { control: 'inline-radio', options: ['inline', 'stacked'], table: { defaultValue: { summary: 'inline' } } },
    closable: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
};
export default meta;
type Story = StoryObj<KpAlertComponent>;

export const Default: Story = {
  args: {
    size: 'md', appearance: 'subtle', color: 'info',
    title: 'System update available',
    description: 'A new version is ready to install. Restart to apply changes.',
    actionPlacement: 'inline', closable: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <kp-alert [size]="size" [appearance]="appearance" [color]="color"
                [title]="title" [description]="description"
                [actionPlacement]="actionPlacement" [closable]="closable">
        ${icon(ICON.infoCircle)}
      </kp-alert>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
        <kp-alert size="sm" color="info" title="System update available"
                  description="A new version is ready to install. Restart to apply changes.">
          ${icon(ICON.infoCircle)}
        </kp-alert>
        <kp-alert size="md" color="info" title="System update available"
                  description="A new version is ready to install. Restart to apply changes.">
          ${icon(ICON.infoCircle)}
        </kp-alert>
        <kp-alert size="lg" color="info" title="System update available"
                  description="A new version is ready to install. Restart to apply changes.">
          ${icon(ICON.infoCircle)}
        </kp-alert>
      </div>`,
  }),
};

export const Appearances: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
        <kp-alert color="info" appearance="subtle"      title="Subtle"      description="Light tinted background">${icon(ICON.infoCircle)}</kp-alert>
        <kp-alert color="info" appearance="solid"       title="Solid"       description="Bold filled background">${icon(ICON.infoCircle)}</kp-alert>
        <kp-alert color="info" appearance="outline"     title="Outline"     description="Transparent with colored border">${icon(ICON.infoCircle)}</kp-alert>
        <kp-alert color="info" appearance="left-accent" title="Left accent" description="White with colored left bar">${icon(ICON.infoCircle)}</kp-alert>
      </div>`,
  }),
};

export const ColorRoles: Story = {
  name: 'Color Roles',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
        <kp-alert color="primary" title="New feature released"   description="Check out the redesigned dashboard.">${icon(ICON.infoCircle)}</kp-alert>
        <kp-alert color="danger"  title="Payment failed"         description="Your last payment couldn't be processed. Please update your card.">${icon(ICON.alertCircle)}</kp-alert>
        <kp-alert color="success" title="Changes saved"          description="Your profile has been updated successfully.">${icon(ICON.checkCircle)}</kp-alert>
        <kp-alert color="warning" title="Storage almost full"    description="You've used 90% of your storage quota.">${icon(ICON.alertTriangle)}</kp-alert>
        <kp-alert color="info"    title="Scheduled maintenance"  description="The system will be unavailable Saturday 2-4 AM UTC.">${icon(ICON.infoCircle)}</kp-alert>
        <kp-alert color="neutral" title="3 new notifications"    description="You have unread messages from the last 24 hours.">${icon(ICON.bell)}</kp-alert>
      </div>`,
  }),
};

export const WithActions: Story = {
  name: 'With Actions',
  render: () => ({
    props: { onAction: () => undefined },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
        <kp-alert color="info" title="Update available" description="Version 2.3 is ready.">
          ${icon(ICON.infoCircle)}
          <kp-button kpAlertAction size="sm" variant="subtle" color="primary" (click)="onAction()">Update</kp-button>
        </kp-alert>

        <kp-alert color="danger" actionPlacement="stacked"
                  title="Unable to save"
                  description="Please check your internet connection and try again. If the problem persists, contact support.">
          ${icon(ICON.alertCircle)}
          <kp-button kpAlertAction size="sm" variant="ghost" color="danger" (click)="onAction()">Retry</kp-button>
        </kp-alert>

        <kp-alert color="warning" appearance="left-accent"
                  title="Review required" description="3 items need your approval.">
          ${icon(ICON.alertTriangle)}
          <kp-button kpAlertAction size="sm" variant="subtle" color="primary" (click)="onAction()">Review</kp-button>
        </kp-alert>
      </div>`,
  }),
};

export const Closable: Story = {
  render: () => ({
    props: { onClose: (_e: any) => undefined },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
        <kp-alert color="info"    [closable]="true" (close)="onClose($event)"
                  title="Tip"          description="You can dismiss this alert by clicking the close button.">${icon(ICON.infoCircle)}</kp-alert>
        <kp-alert color="success" [closable]="true" (close)="onClose($event)"
                  title="All synced"   description="Your changes have been saved to the cloud.">${icon(ICON.checkCircle)}</kp-alert>
        <kp-alert color="neutral" [closable]="true" (close)="onClose($event)"
                  title="Cookie notice" description="We use cookies to improve your experience.">${icon(ICON.bell)}</kp-alert>
      </div>`,
  }),
};

export const Minimal: Story = {
  name: 'Minimal (title only)',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
        <kp-alert size="sm" color="success" title="Saved successfully">${icon(ICON.checkCircle)}</kp-alert>
        <kp-alert size="sm" color="danger"  title="Something went wrong">${icon(ICON.alertCircle)}</kp-alert>
        <kp-alert size="sm" color="warning" title="Unsaved changes">${icon(ICON.alertTriangle)}</kp-alert>
        <kp-alert size="sm" color="info"    title="Sync in progress">${icon(ICON.infoCircle)}</kp-alert>
      </div>`,
  }),
};

export const FullFeatured: Story = {
  name: 'Full Featured',
  render: () => ({
    props: { onRenew: () => undefined, onClose: (_e: any) => undefined },
    template: `
      <kp-alert size="lg" color="warning" appearance="left-accent"
                [closable]="true" (close)="onClose($event)"
                title="Your subscription expires in 3 days"
                description="To continue using premium features, please renew your subscription. You won't lose any data if you renew within 30 days of expiration.">
        ${icon(ICON.alertTriangle)}
        <kp-button kpAlertAction size="md" variant="default" color="primary" (click)="onRenew()">Renew now</kp-button>
      </kp-alert>`,
  }),
};
