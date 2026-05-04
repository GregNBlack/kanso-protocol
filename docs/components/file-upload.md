# FileUpload

> Drag-and-drop dropzone with click-to-browse and a managed file list. Constraints by mime / extension, byte size, and total count. The component owns the file list; the consumer drives the upload loop and reports back via `setProgress` / `setStatus`.

## Contract

`<kp-file-upload>` is two stacked regions:

```
<kp-file-upload>
  ├─ .kp-file-upload__zone     (dropzone + click target — role="button")
  │   ├─ .kp-file-upload__icon (upload glyph)
  │   └─ .kp-file-upload__label
  │       ├─ .kp-file-upload__title
  │       └─ .kp-file-upload__hint
  └─ .kp-file-upload__list     (selected files, only when files.length > 0)
      └─ .kp-file-upload__item × N
          ├─ .kp-file-upload__item-icon
          ├─ .kp-file-upload__item-meta (name + size/progress/error/success)
          │   └─ .kp-file-upload__bar    (only while uploading)
          └─ .kp-file-upload__item-remove (X button)
```

The zone accepts both **drop** events (HTML5 drag-and-drop) and **click** (delegates to a hidden `<input type="file">`). Keyboard activation is `Enter` / `Space` on the focused zone — same as a native button.

Each accepted file becomes a `KpUploadFile` row in `files` with `id`, `file`, `status`, and `progress`. The component does not perform the upload — when `(filesAdded)` fires, the consumer is expected to call `setProgress(id, n)` and `setStatus(id, 'success' | 'error', message?)` on the component instance.

### Sizes

| Size | Zone vertical padding |
|------|-----------------------|
| sm   | 20                    |
| md   | 32                    |
| lg   | 48                    |

`appearance="compact"` switches the zone to a single-row layout (icon + label inline) for use inside dialogs and form sections.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Zone padding scale |
| `appearance` | `'default' \| 'compact'` | `'default'` | `compact` is a single-row strip |
| `multiple` | `boolean` | `false` | Allow more than one file |
| `accept` | `string \| null` | `null` | MIME / extension filter (e.g. `'image/*,.pdf'`) |
| `maxSize` | `number \| null` | `null` | Max bytes per file |
| `maxFiles` | `number \| null` | `null` | Max total file count |
| `disabled` | `boolean` | `false` | Disable input + drop |
| `title` | `string` | `'Drop files here or click to browse'` | Headline copy in the zone |
| `hint` | `string \| null` | `null` | Secondary copy under the headline |
| `ariaLabel` | `string \| null` | `'File upload'` | Zone aria-label |

### Outputs

| Name | Payload | Fires when |
|------|---------|-----------|
| `(filesAdded)` | `KpUploadFile[]` | After validation — only for accepted files |
| `(filesRejected)` | `KpFileRejection[]` | When one or more files violate `accept` / `maxSize` / `maxFiles` |
| `(fileRemoved)` | `KpUploadFile` | When the user clicks the row's X button |

### Imperative methods

| Method | Purpose |
|--------|---------|
| `setProgress(id, n)` | Update a row's progress (0..100). Flips `idle → uploading` automatically. |
| `setStatus(id, status, error?)` | Set `'idle' \| 'uploading' \| 'success' \| 'error'`. `success` forces progress to 100. |
| `remove(id)` | Programmatically remove a row (also fires `(fileRemoved)`). |

### Types

```ts
type KpFileUploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type KpFileRejectReason = 'type' | 'size' | 'count';

interface KpUploadFile {
  id: string;
  file: File;
  status: KpFileUploadStatus;
  progress: number;       // 0..100
  error?: string | null;
}

interface KpFileRejection {
  file: File;
  reason: KpFileRejectReason;
  message: string;        // human-readable
}
```

## Example

```ts
@Component({
  template: `
    <kp-file-upload #u
      [multiple]="true"
      accept="image/*,.pdf"
      [maxSize]="5 * 1024 * 1024"
      [maxFiles]="10"
      hint="Images or PDF · max 5 MB · up to 10 files"
      (filesAdded)="upload(u, $event)"
      (filesRejected)="warn($event)"
    />
  `,
})
class Demo {
  upload(u: KpFileUploadComponent, files: KpUploadFile[]) {
    for (const f of files) {
      // Real-life: post FormData, listen to progress events.
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) =>
        u.setProgress(f.id, (e.loaded / e.total) * 100);
      xhr.onload = () => u.setStatus(f.id, 'success');
      xhr.onerror = () => u.setStatus(f.id, 'error', 'Upload failed');
      xhr.open('POST', '/api/upload');
      const fd = new FormData();
      fd.append('file', f.file);
      xhr.send(fd);
    }
  }
  warn(rejections: KpFileRejection[]) {
    for (const r of rejections) console.warn(r.message, r.file);
  }
}
```

## Do / Don't

### Do
- Surface `(filesRejected)` to the user — silent rejection feels broken. Toast or inline-list works.
- Always set `accept` when you have a real constraint. `accept="image/*"` activates the OS-level filter in the file picker.
- Pair `multiple={false}` with replace semantics — a second drop overwrites the first; consumers usually don't want a "you already picked one" warning.
- Use `appearance="compact"` inside Dialog and FormField — the default size eats too much vertical space.

### Don't
- Don't trust `accept` for security. The OS picker filters the client-side dialog, not the data; always re-validate server-side.
- Don't call `setStatus` and then mutate the row externally — the component owns the rendered shape; treat it as opaque.
- Don't rely on file order — drag drops on most browsers don't guarantee order.

## References

- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-fileupload--docs
- **Source**: `packages/components/file-upload/src/`
- **Tokens used**:
  - Zone bg / border: `gray.50`, `gray.300` (rest), `accent.primary.fg`, `blue.50` (dragover)
  - Item border / status: `gray.200` (idle), `red.300`/`red.50` (error), `green.300` (success)
  - Progress bar fill: `accent.primary.fg`

## Changelog

- `0.1.0` — Initial release. Drag-and-drop + click-to-browse, accept/maxSize/maxFiles validation, managed file list with imperative `setProgress` / `setStatus`, a11y zone (role=button, keyboard) and per-row progressbar.
