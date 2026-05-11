import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { injectKpStrings } from '@kanso-protocol/i18n';

export type KpFileUploadSize = 'sm' | 'md' | 'lg';
export type KpFileUploadAppearance = 'default' | 'compact';
export type KpFileUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export type KpFileRejectReason = 'type' | 'size' | 'count';

export interface KpFileRejection {
  file: File;
  reason: KpFileRejectReason;
  message: string;
}

export interface KpUploadFile {
  id: string;
  file: File;
  status: KpFileUploadStatus;
  /** 0..100 — driven by the consumer via `setProgress(id, n)`. */
  progress: number;
  /** Consumer-supplied error message when `status === 'error'`. */
  error?: string | null;
}

let nextId = 0;

/**
 * Kanso Protocol — FileUpload (dropzone)
 *
 * Click-to-browse + drag-and-drop. Constraints:
 * `[accept]` MIME / extension list, `[maxSize]` bytes per file,
 * `[maxFiles]` total count, `[multiple]` toggle.
 *
 * Emits `(filesAdded)` for accepted files (the consumer owns the upload
 * loop and reports back via `setProgress` / `setStatus`) and
 * `(filesRejected)` for the rest. Selected files are tracked in `files`
 * so the UI can show a status list with progress + remove.
 *
 * @example
 * <kp-file-upload
 *   [multiple]="true"
 *   accept="image/*,.pdf"
 *   [maxSize]="5 * 1024 * 1024"
 *   [maxFiles]="10"
 *   (filesAdded)="upload($event)"
 *   (filesRejected)="warn($event)"
 *   (fileRemoved)="cancel($event)"
 * />
 */
@Component({
  selector: 'kp-file-upload',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <label
      class="kp-file-upload__zone"
      [class.kp-file-upload__zone--dragover]="isDragOver"
      [class.kp-file-upload__zone--disabled]="disabled"
      [attr.aria-label]="resolvedAriaLabel"
      (dragenter)="onDragEnter($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <input
        #fileInput
        type="file"
        class="kp-file-upload__input"
        [multiple]="multiple"
        [accept]="accept || ''"
        [disabled]="disabled"
        [required]="required"
        [attr.name]="name"
        (change)="onFileInputChange($event)"
      />
      <span class="kp-file-upload__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 16V4m0 0-4 4m4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>
        </svg>
      </span>
      <span class="kp-file-upload__label">
        <span class="kp-file-upload__title">{{ resolvedTitle }}</span>
        @if (hint) {
          <span class="kp-file-upload__hint">{{ hint }}</span>
        }
      </span>
    </label>

    @if (files.length > 0) {
      <ul class="kp-file-upload__list" role="list">
        @for (item of files; track item.id) {
          <li class="kp-file-upload__item" [attr.data-status]="item.status">
            <span class="kp-file-upload__item-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
                <path d="M14 3v5h5"/>
              </svg>
            </span>
            <span class="kp-file-upload__item-meta">
              <span class="kp-file-upload__item-name" [title]="item.file.name">{{ item.file.name }}</span>
              <span class="kp-file-upload__item-sub">
                <span>{{ formatSize(item.file.size) }}</span>
                @if (item.status === 'uploading') {
                  <span class="kp-file-upload__item-progress">{{ item.progress }}%</span>
                }
                @if (item.status === 'error' && item.error) {
                  <span class="kp-file-upload__item-error">{{ item.error }}</span>
                }
                @if (item.status === 'success') {
                  <span class="kp-file-upload__item-success">{{ strings.dropzoneUploaded }}</span>
                }
              </span>
              @if (item.status === 'uploading') {
                <span
                  class="kp-file-upload__bar"
                  role="progressbar"
                  [attr.aria-valuenow]="item.progress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  [attr.aria-label]="'Uploading ' + item.file.name"
                >
                  <span class="kp-file-upload__bar-fill" [style.width.%]="item.progress"></span>
                </span>
              }
            </span>
            <button
              type="button"
              class="kp-file-upload__item-remove"
              [attr.aria-label]="strings.dropzoneRemove(item.file.name)"
              (click)="remove(item.id, $event)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </li>
        }
      </ul>
    }
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-file-upload__zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: var(--kp-file-upload-zone-pad, 32px) 24px;
      border: 2px dashed var(--kp-color-border-strong);
      border-radius: 12px;
      background: var(--kp-color-surface-subtle);
      color: var(--kp-color-text-default);
      cursor: pointer;
      text-align: center;
      transition:
        background var(--kp-motion-duration-fast) ease,
        border-color var(--kp-motion-duration-fast) ease;
    }
    .kp-file-upload__zone:hover:not(.kp-file-upload__zone--disabled) {
      border-color: var(--kp-color-text-disabled);
      background: var(--kp-color-surface-muted);
    }
    .kp-file-upload__zone:has(.kp-file-upload__input:focus-visible) {
      outline: 2px solid var(--kp-color-accent-primary-fg);
      outline-offset: 2px;
    }
    .kp-file-upload__zone--dragover {
      border-color: var(--kp-color-accent-primary-fg);
      background: var(--kp-color-primary-subtle-bg-rest);
      color: var(--kp-color-accent-primary-fg);
    }
    .kp-file-upload__zone--disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    :host(.kp-file-upload--sm) .kp-file-upload__zone { --kp-file-upload-zone-pad: 20px; }
    :host(.kp-file-upload--md) .kp-file-upload__zone { --kp-file-upload-zone-pad: 32px; }
    :host(.kp-file-upload--lg) .kp-file-upload__zone { --kp-file-upload-zone-pad: 48px; }
    :host(.kp-file-upload--compact) .kp-file-upload__zone {
      flex-direction: row;
      gap: 12px;
      padding: 12px 16px;
      text-align: start;
    }

    .kp-file-upload__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: var(--kp-color-text-muted);
    }
    .kp-file-upload__icon svg { width: 100%; height: 100%; }

    .kp-file-upload__label { display: inline-flex; flex-direction: column; gap: 2px; }
    .kp-file-upload__title { font-size: 14px; font-weight: 500; color: var(--kp-color-text-strong); }
    .kp-file-upload__hint { font-size: 12px; color: var(--kp-color-text-muted); }

    .kp-file-upload__input {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }

    .kp-file-upload__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .kp-file-upload__item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--kp-color-border-default);
      background: var(--kp-color-surface-base);
    }
    .kp-file-upload__item[data-status="error"] {
      border-color: var(--kp-color-danger-outline-border-rest);
      background: var(--kp-color-danger-subtle-bg-rest);
    }
    .kp-file-upload__item[data-status="success"] {
      border-color: var(--kp-color-icon-success);
    }

    .kp-file-upload__item-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--kp-color-text-muted);
    }
    .kp-file-upload__item-icon svg { width: 100%; height: 100%; }

    .kp-file-upload__item-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .kp-file-upload__item-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--kp-color-text-strong);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .kp-file-upload__item-sub { display: inline-flex; gap: 8px; font-size: 11px; color: var(--kp-color-text-muted); }
    .kp-file-upload__item-progress { color: var(--kp-color-accent-primary-fg); font-variant-numeric: tabular-nums; }
    .kp-file-upload__item-error { color: var(--kp-color-accent-danger-fg); }
    .kp-file-upload__item-success { color: var(--kp-color-accent-success-fg); }

    .kp-file-upload__bar {
      display: block;
      width: 100%;
      height: 3px;
      margin-top: 6px;
      border-radius: 999px;
      background: var(--kp-color-surface-strong);
      overflow: hidden;
    }
    .kp-file-upload__bar-fill {
      display: block;
      height: 100%;
      background: var(--kp-color-accent-primary-fg);
      transition: width var(--kp-motion-duration-fast) ease;
    }

    .kp-file-upload__item-remove {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      color: var(--kp-color-text-muted);
      cursor: pointer;
      transition: background var(--kp-motion-duration-fast) ease;
    }
    .kp-file-upload__item-remove:hover { background: var(--kp-color-surface-muted); color: var(--kp-color-text-default); }
    .kp-file-upload__item-remove:focus-visible {
      outline: 2px solid var(--kp-color-accent-primary-fg);
      outline-offset: 1px;
    }
    .kp-file-upload__item-remove svg { width: 14px; height: 14px; }

    @media (prefers-reduced-motion: reduce) {
      .kp-file-upload__zone,
      .kp-file-upload__bar-fill,
      .kp-file-upload__item-remove { transition: none; }
    }
  `],
})
export class KpFileUploadComponent {
  @Input() size: KpFileUploadSize = 'md';
  @Input() appearance: KpFileUploadAppearance = 'default';

  @Input() multiple = false;
  @Input() accept: string | null = null;
  /** Max bytes per file. `null` = no limit. */
  @Input() maxSize: number | null = null;
  /** Max total file count. `null` = no limit. */
  @Input() maxFiles: number | null = null;
  @Input() disabled = false;
  @Input() required = false;
  @Input() name: string | null = null;

  @Input() title: string | null = null;
  @Input() hint: string | null = null;
  @Input() ariaLabel: string | null = null;

  @Output() filesAdded = new EventEmitter<KpUploadFile[]>();
  @Output() filesRejected = new EventEmitter<KpFileRejection[]>();
  @Output() fileRemoved = new EventEmitter<KpUploadFile>();

  @ViewChild('fileInput', { static: true }) private fileInput!: ElementRef<HTMLInputElement>;

  files: KpUploadFile[] = [];
  isDragOver = false;

  readonly strings = injectKpStrings();

  private dragDepth = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  get hostClasses(): string {
    return [
      'kp-file-upload',
      `kp-file-upload--${this.size}`,
      `kp-file-upload--${this.appearance}`,
    ].join(' ');
  }

  get resolvedTitle(): string {
    return this.title ?? this.strings.dropzoneTitle;
  }

  get resolvedAriaLabel(): string {
    return this.ariaLabel ?? this.strings.dropzoneTitle;
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = input.files;
    if (!list || list.length === 0) return;
    this.ingest(Array.from(list));
    input.value = '';
  }

  onDragEnter(event: DragEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    this.dragDepth += 1;
    this.isDragOver = true;
    this.cdr.markForCheck();
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  onDragLeave(event: DragEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) {
      this.isDragOver = false;
      this.cdr.markForCheck();
    }
  }

  onDrop(event: DragEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    this.dragDepth = 0;
    this.isDragOver = false;
    const list = event.dataTransfer?.files;
    if (!list || list.length === 0) return;
    this.ingest(Array.from(list));
  }

  remove(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    const idx = this.files.findIndex((f) => f.id === id);
    if (idx === -1) return;
    const [removed] = this.files.splice(idx, 1);
    this.files = [...this.files];
    this.fileRemoved.emit(removed);
    this.cdr.markForCheck();
  }

  /** Mutates the entry with `id` to update its progress (0..100). */
  setProgress(id: string, progress: number): void {
    const item = this.files.find((f) => f.id === id);
    if (!item) return;
    item.progress = Math.max(0, Math.min(100, Math.round(progress)));
    if (item.status === 'idle') item.status = 'uploading';
    this.files = [...this.files];
    this.cdr.markForCheck();
  }

  /** Mutates the entry with `id` to update its status. */
  setStatus(id: string, status: KpFileUploadStatus, error?: string | null): void {
    const item = this.files.find((f) => f.id === id);
    if (!item) return;
    item.status = status;
    item.error = error ?? null;
    if (status === 'success') item.progress = 100;
    this.files = [...this.files];
    this.cdr.markForCheck();
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  }

  private ingest(incoming: File[]): void {
    const accepted: KpUploadFile[] = [];
    const rejected: KpFileRejection[] = [];

    let pool = incoming;
    if (!this.multiple) pool = pool.slice(0, 1);

    for (const file of pool) {
      const rejectReason = this.validate(file, accepted.length);
      if (rejectReason) {
        rejected.push({ file, reason: rejectReason, message: this.rejectMessage(rejectReason, file) });
        continue;
      }
      accepted.push({
        id: `kp-upload-${++nextId}`,
        file,
        status: 'idle',
        progress: 0,
        error: null,
      });
    }

    if (accepted.length > 0) {
      this.files = this.multiple ? [...this.files, ...accepted] : accepted;
      this.filesAdded.emit(accepted);
    }
    if (rejected.length > 0) this.filesRejected.emit(rejected);
    this.cdr.markForCheck();
  }

  private validate(file: File, addedSoFar: number): KpFileRejectReason | null {
    if (this.maxFiles !== null && this.files.length + addedSoFar + 1 > this.maxFiles) {
      return 'count';
    }
    if (this.maxSize !== null && file.size > this.maxSize) return 'size';
    if (this.accept && !this.matchesAccept(file)) return 'type';
    return null;
  }

  private matchesAccept(file: File): boolean {
    if (!this.accept) return true;
    const tokens = this.accept.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (tokens.length === 0) return true;
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    for (const token of tokens) {
      if (token.startsWith('.') && name.endsWith(token)) return true;
      if (token.endsWith('/*')) {
        const prefix = token.slice(0, -1);
        if (type.startsWith(prefix)) return true;
      }
      if (token === type) return true;
    }
    return false;
  }

  private rejectMessage(reason: KpFileRejectReason, file: File): string {
    if (reason === 'type') return `File type not allowed: ${file.type || file.name}`;
    if (reason === 'size') {
      const limit = this.maxSize ? this.formatSize(this.maxSize) : '';
      return `File too large${limit ? ` (max ${limit})` : ''}`;
    }
    if (reason === 'count') {
      return `Too many files${this.maxFiles ? ` (max ${this.maxFiles})` : ''}`;
    }
    return 'File rejected';
  }
}
