import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpDialogComponent } from '../src/dialog.component';
import { KpButtonComponent } from '@kanso-protocol/button';

const meta: Meta<KpDialogComponent> = {
  title: 'Components/Dialog',
  component: KpDialogComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpDialogComponent, KpButtonComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'], table: { defaultValue: { summary: 'md' } } },
    footerLayout: { control: 'inline-radio', options: ['end', 'between', 'stacked'], table: { defaultValue: { summary: 'end' } } },
  },
};
export default meta;
type Story = StoryObj<KpDialogComponent>;

const alertTriangle = `<svg kpDialogHeroIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 3 L22 20 L2 20 Z"/><path d="M12 10 V14"/><circle cx="12" cy="17" r="0.5"/>
</svg>`;
const alertCircle = `<svg kpDialogHeroIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9"/><path d="M12 8 V13"/><circle cx="12" cy="16" r="0.5"/>
</svg>`;
const checkCircle = `<svg kpDialogHeroIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9"/><path d="M8 12 L11 15 L16 9"/>
</svg>`;
const trash = `<svg kpDialogHeroIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 7 H20"/><path d="M10 11 V17"/><path d="M14 11 V17"/><path d="M5 7 L6 20 H18 L19 7"/><path d="M9 7 V4 H15 V7"/>
</svg>`;

const openButton = (label: string, onClick = 'open = true') => `
  <kp-button (click)="${onClick}">${label}</kp-button>
`;

export const Default: Story = {
  args: { size: 'md', footerLayout: 'end' },
  render: (args) => ({
    props: { ...args, open: false },
    template: `
      <kp-button (click)="open = true">Open dialog</kp-button>
      <kp-dialog
        [(open)]="open"
        [size]="size"
        [footerLayout]="footerLayout"
        title="Dialog title"
        [showDescription]="true"
        description="Optional description text explaining the dialog purpose."
      >
        <p kpDialogBody>Dialog body content. Replace this slot with forms, lists, or any layout.</p>
        <ng-container kpDialogFooter>
          <kp-button variant="ghost" color="neutral" (click)="open = false">Cancel</kp-button>
          <kp-button (click)="open = false">Confirm</kp-button>
        </ng-container>
      </kp-dialog>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { openSize: '' as string },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <kp-button (click)="openSize = 'xs'">xs</kp-button>
        <kp-button (click)="openSize = 'sm'">sm</kp-button>
        <kp-button (click)="openSize = 'md'">md (default)</kp-button>
        <kp-button (click)="openSize = 'lg'">lg</kp-button>
        <kp-button (click)="openSize = 'xl'">xl</kp-button>
      </div>
      <kp-dialog
        [open]="openSize !== ''"
        [size]="openSize || 'md'"
        [title]="'Dialog at ' + (openSize || 'md')"
        [showDescription]="true"
        description="Dialog width scales with size variant."
        (openChange)="openSize = ''"
      >
        <p kpDialogBody>Body content. The panel width changes per size: xs=320, sm=400, md=560, lg=720, xl=960.</p>
        <ng-container kpDialogFooter>
          <kp-button variant="ghost" color="neutral" (click)="openSize = ''">Cancel</kp-button>
          <kp-button (click)="openSize = ''">Confirm</kp-button>
        </ng-container>
      </kp-dialog>`,
  }),
};

export const Composition: Story = {
  render: () => ({
    props: { openKey: '' as string },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <kp-button (click)="openKey = 'header'">Header only</kp-button>
        <kp-button (click)="openKey = 'hb'">Header + Body</kp-button>
        <kp-button (click)="openKey = 'bf'">Body + Footer</kp-button>
        <kp-button (click)="openKey = 'full'">Full (with dividers)</kp-button>
      </div>

      <kp-dialog [open]="openKey === 'header'" size="md" title="Header only dialog" [showClose]="false" [showFooter]="false" (openChange)="openKey = ''">
        <p kpDialogBody>No footer. No close button. Header-only pattern — use for one-liner announcements.</p>
      </kp-dialog>

      <kp-dialog [open]="openKey === 'hb'" size="md" title="Confirmation" [showDescription]="true" description="This is what the body contains." [showFooter]="false" (openChange)="openKey = ''">
        <p kpDialogBody>Extra body copy beneath the description.</p>
      </kp-dialog>

      <kp-dialog [open]="openKey === 'bf'" size="md" [showHeader]="false" ariaLabel="Confirm action" (openChange)="openKey = ''">
        <p kpDialogBody>Are you sure you want to proceed? This action will affect multiple items.</p>
        <ng-container kpDialogFooter>
          <kp-button variant="ghost" color="neutral" (click)="openKey = ''">Cancel</kp-button>
          <kp-button (click)="openKey = ''">Proceed</kp-button>
        </ng-container>
      </kp-dialog>

      <kp-dialog [open]="openKey === 'full'" size="md" title="Full dialog" [showDescription]="true" description="Header, body and footer with dividers." [showHeaderDivider]="true" [showFooterDivider]="true" (openChange)="openKey = ''">
        <p kpDialogBody>Dividers separate header/body/footer for data-heavy dialogs where visual grouping matters.</p>
        <ng-container kpDialogFooter>
          <kp-button variant="ghost" color="neutral" (click)="openKey = ''">Cancel</kp-button>
          <kp-button (click)="openKey = ''">Confirm</kp-button>
        </ng-container>
      </kp-dialog>`,
  }),
};

export const FooterLayouts: Story = {
  name: 'Footer Layouts',
  render: () => ({
    props: { openLayout: '' as string },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <kp-button (click)="openLayout = 'end'">End-aligned</kp-button>
        <kp-button (click)="openLayout = 'between'">Space-between</kp-button>
        <kp-button (click)="openLayout = 'stacked'">Stacked</kp-button>
      </div>

      <kp-dialog [open]="openLayout === 'end'" size="md" footerLayout="end" title="Update available" [showDescription]="true" description="Version 2.3 is ready to install." (openChange)="openLayout = ''">
        <p kpDialogBody>Install now or later — we'll remind you in a day.</p>
        <ng-container kpDialogFooter>
          <kp-button variant="ghost" color="neutral" (click)="openLayout = ''">Cancel</kp-button>
          <kp-button (click)="openLayout = ''">Install</kp-button>
        </ng-container>
      </kp-dialog>

      <kp-dialog [open]="openLayout === 'between'" size="md" footerLayout="between" title="Update available" [showDescription]="true" description="Version 2.3 is ready to install." (openChange)="openLayout = ''">
        <p kpDialogBody>Install now or later — we'll remind you in a day.</p>
        <ng-container kpDialogFooter>
          <kp-button variant="ghost" color="neutral" (click)="openLayout = ''">Learn more</kp-button>
          <div style="display:inline-flex;gap:12px">
            <kp-button variant="ghost" color="neutral" (click)="openLayout = ''">Cancel</kp-button>
            <kp-button (click)="openLayout = ''">Install</kp-button>
          </div>
        </ng-container>
      </kp-dialog>

      <kp-dialog [open]="openLayout === 'stacked'" size="sm" footerLayout="stacked" title="Update available" [showDescription]="true" description="Version 2.3 is ready to install." (openChange)="openLayout = ''">
        <p kpDialogBody>On narrow surfaces, stacked buttons improve thumb-reach on mobile.</p>
        <ng-container kpDialogFooter>
          <kp-button (click)="openLayout = ''">Install</kp-button>
          <kp-button variant="ghost" color="neutral" (click)="openLayout = ''">Cancel</kp-button>
        </ng-container>
      </kp-dialog>`,
  }),
};

export const HeroIcon: Story = {
  name: 'Hero Icon',
  render: () => ({
    props: { openKey: '' as string, alertTriangle, alertCircle, checkCircle },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <kp-button color="warning" (click)="openKey = 'warn'">Warning</kp-button>
        <kp-button color="danger"  (click)="openKey = 'destroy'">Destructive</kp-button>
        <kp-button color="success" (click)="openKey = 'done'">Success</kp-button>
      </div>

      <kp-dialog [open]="openKey === 'warn'" size="sm" [showHeroIcon]="true" title="Unsaved changes" [showDescription]="true" description="Your changes will be lost if you leave now." (openChange)="openKey = ''">
        <span style="color:#D97706;display:contents" [innerHTML]="alertTriangle"></span>
        <span kpDialogBody>You have pending edits in 3 fields. Leave now and they'll be discarded.</span>
        <ng-container kpDialogFooter>
          <kp-button variant="ghost" color="neutral" (click)="openKey = ''">Cancel</kp-button>
          <kp-button color="warning" (click)="openKey = ''">Leave anyway</kp-button>
        </ng-container>
      </kp-dialog>

      <kp-dialog [open]="openKey === 'destroy'" size="sm" [showHeroIcon]="true" title="Delete account?" [showDescription]="true" description="This action cannot be undone. All your data will be permanently deleted." (openChange)="openKey = ''">
        <span style="color:#DC2626;display:contents" [innerHTML]="alertCircle"></span>
        <span kpDialogBody>Deleting is irreversible and will sign you out of every device.</span>
        <ng-container kpDialogFooter>
          <kp-button variant="ghost" color="neutral" (click)="openKey = ''">Cancel</kp-button>
          <kp-button color="danger" (click)="openKey = ''">Delete</kp-button>
        </ng-container>
      </kp-dialog>

      <kp-dialog [open]="openKey === 'done'" size="sm" [showHeroIcon]="true" title="Successfully published" [showDescription]="true" description="Your post is now live and visible to everyone." (openChange)="openKey = ''">
        <span style="color:#059669;display:contents" [innerHTML]="checkCircle"></span>
        <span kpDialogBody>Share the link with your audience or continue editing.</span>
        <ng-container kpDialogFooter>
          <kp-button variant="ghost" color="neutral" (click)="openKey = ''">Share</kp-button>
          <kp-button (click)="openKey = ''">View post</kp-button>
        </ng-container>
      </kp-dialog>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    props: { openKey: '' as string, trash },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <kp-button color="danger" (click)="openKey = 'repo'">Confirm destructive</kp-button>
        <kp-button (click)="openKey = 'invite'">Form dialog</kp-button>
        <kp-button variant="ghost" color="neutral" (click)="openKey = 'info'">Info dialog</kp-button>
      </div>

      <kp-dialog [open]="openKey === 'repo'" size="sm" [showHeroIcon]="true" title="Delete repository?" [showDescription]="true" description="This will permanently delete kanso-protocol and all its contents. 247 files and 18 contributors will be affected." (openChange)="openKey = ''">
        <span style="color:#DC2626;display:contents" [innerHTML]="trash"></span>
        <span kpDialogBody>Type the repository name below to confirm — this cannot be undone.</span>
        <ng-container kpDialogFooter>
          <kp-button variant="ghost" color="neutral" (click)="openKey = ''">Cancel</kp-button>
          <kp-button color="danger" (click)="openKey = ''">Delete forever</kp-button>
        </ng-container>
      </kp-dialog>

      <kp-dialog [open]="openKey === 'invite'" size="md" [showDescription]="true" [showHeaderDivider]="true" [showFooterDivider]="true" footerLayout="between" title="Invite team members" description="Enter email addresses separated by commas." (openChange)="openKey = ''">
        <div kpDialogBody style="display:flex;flex-direction:column;gap:8px">
          <label style="font-size:14px;color:#3F3F46;font-weight:500">Emails</label>
          <textarea rows="4" placeholder="user@example.com, another@example.com" style="padding:10px 12px;border:1px solid #D4D4D8;border-radius:8px;font-family:Onest,system-ui;font-size:14px;resize:vertical"></textarea>
          <p style="font-size:12px;color:#71717A;margin:0">Members will receive an invite email with a link to join.</p>
        </div>
        <ng-container kpDialogFooter>
          <kp-button variant="ghost" color="neutral" (click)="openKey = ''">Send template link</kp-button>
          <div style="display:inline-flex;gap:12px">
            <kp-button variant="ghost" color="neutral" (click)="openKey = ''">Cancel</kp-button>
            <kp-button (click)="openKey = ''">Send invites</kp-button>
          </div>
        </ng-container>
      </kp-dialog>

      <kp-dialog [open]="openKey === 'info'" size="lg" title="What's new in v2.0" (openChange)="openKey = ''">
        <div kpDialogBody style="display:flex;flex-direction:column;gap:16px;padding-top:8px;padding-bottom:8px">
          <div style="padding:14px 16px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px">
            <strong style="display:block;font-size:14px;color:#1E40AF">✨ New features</strong>
            <span style="font-size:13px;color:#1E3A8A">Breadcrumbs, Pagination, Stepper, Dialog, and Segmented Control.</span>
          </div>
          <div style="padding:14px 16px;background:#ECFDF5;border:1px solid #BBF7D0;border-radius:10px">
            <strong style="display:block;font-size:14px;color:#065F46">🎨 Redesign</strong>
            <span style="font-size:13px;color:#064E3B">Tighter spacing, refreshed color tokens, new text ramp.</span>
          </div>
          <div style="padding:14px 16px;background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px">
            <strong style="display:block;font-size:14px;color:#92400E">⚡ Performance</strong>
            <span style="font-size:13px;color:#78350F">30% faster initial render, less JS shipped per route.</span>
          </div>
        </div>
        <ng-container kpDialogFooter>
          <kp-button (click)="openKey = ''">Got it</kp-button>
        </ng-container>
      </kp-dialog>`,
  }),
};
