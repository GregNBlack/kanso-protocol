import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpDrawerComponent } from '../src/drawer.component';
import { KpButtonComponent } from '@kanso-protocol/button';

const meta: Meta<KpDrawerComponent> = {
  title: 'Components/Drawer',
  component: KpDrawerComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpDrawerComponent, KpButtonComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    side: { control: 'inline-radio', options: ['right', 'left', 'top', 'bottom'] },
  },
};
export default meta;
type Story = StoryObj<KpDrawerComponent>;

export const Default: Story = {
  args: { size: 'md', side: 'right', title: 'Drawer title', description: 'Optional description.', showDescription: true, showFooter: true },
  render: (args) => ({
    props: { ...args, open: false },
    template: `
      <button kpButton (click)="open = true">Open drawer</button>
      <kp-drawer [(open)]="open" [size]="size" [side]="side" [title]="title" [description]="description" [showDescription]="showDescription" [showFooter]="showFooter">
        <p kpDrawerBody>Drawer body content. Replace this slot with forms, lists, or any layout.</p>
        <ng-container kpDrawerFooter>
          <button kpButton variant="ghost" color="neutral" (click)="open = false">Cancel</button>
          <button kpButton (click)="open = false">Confirm</button>
        </ng-container>
      </kp-drawer>`,
  }),
};

export const Sides: Story = {
  render: () => ({
    props: { openSide: '' as string },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <button kpButton (click)="openSide = 'right'">Right</button>
        <button kpButton (click)="openSide = 'left'">Left</button>
        <button kpButton (click)="openSide = 'top'">Top</button>
        <button kpButton (click)="openSide = 'bottom'">Bottom</button>
      </div>
      <kp-drawer [open]="openSide !== ''" [side]="openSide || 'right'" size="md" [title]="'Drawer from ' + (openSide || 'right')" [showDescription]="true" description="Content slides in from this edge." [showFooter]="true" (openChange)="openSide = ''">
        <p kpDrawerBody>Body content. Esc or backdrop click to close.</p>
        <ng-container kpDrawerFooter>
          <button kpButton variant="ghost" color="neutral" (click)="openSide = ''">Cancel</button>
          <button kpButton (click)="openSide = ''">OK</button>
        </ng-container>
      </kp-drawer>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { openSize: '' as string },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <button kpButton (click)="openSize = 'sm'">sm</button>
        <button kpButton (click)="openSize = 'md'">md</button>
        <button kpButton (click)="openSize = 'lg'">lg</button>
        <button kpButton (click)="openSize = 'xl'">xl</button>
      </div>
      <kp-drawer [open]="openSize !== ''" side="right" [size]="openSize || 'md'" [title]="(openSize || 'md').toUpperCase() + ' drawer'" [showFooter]="true" (openChange)="openSize = ''">
        <p kpDrawerBody>Different sizes per side: right/left use width (320/480/640/800), top/bottom use height (240/400/560/720).</p>
        <ng-container kpDrawerFooter>
          <button kpButton variant="ghost" color="neutral" (click)="openSize = ''">Cancel</button>
          <button kpButton (click)="openSize = ''">OK</button>
        </ng-container>
      </kp-drawer>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    props: { openKey: '' as string },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <button kpButton (click)="openKey = 'settings'">Settings panel</button>
        <button kpButton (click)="openKey = 'filters'">Filter sidebar</button>
        <button kpButton (click)="openKey = 'share'">Bottom sheet</button>
        <button kpButton (click)="openKey = 'notif'">Top notifications</button>
      </div>

      <kp-drawer [open]="openKey === 'settings'" side="right" size="md" title="Settings" [showDescription]="true" description="Manage your preferences" [showFooter]="true" (openChange)="openKey = ''">
        <div kpDrawerBody style="display:flex;flex-direction:column;gap:16px;padding-top:8px">
          <label style="display:flex;justify-content:space-between"><span>Dark mode</span><span>◉</span></label>
          <label style="display:flex;justify-content:space-between"><span>Email notifications</span><span>◉</span></label>
          <label style="display:flex;justify-content:space-between"><span>Two-factor auth</span><span>◯</span></label>
          <label style="display:flex;justify-content:space-between"><span>Auto-save</span><span>◉</span></label>
        </div>
        <ng-container kpDrawerFooter>
          <button kpButton variant="ghost" color="neutral" (click)="openKey = ''">Cancel</button>
          <button kpButton (click)="openKey = ''">Save</button>
        </ng-container>
      </kp-drawer>

      <kp-drawer [open]="openKey === 'filters'" side="left" size="sm" title="Filters" [showFooter]="true" (openChange)="openKey = ''">
        <div kpDrawerBody style="display:flex;flex-direction:column;gap:16px">
          <div><strong style="font-size:13px">Category</strong><div style="margin-top:6px;font-size:14px;color: var(--kp-color-gray-600)">☐ Electronics<br>☐ Clothing<br>☐ Books</div></div>
          <div><strong style="font-size:13px">Price</strong><div style="margin-top:6px;font-size:14px;color: var(--kp-color-gray-600)">☐ Under $50<br>☐ $50 — $200<br>☐ Over $200</div></div>
        </div>
        <ng-container kpDrawerFooter>
          <button kpButton variant="ghost" color="neutral" (click)="openKey = ''">Clear</button>
          <button kpButton (click)="openKey = ''">Apply</button>
        </ng-container>
      </kp-drawer>

      <kp-drawer [open]="openKey === 'share'" side="bottom" size="md" title="Share" [showResizeHandle]="true" [showFooter]="false" (openChange)="openKey = ''">
        <div kpDrawerBody style="display:flex;justify-content:space-around;padding:16px 0;font-size:14px;color: var(--kp-color-gray-700)">
          <div style="text-align:center">📋<div>Copy link</div></div>
          <div style="text-align:center">✉️<div>Email</div></div>
          <div style="text-align:center">💬<div>Messages</div></div>
          <div style="text-align:center">⋯<div>More</div></div>
        </div>
      </kp-drawer>

      <kp-drawer [open]="openKey === 'notif'" side="top" size="sm" title="3 unread notifications" [showFooter]="false" (openChange)="openKey = ''">
        <div kpDrawerBody style="font-size:14px;color: var(--kp-color-gray-700)">
          • New comment on your post<br>
          • Sarah liked your message<br>
          • Your weekly digest is ready
        </div>
      </kp-drawer>`,
  }),
};
