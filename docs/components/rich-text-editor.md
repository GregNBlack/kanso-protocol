# RichTextEditor

WYSIWYG editor with a toolbar + editable surface. Built on [TipTap](https://tiptap.dev) (headless ProseMirror). Value shape is **HTML string**.

## API

```ts
import { KpRichTextEditorComponent } from '@kanso-protocol/rich-text-editor';
```

| Prop          | Type                          | Default | Description                                                 |
|---------------|-------------------------------|---------|-------------------------------------------------------------|
| `size`        | `'sm' \| 'md' \| 'lg'`        | `'md'`  | Controls minimum editing-area height and body font size.    |
| `placeholder` | `string`                      | `''`    | Shown when the document is empty (no visible text nodes).   |
| `disabled`    | `boolean`                     | `false` | Editor becomes read-only; toolbar buttons disabled.         |
| `error`       | `boolean`                     | `false` | Red border, sets `aria-invalid="true"` on the editor surface. |

| Output         | Payload                                                             | When                                                               |
|----------------|---------------------------------------------------------------------|--------------------------------------------------------------------|
| `valueChange`  | `string` (full HTML)                                                | On every edit (user typing, format toggle, paste, etc.).          |
| `imageUpload`  | `{ file: File, resolve: (url: string \| null) => void }`            | User clicked the image button and picked a file. Host uploads it and calls `resolve(publicUrl)`; call `resolve(null)` on cancel/failure. |

Implements `ControlValueAccessor` — use `[(ngModel)]` or `[formControl]` directly.

## Toolbar

- **History** — undo, redo
- **Inline marks** — bold, italic, underline, strikethrough, inline code
- **Blocks** — H1 / H2 / H3, blockquote, code block, horizontal rule
- **Lists** — bullet, ordered
- **Alignment** — left, center, right
- **Link** — native prompt (v0.1) → upgrade to `kp-popover` + `kp-input` planned
- **Image** — file picker triggers `(imageUpload)`

Toolbar buttons reflect current selection state via `aria-pressed` and a visual `.is-active` modifier.

## Usage

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KpRichTextEditorComponent } from '@kanso-protocol/rich-text-editor';

@Component({
  standalone: true,
  imports: [KpRichTextEditorComponent, ReactiveFormsModule],
  template: `
    <kp-rich-text-editor
      [formControl]="content"
      placeholder="Write your post…"
      (imageUpload)="upload($event)" />
  `,
})
export class PostEditor {
  content = new FormControl<string>('');

  async upload({ file, resolve }: { file: File; resolve: (url: string | null) => void }) {
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: form });
      const { url } = await res.json();
      resolve(url);
    } catch {
      resolve(null);
    }
  }
}
```

## Accessibility

- Toolbar has `role="toolbar"` and an `aria-label`.
- Every button has a visible `title` + `aria-label`; toggle buttons expose state via `aria-pressed`.
- The editor surface is a focusable `contentEditable` element managed by ProseMirror — arrow keys, Home/End, selection, RTL all work out of the box.
- `aria-invalid="true"` when `[error]="true"`.
- When `[disabled]="true"`, the editor is non-editable and the toolbar buttons are disabled.

## Design rules

- Built from primitives + semantic tokens — no hardcoded colors in component styles.
- Size variants match `kp-input` (sm / md / lg).
- Do **not** extend the editor surface beyond its container — the component owns its own scroll when content overflows the `min-height`.
- For a fixed-size editor (comment box, chat composer), wrap it in a container with `height` set; for an auto-growing editor (post composer, document), leave height auto.

## Anti-patterns

- **Don't** use this for plain-text inputs — reach for `kp-textarea`.
- **Don't** roll your own toolbar on top; if you need a new control, extend the component via a `toolbarExtras` slot (planned).
- **Don't** bind to internal `editor` instance from the outside — that contract is private and may change.
