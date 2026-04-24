import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

export type KpRichTextEditorSize = 'sm' | 'md' | 'lg';

/**
 * Kanso Protocol — Rich Text Editor
 *
 * Toolbar + editable surface built on TipTap (headless ProseMirror).
 * Value shape: HTML string. ControlValueAccessor ready, so it plugs into
 * Reactive / Template-driven forms the same way as `<kp-input>`.
 *
 * Toolbar groups:
 *   · history       — undo / redo
 *   · inline marks  — bold · italic · underline · strikethrough · code
 *   · blocks        — H1 · H2 · H3 · blockquote · code-block · horizontal rule
 *   · lists         — bullet · ordered
 *   · alignment     — left · center · right
 *   · link          — prompts for URL (future: popover with input)
 *   · image         — emits `(imageUpload)` so the host app handles storage
 *
 * @example
 *   <kp-rich-text-editor
 *     [(ngModel)]="content"
 *     placeholder="Write your post…"
 *     (imageUpload)="uploadAndResolve($event)" />
 */
@Component({
  selector: 'kp-rich-text-editor',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => KpRichTextEditorComponent), multi: true },
  ],
  host: {
    '[class]': 'hostClasses',
    '[attr.aria-disabled]': 'disabled || null',
  },
  template: `
    <div class="kp-rte__toolbar" role="toolbar" aria-label="Formatting">
      <!-- history -->
      <button type="button" class="kp-rte__btn" title="Undo" aria-label="Undo"
              [disabled]="disabled || !editor"
              (click)="run('undo')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></svg>
      </button>
      <button type="button" class="kp-rte__btn" title="Redo" aria-label="Redo"
              [disabled]="disabled || !editor"
              (click)="run('redo')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/></svg>
      </button>

      <span class="kp-rte__sep" aria-hidden="true"></span>

      <!-- inline marks -->
      <button type="button" class="kp-rte__btn" title="Bold" aria-label="Bold"
              [class.is-active]="is('bold')" [attr.aria-pressed]="is('bold')"
              [disabled]="disabled" (click)="toggle('bold')">
        <strong style="font-size:13px">B</strong>
      </button>
      <button type="button" class="kp-rte__btn" title="Italic" aria-label="Italic"
              [class.is-active]="is('italic')" [attr.aria-pressed]="is('italic')"
              [disabled]="disabled" (click)="toggle('italic')">
        <em style="font-size:13px">I</em>
      </button>
      <button type="button" class="kp-rte__btn" title="Underline" aria-label="Underline"
              [class.is-active]="is('underline')" [attr.aria-pressed]="is('underline')"
              [disabled]="disabled" (click)="toggle('underline')">
        <span style="font-size:13px;text-decoration:underline">U</span>
      </button>
      <button type="button" class="kp-rte__btn" title="Strikethrough" aria-label="Strikethrough"
              [class.is-active]="is('strike')" [attr.aria-pressed]="is('strike')"
              [disabled]="disabled" (click)="toggle('strike')">
        <span style="font-size:13px;text-decoration:line-through">S</span>
      </button>
      <button type="button" class="kp-rte__btn" title="Inline code" aria-label="Inline code"
              [class.is-active]="is('code')" [attr.aria-pressed]="is('code')"
              [disabled]="disabled" (click)="toggle('code')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </button>

      <span class="kp-rte__sep" aria-hidden="true"></span>

      <!-- blocks -->
      <button type="button" class="kp-rte__btn" title="Heading 1" aria-label="Heading 1"
              [class.is-active]="isHeading(1)" [attr.aria-pressed]="isHeading(1)"
              [disabled]="disabled" (click)="toggleHeading(1)">
        <span style="font-size:13px;font-weight:600">H1</span>
      </button>
      <button type="button" class="kp-rte__btn" title="Heading 2" aria-label="Heading 2"
              [class.is-active]="isHeading(2)" [attr.aria-pressed]="isHeading(2)"
              [disabled]="disabled" (click)="toggleHeading(2)">
        <span style="font-size:13px;font-weight:600">H2</span>
      </button>
      <button type="button" class="kp-rte__btn" title="Heading 3" aria-label="Heading 3"
              [class.is-active]="isHeading(3)" [attr.aria-pressed]="isHeading(3)"
              [disabled]="disabled" (click)="toggleHeading(3)">
        <span style="font-size:13px;font-weight:600">H3</span>
      </button>
      <button type="button" class="kp-rte__btn" title="Blockquote" aria-label="Blockquote"
              [class.is-active]="is('blockquote')" [attr.aria-pressed]="is('blockquote')"
              [disabled]="disabled" (click)="toggle('blockquote')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21c3 0 7-1 7-8V5c0-1-1-2-2-2H4c-1 0-2 1-2 2v6c0 1 1 2 2 2h3"/><path d="M14 21c3 0 7-1 7-8V5c0-1-1-2-2-2h-4c-1 0-2 1-2 2v6c0 1 1 2 2 2h3"/></svg>
      </button>
      <button type="button" class="kp-rte__btn" title="Code block" aria-label="Code block"
              [class.is-active]="is('codeBlock')" [attr.aria-pressed]="is('codeBlock')"
              [disabled]="disabled" (click)="toggle('codeBlock')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m9 10-2 2 2 2"/><path d="m15 10 2 2-2 2"/></svg>
      </button>
      <button type="button" class="kp-rte__btn" title="Horizontal rule" aria-label="Horizontal rule"
              [disabled]="disabled" (click)="run('setHorizontalRule')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>
      </button>

      <span class="kp-rte__sep" aria-hidden="true"></span>

      <!-- lists -->
      <button type="button" class="kp-rte__btn" title="Bullet list" aria-label="Bullet list"
              [class.is-active]="is('bulletList')" [attr.aria-pressed]="is('bulletList')"
              [disabled]="disabled" (click)="toggle('bulletList')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="9" x2="21" y1="6" y2="6"/><line x1="9" x2="21" y1="12" y2="12"/><line x1="9" x2="21" y1="18" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>
      </button>
      <button type="button" class="kp-rte__btn" title="Ordered list" aria-label="Ordered list"
              [class.is-active]="is('orderedList')" [attr.aria-pressed]="is('orderedList')"
              [disabled]="disabled" (click)="toggle('orderedList')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
      </button>

      <span class="kp-rte__sep" aria-hidden="true"></span>

      <!-- alignment -->
      <button type="button" class="kp-rte__btn" title="Align left" aria-label="Align left"
              [class.is-active]="alignIs('left')" [attr.aria-pressed]="alignIs('left')"
              [disabled]="disabled" (click)="setAlign('left')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="15" y1="12" y2="12"/><line x1="3" x2="17" y1="18" y2="18"/></svg>
      </button>
      <button type="button" class="kp-rte__btn" title="Align center" aria-label="Align center"
              [class.is-active]="alignIs('center')" [attr.aria-pressed]="alignIs('center')"
              [disabled]="disabled" (click)="setAlign('center')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" x2="21" y1="6" y2="6"/><line x1="6" x2="18" y1="12" y2="12"/><line x1="5" x2="19" y1="18" y2="18"/></svg>
      </button>
      <button type="button" class="kp-rte__btn" title="Align right" aria-label="Align right"
              [class.is-active]="alignIs('right')" [attr.aria-pressed]="alignIs('right')"
              [disabled]="disabled" (click)="setAlign('right')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" x2="21" y1="6" y2="6"/><line x1="9" x2="21" y1="12" y2="12"/><line x1="7" x2="21" y1="18" y2="18"/></svg>
      </button>

      <span class="kp-rte__sep" aria-hidden="true"></span>

      <!-- link + image -->
      <button type="button" class="kp-rte__btn" title="Link" aria-label="Link"
              [class.is-active]="is('link')" [attr.aria-pressed]="is('link')"
              [disabled]="disabled" (click)="promptLink()">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71"/></svg>
      </button>
      <button type="button" class="kp-rte__btn" title="Insert image" aria-label="Insert image"
              [disabled]="disabled" (click)="fileInput.click()">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      </button>
      <input #fileInput type="file" accept="image/*" hidden (change)="onFileChosen($event)" />
    </div>

    <div #editorHost class="kp-rte__editor" [attr.aria-invalid]="error || null"></div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
      border: 1px solid var(--kp-color-input-border, var(--kp-color-gray-300));
      background: var(--kp-color-input-bg, var(--kp-color-white));
      color: var(--kp-color-input-fg, var(--kp-color-gray-900));
      border-radius: 12px;
      overflow: hidden;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }
    :host(:focus-within) {
      border-color: var(--kp-color-input-border-focus, var(--kp-color-blue-600));
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--kp-color-blue-600) 15%, transparent);
    }
    :host(.kp-rte--error) { border-color: var(--kp-color-red-500); }
    :host(.kp-rte--disabled) {
      background: var(--kp-color-gray-50);
      color: var(--kp-color-gray-500);
      cursor: not-allowed;
    }

    .kp-rte__toolbar {
      display: flex;
      flex-wrap: nowrap;
      gap: 1px;
      padding: 4px 6px;
      border-bottom: 1px solid var(--kp-color-gray-200);
      background: var(--kp-color-gray-50);
    }
    .kp-rte__sep {
      display: inline-block;
      width: 1px;
      background: var(--kp-color-gray-200);
      margin: 4px 3px;
      flex-shrink: 0;
    }
    .kp-rte__btn {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      min-width: 24px;
      height: 24px;
      padding: 0 4px;
      border-radius: 6px;
      color: var(--kp-color-gray-700);
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .kp-rte__btn:hover:not([disabled]) {
      background: var(--kp-color-gray-100);
      color: var(--kp-color-gray-900);
    }
    .kp-rte__btn:focus-visible {
      outline: 2px solid var(--kp-color-blue-400);
      outline-offset: -2px;
    }
    .kp-rte__btn.is-active {
      background: var(--kp-color-blue-50);
      color: var(--kp-color-blue-700);
    }
    .kp-rte__btn[disabled] {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }

    .kp-rte__editor {
      padding: 12px 16px;
      min-height: var(--kp-rte-min-h, 160px);
      overflow: auto;
    }
    /* Size variants — control minimum editing area height. */
    :host(.kp-rte--sm) { --kp-rte-min-h: 96px; }
    :host(.kp-rte--sm) .kp-rte__editor { padding: 8px 12px; font-size: 13px; }
    :host(.kp-rte--md) { --kp-rte-min-h: 160px; }
    :host(.kp-rte--lg) { --kp-rte-min-h: 240px; }
    :host(.kp-rte--lg) .kp-rte__editor { padding: 16px 20px; font-size: 16px; }

    /* ProseMirror surface reset. */
    .kp-rte__editor :global(.ProseMirror) { outline: none; min-height: inherit; }
    .kp-rte__editor :global(.ProseMirror p) { margin: 0 0 8px; }
    .kp-rte__editor :global(.ProseMirror h1) { font-size: 28px; line-height: 36px; font-weight: 600; margin: 16px 0 8px; }
    .kp-rte__editor :global(.ProseMirror h2) { font-size: 22px; line-height: 28px; font-weight: 600; margin: 14px 0 6px; }
    .kp-rte__editor :global(.ProseMirror h3) { font-size: 18px; line-height: 24px; font-weight: 600; margin: 12px 0 6px; }
    .kp-rte__editor :global(.ProseMirror ul),
    .kp-rte__editor :global(.ProseMirror ol) { padding-left: 24px; margin: 0 0 8px; }
    .kp-rte__editor :global(.ProseMirror blockquote) {
      border-left: 3px solid var(--kp-color-gray-300);
      padding-left: 12px;
      color: var(--kp-color-gray-600);
      margin: 8px 0;
    }
    .kp-rte__editor :global(.ProseMirror code) {
      background: var(--kp-color-gray-100);
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      font-size: 0.9em;
    }
    .kp-rte__editor :global(.ProseMirror pre) {
      background: var(--kp-color-gray-900);
      color: var(--kp-color-gray-50);
      padding: 12px 16px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      font-size: 13px;
      margin: 8px 0;
    }
    .kp-rte__editor :global(.ProseMirror pre code) { background: transparent; padding: 0; }
    .kp-rte__editor :global(.ProseMirror hr) {
      border: none;
      border-top: 1px solid var(--kp-color-gray-200);
      margin: 12px 0;
    }
    .kp-rte__editor :global(.ProseMirror img) { max-width: 100%; border-radius: 8px; }
    .kp-rte__editor :global(.ProseMirror a) {
      color: var(--kp-color-blue-600);
      text-decoration: underline;
    }
    .kp-rte__editor :global(.ProseMirror .is-editor-empty:first-child::before) {
      content: attr(data-placeholder);
      float: left;
      color: var(--kp-color-gray-400);
      pointer-events: none;
      height: 0;
    }
  `],
})
export class KpRichTextEditorComponent implements ControlValueAccessor, OnDestroy {
  @Input() size: KpRichTextEditorSize = 'md';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() error = false;
  /** Tweak the TipTap extensions if you need to turn one off; defaults cover the "medium + image" preset. */
  @Input() extensions: 'default' = 'default';
  /**
   * Initial HTML content. For two-way binding, use `[(ngModel)]` or
   * `[formControl]` (CVA) — they respect subsequent programmatic updates;
   * `[value]` only seeds the editor on first render.
   */
  @Input() set value(v: string | null) { this.writeValue(v); }

  @Output() readonly valueChange = new EventEmitter<string>();
  /**
   * Image button clicked and a file was chosen. Host application uploads
   * to its own storage and calls `resolve(publicUrl)`; if the user cancels
   * or the upload fails, call `resolve(null)`.
   */
  @Output() readonly imageUpload = new EventEmitter<{ file: File; resolve: (url: string | null) => void }>();

  @ViewChild('editorHost', { static: true }) private editorHostRef!: ElementRef<HTMLDivElement>;

  private readonly cdr = inject(ChangeDetectorRef);
  editor: Editor | null = null;

  private pendingValue: string | null = null;
  private onChange: (v: string) => void = () => { /* no-op */ };
  private onTouched: () => void = () => { /* no-op */ };

  get hostClasses(): string {
    const c = ['kp-rte', `kp-rte--${this.size}`];
    if (this.disabled) c.push('kp-rte--disabled');
    if (this.error) c.push('kp-rte--error');
    return c.join(' ');
  }

  ngAfterViewInit(): void {
    this.editor = new Editor({
      element: this.editorHostRef.nativeElement,
      editable: !this.disabled,
      content: this.pendingValue ?? '',
      extensions: [
        StarterKit,
        Underline,
        Link.configure({ openOnClick: false, autolink: true }),
        Image,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({ placeholder: () => this.placeholder }),
      ],
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.onChange(html);
        this.valueChange.emit(html);
      },
      onBlur: () => this.onTouched(),
      onSelectionUpdate: () => this.cdr.markForCheck(),
      onTransaction: () => this.cdr.markForCheck(),
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
    this.editor = null;
  }

  // ---- toolbar actions ---------------------------------------------------

  /** @internal */
  is(mark: string): boolean {
    return this.editor ? this.editor.isActive(mark) : false;
  }
  /** @internal */
  isHeading(level: 1 | 2 | 3): boolean {
    return this.editor ? this.editor.isActive('heading', { level }) : false;
  }
  /** @internal */
  alignIs(align: 'left' | 'center' | 'right'): boolean {
    return this.editor ? this.editor.isActive({ textAlign: align }) : false;
  }

  /** @internal */
  toggle(name: 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'blockquote' | 'codeBlock' | 'bulletList' | 'orderedList'): void {
    if (!this.editor) return;
    const chain = this.editor.chain().focus();
    switch (name) {
      case 'bold':        chain.toggleBold().run();        break;
      case 'italic':      chain.toggleItalic().run();      break;
      case 'underline':   chain.toggleUnderline().run();   break;
      case 'strike':      chain.toggleStrike().run();      break;
      case 'code':        chain.toggleCode().run();        break;
      case 'blockquote':  chain.toggleBlockquote().run();  break;
      case 'codeBlock':   chain.toggleCodeBlock().run();   break;
      case 'bulletList':  chain.toggleBulletList().run();  break;
      case 'orderedList': chain.toggleOrderedList().run(); break;
    }
  }

  /** @internal */
  toggleHeading(level: 1 | 2 | 3): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  /** @internal */
  setAlign(align: 'left' | 'center' | 'right'): void {
    this.editor?.chain().focus().setTextAlign(align).run();
  }

  /** @internal */
  run(cmd: 'undo' | 'redo' | 'setHorizontalRule'): void {
    if (!this.editor) return;
    const chain = this.editor.chain().focus();
    if (cmd === 'undo') chain.undo().run();
    else if (cmd === 'redo') chain.redo().run();
    else chain.setHorizontalRule().run();
  }

  /** @internal */
  promptLink(): void {
    if (!this.editor) return;
    const current = this.editor.getAttributes('link')['href'] as string | undefined;
    // MVP: native prompt; upgrade to kp-popover + kp-input in a follow-up.
    const url = typeof window !== 'undefined' ? window.prompt('Link URL', current ?? 'https://') : null;
    if (url === null) return;
    if (url === '') this.editor.chain().focus().unsetLink().run();
    else this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  /** @internal */
  onFileChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow re-selecting the same file later
    if (!file || !this.editor) return;

    const editor = this.editor;
    const resolve = (url: string | null) => {
      if (url) editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    };
    if (this.imageUpload.observed) {
      this.imageUpload.emit({ file, resolve });
    } else {
      // Fallback: embed as data-URL. Fine for demos, not for production.
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.readAsDataURL(file);
    }
  }

  // ---- ControlValueAccessor ---------------------------------------------

  writeValue(value: string | null): void {
    const html = value ?? '';
    if (this.editor) {
      // false = don't emit update event (prevents feedback loop with onChange).
      if (this.editor.getHTML() !== html) this.editor.commands.setContent(html, { emitUpdate: false });
    } else {
      this.pendingValue = html;
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.editor?.setEditable(!isDisabled);
    this.cdr.markForCheck();
  }
}
