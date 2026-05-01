import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Component, inject } from '@angular/core';
import { KpToastHostComponent, KpToastService, KpToastPosition } from '../src';
import { KpButtonComponent } from '@kanso-protocol/button';

@Component({
  selector: 'kp-toast-demo',
  standalone: true,
  imports: [KpToastHostComponent, KpButtonComponent],
  template: `
    <kp-toast-host [position]="position"/>

    <div style="display:flex;flex-direction:column;gap:16px;max-width:560px">
      <div style="font-size:13px;color: var(--kp-color-gray-600);">
        Click to emit toasts. Host corner is controlled by the <code>position</code> arg above.
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <kp-button size="sm" (click)="primary()">Primary</kp-button>
        <kp-button size="sm" color="success" (click)="success()">Success</kp-button>
        <kp-button size="sm" color="danger" (click)="danger()">Danger</kp-button>
        <kp-button size="sm" variant="outline" (click)="warning()">Warning</kp-button>
        <kp-button size="sm" variant="outline" (click)="info()">Info</kp-button>
        <kp-button size="sm" variant="ghost" color="neutral" (click)="neutral()">Neutral</kp-button>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <kp-button size="sm" variant="outline" (click)="withAction()">Toast with action (Undo)</kp-button>
        <kp-button size="sm" variant="outline" (click)="sticky()">Sticky (no auto-dismiss)</kp-button>
        <kp-button size="sm" variant="ghost" color="neutral" (click)="burst()">Burst of 5</kp-button>
        <kp-button size="sm" variant="ghost" color="danger" (click)="svc.dismissAll()">Dismiss all</kp-button>
      </div>
    </div>
  `,
})
class ToastDemo {
  readonly svc = inject(KpToastService);
  position: KpToastPosition = 'top-right';

  primary() { this.svc.primary('Primary toast', 'A short informational message.'); }
  success() { this.svc.success('Saved successfully', 'Your changes have been saved.'); }
  danger()  { this.svc.danger('Error occurred', 'Failed to save changes. Please retry.'); }
  warning() { this.svc.warning('Storage warning', "You've used 90% of your storage."); }
  info()    { this.svc.info('Maintenance scheduled', 'The site will be down Sat 2–4 AM UTC.'); }
  neutral() { this.svc.neutral('Reminder', 'Meeting in 15 minutes.'); }

  withAction() {
    this.svc.show({
      appearance: 'success',
      title: 'Task completed',
      description: 'Archived 3 items from the backlog.',
      action: { label: 'Undo', handler: (id) => this.svc.dismiss(id) },
    });
  }
  sticky() {
    this.svc.show({
      appearance: 'info',
      title: 'Update available',
      description: 'Click × to dismiss — no auto-timer here.',
      duration: 0,
    });
  }
  burst() {
    for (let i = 1; i <= 5; i++) setTimeout(() => this.svc.neutral(`Toast #${i}`, 'Part of a burst'), i * 120);
  }
}

const meta: Meta<ToastDemo> = {
  title: 'Components/Toast',
  component: ToastDemo,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [ToastDemo] }),
  ],
  argTypes: {
    position: { control: 'inline-radio', options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'] },
  },
};
export default meta;
type Story = StoryObj<ToastDemo>;

export const Playground: Story = {
  args: { position: 'top-right' },
  render: (args) => ({ props: args, template: `<kp-toast-demo [position]="position"/>` }),
};

export const TopLeft: Story = {
  name: 'Top left',
  render: () => ({ template: `<kp-toast-demo position="top-left"/>` }),
};
export const BottomRight: Story = {
  name: 'Bottom right',
  render: () => ({ template: `<kp-toast-demo position="bottom-right"/>` }),
};
export const BottomLeft: Story = {
  name: 'Bottom left',
  render: () => ({ template: `<kp-toast-demo position="bottom-left"/>` }),
};
