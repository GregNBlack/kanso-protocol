import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KpRichTextEditorComponent } from '../src/rich-text-editor.component';

const meta: Meta<KpRichTextEditorComponent> = {
  title: 'Components/RichTextEditor',
  component: KpRichTextEditorComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpRichTextEditorComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<KpRichTextEditorComponent>;

export const Playground: Story = {
  args: {
    size: 'md',
    disabled: false,
    error: false,
    placeholder: 'Write your post…',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width:880px">
        <kp-rich-text-editor
          [size]="size"
          [disabled]="disabled"
          [error]="error"
          [placeholder]="placeholder">
        </kp-rich-text-editor>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;width:880px">
        <kp-rich-text-editor size="sm" placeholder="Small editor"></kp-rich-text-editor>
        <kp-rich-text-editor size="md" placeholder="Medium editor (default)"></kp-rich-text-editor>
        <kp-rich-text-editor size="lg" placeholder="Large editor"></kp-rich-text-editor>
      </div>
    `,
  }),
};

export const Prefilled: Story = {
  args: { size: 'md' },
  render: (args) => ({
    props: args,
    template: `
      <div style="width:880px">
        <kp-rich-text-editor
          [size]="size"
          value="<h2>Welcome!</h2><p>This is a <strong>bold</strong> intro with <em>emphasis</em>, an <u>underline</u>, and a <a href='https://example.com'>link</a>. Below, a list:</p><ul><li>First item</li><li>Second item</li><li>Third item</li></ul><blockquote><p>Don't overthink the markup. Tokens decide.</p></blockquote><pre><code>const hello = 'world';</code></pre>">
        </kp-rich-text-editor>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <div style="width:880px">
        <kp-rich-text-editor
          [disabled]="true"
          value="<p>Disabled editor — you can read, but not type.</p>">
        </kp-rich-text-editor>
      </div>
    `,
  }),
};

export const Error: Story = {
  render: () => ({
    template: `
      <div style="width:880px">
        <kp-rich-text-editor
          [error]="true"
          placeholder="Something's wrong with this field"
          value="<p>Validation failed — red outline.</p>">
        </kp-rich-text-editor>
      </div>
    `,
  }),
};

/**
 * Reactive-forms demo. The <code>value</code> of the editor lives in a
 * FormControl on the host component; Storybook's controls panel shows the
 * current HTML underneath.
 */
@Component({
  selector: 'kp-rte-reactive-demo',
  standalone: true,
  imports: [KpRichTextEditorComponent, ReactiveFormsModule],
  template: `
    <div style="display:flex;flex-direction:column;gap:12px;width:880px">
      <kp-rich-text-editor [formControl]="ctrl" placeholder="Edit me…"></kp-rich-text-editor>
      <label style="font-size:12px;color: var(--kp-color-gray-500)">Current HTML:</label>
      <pre style="background: var(--kp-color-gray-100);padding:8px 12px;border-radius:8px;font-size:12px;overflow:auto;max-height:140px">{{ ctrl.value }}</pre>
    </div>
  `,
})
class ReactiveDemo {
  ctrl = new FormControl('<p>Hello from a FormControl.</p>');
}

export const WithReactiveForms: Story = {
  decorators: [moduleMetadata({ imports: [ReactiveDemo] })],
  render: () => ({
    template: `<kp-rte-reactive-demo></kp-rte-reactive-demo>`,
  }),
};
