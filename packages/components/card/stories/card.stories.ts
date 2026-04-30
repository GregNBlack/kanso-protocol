import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpCardComponent } from '../src/card.component';

const meta: Meta<KpCardComponent> = {
  parameters: {
    a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }, { id: 'landmark-no-duplicate-contentinfo', enabled: false }] } },
  },
  title: 'Components/Card',
  component: KpCardComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpCardComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    appearance: { control: 'inline-radio', options: ['default', 'muted', 'elevated', 'outline'] },
  },
};
export default meta;
type Story = StoryObj<KpCardComponent>;

const cap = `font-size:11px;color:#A1A1AA;margin-top:8px;display:block`;

export const Default: Story = {
  args: { size: 'md', appearance: 'default', title: 'Card title', description: 'Optional description', showDescription: true },
  render: (args) => ({
    props: args,
    template: `<kp-card [size]="size" [appearance]="appearance" [title]="title" [description]="description" [showDescription]="showDescription">Card body content. Replace with any layout.</kp-card>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start">
        <div><kp-card size="sm" title="Small card" [showDescription]="true" description="Compact 280px wide.">Body content.</kp-card><div style="${cap}">Small (280)</div></div>
        <div><kp-card size="md" title="Medium card" [showDescription]="true" description="Default 360px wide.">Body content.</kp-card><div style="${cap}">Medium (360)</div></div>
        <div><kp-card size="lg" title="Large card" [showDescription]="true" description="Roomier 480px wide.">Body content.</kp-card><div style="${cap}">Large (480)</div></div>
      </div>`,
  }),
};

export const Appearances: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;background:#F4F4F5;padding:32px;border-radius:12px">
        <kp-card appearance="default"  title="Default"  [showDescription]="true" description="White bg, gray border.">Body</kp-card>
        <kp-card appearance="muted"    title="Muted"    [showDescription]="true" description="Gray bg, gray border.">Body</kp-card>
        <kp-card appearance="elevated" title="Elevated" [showDescription]="true" description="Shadow, no border.">Body</kp-card>
        <kp-card appearance="outline"  title="Outline"  [showDescription]="true" description="Transparent bg, just border.">Body</kp-card>
      </div>`,
  }),
};

export const Composition: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start">
        <div>
          <kp-card title="Header only" [showDescription]="true" description="No body content."></kp-card>
          <div style="${cap}">Header only</div>
        </div>
        <div>
          <kp-card title="Header + Body" [showDescription]="true" description="Body sits under the header.">Body content here.</kp-card>
          <div style="${cap}">Header + Body</div>
        </div>
        <div>
          <kp-card [showHeader]="false" [showFooter]="true">
            Body content with no header.
            <div kpCardFooter><button style="all:unset;background:#2563EB;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer">Action</button></div>
          </kp-card>
          <div style="${cap}">Body + Footer</div>
        </div>
        <div>
          <kp-card title="Full" [showDescription]="true" description="With dividers." [showHeaderDivider]="true" [showFooterDivider]="true" [showFooter]="true">
            Body content separated by dividers.
            <div kpCardFooter><button style="all:unset;background:#2563EB;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer">Save</button></div>
          </kp-card>
          <div style="${cap}">Full (with dividers)</div>
        </div>
      </div>`,
  }),
};

export const Clickable: Story = {
  render: () => ({
    props: { clicks: 0 },
    template: `
      <kp-card [clickable]="true" title="Clickable card" [showDescription]="true" description="Hover for state, click to fire (clicks: {{clicks}}).." (cardClick)="clicks = clicks + 1">
        Tap or click anywhere on the card.
      </kp-card>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start">
        <div>
          <kp-card size="sm" [showHeader]="false">
            <div style="display:flex;flex-direction:column;gap:6px">
              <span style="font-size:14px;color:#52525B">Total revenue</span>
              <span style="font-size:24px;font-weight:600;color:#18181B">$12,482</span>
              <span style="font-size:12px;color:#15803D">↑ +12.5% from last month</span>
            </div>
          </kp-card>
          <div style="${cap}">Stats card</div>
        </div>
        <div>
          <kp-card title="Sarah Chen" [showDescription]="true" description="Product Designer at Anthropic" [showHeaderAction]="true">
            <button kpCardHeaderAction style="all:unset;background:#2563EB;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px">Follow</button>
            Building Claude, exploring the intersection of design and AI.
          </kp-card>
          <div style="${cap}">User profile with header action</div>
        </div>
        <div>
          <kp-card size="lg" title="Notifications" [showDescription]="true" description="Manage how you receive updates." [showHeaderDivider]="true" [showFooter]="true" [showFooterDivider]="true">
            <div style="display:flex;flex-direction:column;gap:12px;padding:16px 0">
              <label style="display:flex;justify-content:space-between"><span>Email notifications</span><span>◉</span></label>
              <label style="display:flex;justify-content:space-between"><span>Push notifications</span><span>◉</span></label>
              <label style="display:flex;justify-content:space-between"><span>SMS notifications</span><span>◯</span></label>
            </div>
            <div kpCardFooter>
              <button style="all:unset;color:#52525B;padding:6px 12px;cursor:pointer">Cancel</button>
              <button style="all:unset;background:#2563EB;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer">Save</button>
            </div>
          </kp-card>
          <div style="${cap}">Settings card</div>
        </div>
      </div>`,
  }),
};
