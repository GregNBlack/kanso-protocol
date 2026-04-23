import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpNotificationCenterComponent, KpNotification } from '../src/notification-center.component';
import { KpNotificationItemComponent } from '../src/notification-item.component';
import { KpAvatarComponent } from '@kanso-protocol/avatar';
import { KpButtonComponent } from '@kanso-protocol/button';

const ITEMS: KpNotification[] = [
  { id: '1', avatarInitials: 'SK', title: 'Sarah mentioned you', message: "in Project Kanso: 'Hey @greg, can you review the token migration PR?'", time: '2m ago', read: false },
  { id: '2', icon: 'circle-check', appearance: 'success', title: 'Build completed', message: 'Deployment to production successful.', time: '1h ago', read: false },
  { id: '3', icon: 'info-circle', appearance: 'info', title: 'System maintenance', message: 'Scheduled for Sunday 2 AM UTC.', time: '3h ago', read: true },
  { id: '4', icon: 'alert-circle', appearance: 'danger', title: 'Build failed', message: 'TypeScript errors in button.component.ts', time: 'yesterday', read: true },
  { id: '5', avatarInitials: 'AJ', title: 'Anna shared a document', message: 'Design tokens v0.2 — ready for review', time: '2d ago', read: true },
];

const FILTERS = [
  { id: 'all', label: 'All', count: 12 },
  { id: 'unread', label: 'Unread', count: 2 },
  { id: 'mentions', label: 'Mentions', count: 1 },
];

const meta: Meta<KpNotificationCenterComponent> = {
  title: 'Patterns/NotificationCenter',
  component: KpNotificationCenterComponent,
  decorators: [moduleMetadata({ imports: [KpNotificationItemComponent, KpAvatarComponent, KpButtonComponent] })],
  tags: ['autodocs'],
  argTypes: {
    state:       { control: 'inline-radio', options: ['with-items','empty','loading'], table: { defaultValue: { summary: 'with-items' } } },
    showFilters: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showFooter:  { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
  },
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<KpNotificationCenterComponent>;

export const Playground: Story = {
  args: { state: 'with-items', notifications: ITEMS, showFilters: false, showFooter: true },
};

export const States: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    props: { items: ITEMS },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;padding:24px">
        <kp-notification-center state="with-items" [notifications]="items"/>
        <kp-notification-center state="empty" [notifications]="[]"/>
        <kp-notification-center state="loading" [notifications]="[]"/>
      </div>
    `,
  }),
};

export const WithFilters: Story = {
  args: { state: 'with-items', notifications: ITEMS, showFilters: true, filters: FILTERS, activeFilter: 'unread' },
};
