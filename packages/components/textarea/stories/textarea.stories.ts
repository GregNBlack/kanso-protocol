import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { KpTextareaComponent } from '../src/textarea.component';
import { KpFormFieldComponent } from '@kanso-protocol/form-field';

// Wrapper: vertical stack with generous row spacing so when the user drags the
// native resize handle, the textarea grows into free space instead of overlapping
// neighboring cells. `overflow: visible` keeps the docs canvas from clipping.
const STACK = 'display:flex;flex-direction:column;align-items:flex-start;gap:32px;overflow:visible;padding:8px 0';
const ITEM = 'display:flex;flex-direction:column;align-items:flex-start;gap:8px';
const CAPTION = 'font-size:11px;color:#A1A1AA';

const meta: Meta<KpTextareaComponent> = {
  title: 'Components/Textarea',
  component: KpTextareaComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [FormsModule, KpFormFieldComponent] }),
  ],
  argTypes: {
    size: { control: 'select', options: ['sm','md','lg'] },
    resize: { control: 'select', options: ['both','vertical','horizontal','none'] },
    maxLength: { control: 'number' },
    showCounter: { control: 'boolean' },
    filled: { control: 'boolean' },
    disabled: { control: 'boolean' },
    forceState: { control: 'select', options: [null,'rest','hover','active','focus','disabled','error'] },
  },
};
export default meta;
type Story = StoryObj<KpTextareaComponent>;

export const Default: Story = {
  args: {
    size: 'md',
    placeholder: 'Write your message here. Multi-line text is supported — it grows as you type if you keep resize enabled.',
    maxLength: 500,
    showCounter: false,
    resize: 'vertical',
  },
  render: (args) => ({
    props: args,
    template: `<kp-textarea [size]="size" [placeholder]="placeholder" [maxLength]="maxLength" [showCounter]="showCounter" [resize]="resize" [disabled]="disabled" [filled]="filled" [forceState]="forceState"></kp-textarea>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="${STACK}">
        <div style="${ITEM}">
          <kp-textarea size="sm" placeholder="Small textarea" [maxLength]="500" [showCounter]="true"></kp-textarea>
          <span style="${CAPTION}">sm / min 72px</span>
        </div>
        <div style="${ITEM}">
          <kp-textarea size="md" placeholder="Medium textarea" [maxLength]="500" [showCounter]="true"></kp-textarea>
          <span style="${CAPTION}">md / min 88px</span>
        </div>
        <div style="${ITEM}">
          <kp-textarea size="lg" placeholder="Large textarea" [maxLength]="500" [showCounter]="true"></kp-textarea>
          <span style="${CAPTION}">lg / min 108px</span>
        </div>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="${STACK}">
        <div style="${ITEM}"><kp-textarea placeholder="Rest" forceState="rest"></kp-textarea><span style="${CAPTION}">rest</span></div>
        <div style="${ITEM}"><kp-textarea placeholder="Hover" forceState="hover"></kp-textarea><span style="${CAPTION}">hover</span></div>
        <div style="${ITEM}"><kp-textarea placeholder="Focus" forceState="focus"></kp-textarea><span style="${CAPTION}">focus</span></div>
        <div style="${ITEM}"><kp-textarea placeholder="Disabled" forceState="disabled"></kp-textarea><span style="${CAPTION}">disabled</span></div>
        <div style="${ITEM}"><kp-textarea placeholder="Error" forceState="error"></kp-textarea><span style="${CAPTION}">error</span></div>
      </div>`,
  }),
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="${STACK}">
        <div style="${ITEM}"><kp-textarea placeholder="Default variant"></kp-textarea><span style="${CAPTION}">Default</span></div>
        <div style="${ITEM}"><kp-textarea placeholder="Filled variant" [filled]="true"></kp-textarea><span style="${CAPTION}">Filled</span></div>
      </div>`,
  }),
};

export const Features: Story = {
  render: () => ({
    template: `
      <div style="${STACK}">
        <div style="${ITEM}">
          <kp-textarea placeholder="Plain" resize="none"></kp-textarea>
          <span style="${CAPTION}">Plain</span>
        </div>
        <div style="${ITEM}">
          <kp-textarea placeholder="Resizable"></kp-textarea>
          <span style="${CAPTION}">Resizable</span>
        </div>
        <div style="${ITEM}">
          <kp-textarea placeholder="With counter" [maxLength]="500" [showCounter]="true" resize="none"></kp-textarea>
          <span style="${CAPTION}">With counter</span>
        </div>
        <div style="${ITEM}">
          <kp-textarea placeholder="Full features" [maxLength]="500" [showCounter]="true"></kp-textarea>
          <span style="${CAPTION}">Full features</span>
        </div>
      </div>`,
  }),
};

export const WithValue: Story = {
  name: 'With Value',
  render: () => ({
    props: {
      v1: "Designing at the intersection of architecture and restraint. Kanso Protocol is an exercise in removing what isn't essential — every token, every variant, every rule exists because it had to.",
      v2: "A lot of text here that's getting close to the 500 character limit set on this field by the product team for reasons that may or may not be clear at this point but it is definitely approaching the threshold pretty quickly now as I keep writing and writing and writing.",
      v3: "Longer comment with more space. Large size gives room to breathe — use it when the content matters and the form has room for it.",
    },
    template: `
      <div style="${STACK}">
        <div style="${ITEM}">
          <kp-textarea [(ngModel)]="v1" [maxLength]="500" [showCounter]="true"></kp-textarea>
          <span style="${CAPTION}">Filled (value + counter)</span>
        </div>
        <div style="${ITEM}">
          <kp-textarea [(ngModel)]="v2" [maxLength]="500" [showCounter]="true"></kp-textarea>
          <span style="${CAPTION}">Typing in progress</span>
        </div>
        <div style="${ITEM}">
          <kp-textarea size="lg" [(ngModel)]="v3" [maxLength]="500" [showCounter]="true"></kp-textarea>
          <span style="${CAPTION}">lg with value + counter</span>
        </div>
      </div>`,
  }),
};

export const InFormField: Story = {
  name: 'In FormField',
  render: () => ({
    template: `
      <div style="${STACK}">
        <kp-form-field label="Bio" helper="Tell us about yourself" style="width:320px">
          <kp-textarea placeholder="Say a little about yourself..."></kp-textarea>
        </kp-form-field>
        <kp-form-field label="Comment" required="required-asterisk" helper="Max 500 characters" style="width:320px">
          <kp-textarea placeholder="Share your thoughts" [maxLength]="500" [showCounter]="true"></kp-textarea>
        </kp-form-field>
      </div>`,
  }),
};
