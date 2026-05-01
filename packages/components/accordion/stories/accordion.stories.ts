import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpAccordionComponent } from '../src/accordion.component';
import { KpAccordionItemComponent } from '../src/accordion-item.component';

const meta: Meta<KpAccordionComponent> = {
  parameters: {
    a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }, { id: 'landmark-no-duplicate-contentinfo', enabled: false }] } },
  },
  title: 'Components/Accordion',
  component: KpAccordionComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpAccordionComponent, KpAccordionItemComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    mode: { control: 'inline-radio', options: ['single', 'multi'] },
    showOuterBorder: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<KpAccordionComponent>;

const cap = `font-size:11px;color: var(--kp-color-gray-600);margin-top:8px;display:block`;

export const Default: Story = {
  args: { size: 'md', mode: 'single', showOuterBorder: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="width:600px">
        <kp-accordion [size]="size" [mode]="mode" [showOuterBorder]="showOuterBorder">
          <kp-accordion-item title="What is Kanso Protocol?" [expanded]="true">
            <div kpAccordionItemContent>Kanso Protocol is an open-source Angular design system with a Figma library kept in sync via tokens.</div>
          </kp-accordion-item>
          <kp-accordion-item title="How do I install it?">
            <div kpAccordionItemContent>Install via npm: each component is its own package — start with <code>@kanso-protocol/core</code> plus the components you need.</div>
          </kp-accordion-item>
          <kp-accordion-item title="Is it free?">
            <div kpAccordionItemContent>Yes — MIT licensed. Use in commercial projects freely.</div>
          </kp-accordion-item>
        </kp-accordion>
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;width:600px">
        <div>
          <kp-accordion size="sm" [showOuterBorder]="true">
            <kp-accordion-item title="Small — What is it?" [expanded]="true"><div kpAccordionItemContent>Compact row for dense layouts.</div></kp-accordion-item>
            <kp-accordion-item title="Size=sm, chevron=14, trigger 40"><div kpAccordionItemContent>Good for sidebars and tight grids.</div></kp-accordion-item>
          </kp-accordion>
          <span style="${cap}">Small</span>
        </div>
        <div>
          <kp-accordion size="md" [showOuterBorder]="true">
            <kp-accordion-item title="Medium — default" [expanded]="true"><div kpAccordionItemContent>Balanced size for FAQs and settings.</div></kp-accordion-item>
            <kp-accordion-item title="Size=md, chevron=16, trigger 48"><div kpAccordionItemContent>Default across product.</div></kp-accordion-item>
          </kp-accordion>
          <span style="${cap}">Medium (default)</span>
        </div>
        <div>
          <kp-accordion size="lg" [showOuterBorder]="true">
            <kp-accordion-item title="Large — hero FAQ" [expanded]="true"><div kpAccordionItemContent>Roomier typography for marketing pages.</div></kp-accordion-item>
            <kp-accordion-item title="Size=lg, chevron=18, trigger 56"><div kpAccordionItemContent>Pair with large descriptions or rich content.</div></kp-accordion-item>
          </kp-accordion>
          <span style="${cap}">Large</span>
        </div>
      </div>`,
  }),
};

export const Modes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;width:600px">
        <div>
          <kp-accordion mode="single" [showOuterBorder]="true">
            <kp-accordion-item title="Item 1" [expanded]="true"><div kpAccordionItemContent>Content 1. Opening another collapses me.</div></kp-accordion-item>
            <kp-accordion-item title="Item 2"><div kpAccordionItemContent>Content 2.</div></kp-accordion-item>
            <kp-accordion-item title="Item 3"><div kpAccordionItemContent>Content 3.</div></kp-accordion-item>
          </kp-accordion>
          <span style="${cap}">Mode=single — only one open at a time</span>
        </div>
        <div>
          <kp-accordion mode="multi" [showOuterBorder]="true">
            <kp-accordion-item title="Item 1" [expanded]="true"><div kpAccordionItemContent>Content 1.</div></kp-accordion-item>
            <kp-accordion-item title="Item 2" [expanded]="true"><div kpAccordionItemContent>Content 2. Both can be open together.</div></kp-accordion-item>
            <kp-accordion-item title="Item 3"><div kpAccordionItemContent>Content 3.</div></kp-accordion-item>
          </kp-accordion>
          <span style="${cap}">Mode=multi — any number can be open</span>
        </div>
      </div>`,
  }),
};

export const WithDescription: Story = {
  name: 'With Description',
  render: () => ({
    template: `
      <div style="width:600px">
        <kp-accordion [showOuterBorder]="true">
          <kp-accordion-item title="Payment methods" [showDescription]="true" description="Manage your cards and billing preferences" [expanded]="true">
            <div kpAccordionItemContent>3 cards on file. Primary: Visa ending 4242.</div>
          </kp-accordion-item>
          <kp-accordion-item title="Notifications" [showDescription]="true" description="Email, push, SMS channels">
            <div kpAccordionItemContent>Currently sending email only. Configure channels here.</div>
          </kp-accordion-item>
        </kp-accordion>
      </div>`,
  }),
};
