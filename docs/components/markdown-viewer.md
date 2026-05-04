# MarkdownViewer

> Read-only markdown renderer. Pairs with `<kp-rich-text-editor>` (HTML-only) for pages where the consumer needs to *display* markdown — READMEs, changelogs, release notes, MDX-light docs.

## Contract

`<kp-markdown-viewer>` is a single styled `<div>` with `[innerHTML]` set from `parser(content)`:

```
<kp-markdown-viewer size="md" [content]="…" [parser]="…" [trusted]="false">
  └─ .kp-markdown-viewer__prose
      └─ <innerHTML from parser(content)>
```

The component does not edit. For an editor surface use `<kp-rich-text-editor>` (which emits HTML, not markdown).

### Default parser

`marked@^7` is bundled as a runtime `dependency`. Pass `[parser]` to swap in `markdown-it`, `remark`, or any custom `(md: string) => string` for plugin support beyond CommonMark + GFM.

### Sanitization

By default (`trusted=false`), the rendered HTML goes through Angular's automatic `[innerHTML]` sanitizer — `<script>`, inline event handlers, and `javascript:` URLs are stripped. Set `trusted=true` only when the markdown source is fully under your control (your own bundled docs, hardcoded changelog) and you need to allow constructs the sanitizer would otherwise strip.

### Sizes

| Size | Body font | h1 | h2 | h3 |
|------|-----------|----|----|----|
| sm   | 13px      | 22 | 18 | 16 |
| md   | 14px      | 28 | 22 | 18 |
| lg   | 16px      | 32 | 26 | 20 |

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Body + heading typography scale |
| `content` | `string \| null` | `null` | Markdown source |
| `parser` | `(md: string) => string` | `marked.parse` | Function that converts markdown → HTML |
| `trusted` | `boolean` | `false` | Skip Angular's automatic HTML sanitizer |

### Types

```ts
type KpMarkdownViewerSize = 'sm' | 'md' | 'lg';
type KpMarkdownParser = (markdown: string) => string;
```

## Example

```ts
import { KpMarkdownViewerComponent } from '@kanso-protocol/markdown-viewer';

@Component({
  imports: [KpMarkdownViewerComponent],
  template: `<kp-markdown-viewer size="md" [content]="readme"/>`,
})
class DocsPage {
  readme = `# Hello\n\n- one\n- two`;
}
```

### Custom parser (markdown-it for GFM tables + plugins)

```ts
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

@Component({
  template: `<kp-markdown-viewer [content]="src" [parser]="render"/>`,
})
class Demo {
  src = '...';
  render = (s: string) => md.render(s);
}
```

## Do / Don't

### Do
- Use the largest size only for full-page docs / readers; `md` is the default for inline help / changelog drawers.
- Provide a custom parser when you need plugins (footnotes, embeds, math, KaTeX).
- Keep `trusted=false` for any user-authored markdown. Server-side validation is not enough — Angular's sanitizer is your second line of defense.
- Prefer `kp-rich-text-editor` for the *write* path and `kp-markdown-viewer` for the *read* path. Don't try to edit markdown in this component.

### Don't
- Don't use this for very large documents (>1MB markdown). Re-render is full-doc; for that scale, paginate or use a streaming renderer.
- Don't pass markdown that contains `<script>` and expect to opt back in via `trusted=true` — there's no per-element allow-list, it's all-or-nothing.
- Don't reach into the rendered DOM to bind handlers. If you need interactivity (link tracking, code-copy buttons), pre-process the markdown in your `[parser]` and use a delegated handler on a wrapper element.

## References

- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-markdownviewer--docs
- **Source**: `packages/components/markdown-viewer/src/`
- **Tokens used**:
  - Heading + body fg: `gray.900`
  - Code background: `gray.100`
  - Blockquote rule: `gray.300`
  - Link color: `accent.primary.fg`

## Changelog

- `0.1.0` — Initial release. CommonMark + GFM via bundled `marked@7`, pluggable parser, three sizes, sanitized-by-default output.
