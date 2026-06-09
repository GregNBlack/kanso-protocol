import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type KpMarkdownViewerSize = 'sm' | 'md' | 'lg';
/** A parser may be synchronous or async (the default lazy-loads `marked`). */
export type KpMarkdownParser = (markdown: string) => string | Promise<string>;

// `marked` is loaded on first render via dynamic import, so consumers that
// don't render markdown eagerly can code-split it out of their initial bundle.
// The module is cached after the first load.
let markedModulePromise: Promise<typeof import('marked')> | null = null;
const defaultParser: KpMarkdownParser = async (md) => {
  markedModulePromise ??= import('marked');
  const { marked } = await markedModulePromise;
  return marked.parse(md, { async: false }) as string;
};

/**
 * Kanso Protocol — MarkdownViewer
 *
 * Read-only markdown renderer. Pairs with `<kp-rich-text-editor>` (which
 * is HTML-only) for repos / docs / READMEs / changelog viewers.
 *
 * Default parser is `marked` (already a dev-dep transitive in many Angular
 * setups; declared here as a runtime dep so the component is self-contained).
 * Pass `[parser]` to swap in `markdown-it`, `remark`, or a custom parser
 * when you need plugin support beyond CommonMark + GFM.
 *
 * Output is sanitized via `DomSanitizer.bypassSecurityTrustHtml` only when
 * `[trusted]=true`. With `trusted=false` (default) the inner HTML goes
 * through Angular's automatic sanitization, which strips `<script>`,
 * inline event handlers, and `javascript:` URLs.
 *
 * @example
 * <kp-markdown-viewer
 *   size="md"
 *   [content]="readme"
 * />
 *
 * @example
 * // With a custom parser (e.g. markdown-it for GFM tables + plugins):
 * <kp-markdown-viewer
 *   [content]="readme"
 *   [parser]="myMarkdownIt.render.bind(myMarkdownIt)"
 * />
 */
@Component({
  selector: 'kp-markdown-viewer',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `<div class="kp-markdown-viewer__prose" [innerHTML]="rendered"></div>`,
  styles: [`
    :host {
      box-sizing: border-box;
      display: block;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      color: var(--kp-color-text-strong);
      --kp-md-fs: 14px;
      --kp-md-h1: 28px;
      --kp-md-h2: 22px;
      --kp-md-h3: 18px;
      --kp-md-line: 1.6;
    }
    :host(.kp-markdown-viewer--sm) {
      --kp-md-fs: 13px;
      --kp-md-h1: 22px;
      --kp-md-h2: 18px;
      --kp-md-h3: 16px;
      --kp-md-line: 1.55;
    }
    :host(.kp-markdown-viewer--lg) {
      --kp-md-fs: 16px;
      --kp-md-h1: 32px;
      --kp-md-h2: 26px;
      --kp-md-h3: 20px;
      --kp-md-line: 1.65;
    }

    .kp-markdown-viewer__prose {
      font-size: var(--kp-md-fs);
      line-height: var(--kp-md-line);
    }

    .kp-markdown-viewer__prose :first-child { margin-block-start: 0; }
    .kp-markdown-viewer__prose :last-child { margin-block-end: 0; }

    .kp-markdown-viewer__prose h1,
    .kp-markdown-viewer__prose h2,
    .kp-markdown-viewer__prose h3,
    .kp-markdown-viewer__prose h4,
    .kp-markdown-viewer__prose h5,
    .kp-markdown-viewer__prose h6 {
      font-weight: 600;
      color: var(--kp-color-text-strong);
      margin-block: 1.5em 0.5em;
      line-height: 1.25;
    }
    .kp-markdown-viewer__prose h1 { font-size: var(--kp-md-h1); }
    .kp-markdown-viewer__prose h2 { font-size: var(--kp-md-h2); }
    .kp-markdown-viewer__prose h3 { font-size: var(--kp-md-h3); }
    .kp-markdown-viewer__prose h4 { font-size: 1em; }

    .kp-markdown-viewer__prose p { margin-block: 0 1em; }

    .kp-markdown-viewer__prose a {
      color: var(--kp-color-accent-primary-fg);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .kp-markdown-viewer__prose a:hover { text-decoration-thickness: 2px; }

    .kp-markdown-viewer__prose strong { font-weight: 600; color: var(--kp-color-text-strong); }
    .kp-markdown-viewer__prose em { font-style: italic; }
    .kp-markdown-viewer__prose del { text-decoration: line-through; color: var(--kp-color-text-muted); }

    .kp-markdown-viewer__prose code {
      font-family: var(--kp-font-family-mono, ui-monospace, SFMono-Regular, monospace);
      font-size: 0.9em;
      padding: 0.125em 0.375em;
      border-radius: 4px;
      background: var(--kp-color-surface-muted);
      color: var(--kp-color-text-strong);
    }
    .kp-markdown-viewer__prose pre {
      margin-block: 0 1em;
      padding: 12px 16px;
      border-radius: 8px;
      background: var(--kp-color-surface-muted);
      overflow-x: auto;
      line-height: 1.5;
    }
    .kp-markdown-viewer__prose pre code {
      padding: 0;
      background: transparent;
      border-radius: 0;
      font-size: 0.875em;
    }

    .kp-markdown-viewer__prose blockquote {
      margin: 0 0 1em;
      padding-inline-start: 12px;
      border-inline-start: 3px solid var(--kp-color-border-strong);
      color: var(--kp-color-text-default);
    }

    .kp-markdown-viewer__prose ul,
    .kp-markdown-viewer__prose ol {
      margin-block: 0 1em;
      padding-inline-start: 1.5em;
    }
    .kp-markdown-viewer__prose li { margin-block: 0.25em; }
    .kp-markdown-viewer__prose ul ul,
    .kp-markdown-viewer__prose ol ol,
    .kp-markdown-viewer__prose ul ol,
    .kp-markdown-viewer__prose ol ul { margin-block: 0.25em 0.25em; }

    .kp-markdown-viewer__prose hr {
      border: none;
      border-block-start: 1px solid var(--kp-color-border-default);
      margin-block: 2em;
    }

    .kp-markdown-viewer__prose img {
      max-width: 100%;
      border-radius: 8px;
    }

    .kp-markdown-viewer__prose table {
      width: 100%;
      border-collapse: collapse;
      margin-block: 0 1em;
      font-size: 0.95em;
    }
    .kp-markdown-viewer__prose th,
    .kp-markdown-viewer__prose td {
      padding: 8px 12px;
      border-block-end: 1px solid var(--kp-color-border-default);
      text-align: start;
    }
    .kp-markdown-viewer__prose th {
      font-weight: 600;
      background: var(--kp-color-surface-subtle);
      color: var(--kp-color-text-strong);
    }

    .kp-markdown-viewer__prose input[type="checkbox"] {
      margin-inline-end: 6px;
      vertical-align: -2px;
    }
  `],
})
export class KpMarkdownViewerComponent implements OnChanges {
  @Input() size: KpMarkdownViewerSize = 'md';
  @Input() content: string | null = null;
  /** Custom parser. Defaults to `marked.parse()`. */
  @Input() parser: KpMarkdownParser = defaultParser;
  /**
   * When `true`, output is wrapped in `bypassSecurityTrustHtml` (raw HTML
   * passes through). Use only with content from a controlled source —
   * markdown that the user can author should keep `trusted=false`.
   */
  @Input() trusted = false;

  rendered: SafeHtml | string = '';

  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  /** Guards against an earlier slow parse overwriting a newer one. */
  private renderToken = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if ('content' in changes || 'parser' in changes || 'trusted' in changes) {
      this.render();
    }
  }

  get hostClasses(): string {
    return `kp-markdown-viewer kp-markdown-viewer--${this.size}`;
  }

  private render(): void {
    if (this.content == null || this.content === '') {
      this.rendered = '';
      return;
    }
    // The parser may be sync (custom) or async (the default lazy-loads
    // `marked`). Normalize to a promise; a token guards against an earlier
    // slow parse landing after a newer one.
    const token = ++this.renderToken;
    const content = this.content;
    let result: string | Promise<string>;
    try {
      result = this.parser(content);
    } catch (err) {
      console.error('[kp-markdown-viewer] parser threw:', err);
      this.rendered = '';
      return;
    }
    Promise.resolve(result).then(
      (html) => {
        if (token !== this.renderToken) return; // superseded
        this.rendered = this.trusted ? this.sanitizer.bypassSecurityTrustHtml(html) : html;
        this.cdr.markForCheck();
      },
      (err) => {
        if (token !== this.renderToken) return;
        console.error('[kp-markdown-viewer] parser threw:', err);
        this.rendered = '';
        this.cdr.markForCheck();
      },
    );
  }
}
