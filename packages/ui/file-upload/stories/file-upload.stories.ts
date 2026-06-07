import { Meta, StoryObj } from '@storybook/angular';
import { KpFileUploadComponent } from '../src/file-upload.component';

const meta: Meta<KpFileUploadComponent> = {
  title: 'Components/FileUpload',
  component: KpFileUploadComponent,
  tags: ['autodocs'],
  argTypes: {
    size:       { control: 'inline-radio', options: ['sm', 'md', 'lg'], table: { defaultValue: { summary: 'md' } } },
    appearance: { control: 'inline-radio', options: ['default', 'compact'], table: { defaultValue: { summary: 'default' } } },
    multiple:   { control: 'boolean' },
    accept:     { control: 'text' },
    maxSize:    { control: 'number' },
    maxFiles:   { control: 'number' },
    disabled:   { control: 'boolean' },
    title:      { control: 'text' },
    hint:       { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Drag-and-drop file uploader. Constraints via `[accept]` / `[maxSize]` / `[maxFiles]`. The component owns the selected-files list and lets the consumer drive progress + final status via `setProgress()` and `setStatus()`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<KpFileUploadComponent>;

export const Playground: Story = {
  args: {
    size: 'md',
    appearance: 'default',
    multiple: true,
    title: 'Drop files here or click to browse',
    hint: 'PDF, PNG, JPG up to 5 MB',
  },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;max-width:560px">
        <kp-file-upload size="sm" hint="Small dropzone"/>
        <kp-file-upload size="md" hint="Medium dropzone"/>
        <kp-file-upload size="lg" hint="Large dropzone"/>
      </div>
    `,
  }),
};

export const Compact: Story = {
  args: {
    appearance: 'compact',
    title: 'Attach a file',
    hint: 'PNG, JPG up to 2 MB',
  },
};

export const ConstrainedToImages: Story = {
  args: {
    multiple: true,
    accept: 'image/*',
    maxSize: 2 * 1024 * 1024,
    maxFiles: 5,
    hint: 'Images only · max 2 MB · up to 5 files',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    title: 'Uploads disabled',
    hint: 'Read-only context',
  },
};

export const SimulatedProgress: Story = {
  render: () => ({
    template: `
      <kp-file-upload #u
        [multiple]="true"
        title="Drop files or click to browse"
        hint="Demo: progress is simulated"
        (filesAdded)="run($any(u), $event)"
      />
    `,
    props: {
      run: (cmp: KpFileUploadComponent, files: { id: string }[]) => {
        for (const f of files) {
          let pct = 0;
          const tick = () => {
            pct += 10;
            if (pct >= 100) {
              cmp.setStatus(f.id, 'success');
              return;
            }
            cmp.setProgress(f.id, pct);
            setTimeout(tick, 250);
          };
          tick();
        }
      },
    },
  }),
};

export const RejectionExample: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:8px;max-width:560px">
        <kp-file-upload
          [multiple]="true"
          [maxSize]="500"
          accept=".pdf,.txt"
          hint="Try dropping anything > 500 B or non-PDF/TXT — see rejection log"
          (filesRejected)="log = $event"
        />
        @if (log.length) {
          <ul style="font-family:ui-monospace,monospace;font-size:12px;color:#dc2626;margin:0;padding-left:18px">
            @for (r of log; track r.file.name) {
              <li>{{ r.file.name }} — {{ r.message }}</li>
            }
          </ul>
        }
      </div>
    `,
    props: { log: [] },
  }),
};
