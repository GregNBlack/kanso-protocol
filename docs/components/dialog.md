# Dialog

> Modal window with backdrop, Esc-to-close, and focus trap. Composition via three slots: hero icon, body, and footer. The component is a controlled view — callers own the `[open]` state.

## Contract

Dialog is a single component (`<kp-dialog>`) that renders a modal panel centered on the viewport with a semi-transparent backdrop behind it. Opening the dialog locks body scroll, traps focus inside the panel, and exposes Esc + backdrop-click as close affordances (both can be disabled for intrusive confirmations). The visual layout is a three-section stack — Header / Body / Footer — each of which can be independently hidden, with optional dividers between them.

### Anatomy

```
<kp-dialog [(open)]="show" size="md">
  ├─ .kp-dialog__backdrop            (50% black overlay, click to close)
  └─ [role="dialog" aria-modal="true"]
     ├─ .kp-dialog__close            (× button — absolutely positioned, Show Close = true)
     ├─ .kp-dialog__header           (Show Header = true)
     │   ├─ .kp-dialog__hero         (Show Hero Icon = true, rendered LEFT of text)
     │   │   └─ [kpDialogHeroIcon]   (slot — SVG with stroke="currentColor")
     │   └─ .kp-dialog__text-group
     │       ├─ .kp-dialog__title
     │       └─ .kp-dialog__desc    (Show Description = true)
     ├─ .kp-dialog__divider          (Show Header Divider = true)
     ├─ .kp-dialog__body
     │   └─ [kpDialogBody]           (slot — any content)
     ├─ .kp-dialog__divider          (Show Footer Divider = true)
     └─ .kp-dialog__footer           (Show Footer = true)
         └─ [kpDialogFooter]         (slot — typically Buttons)
```

- **Hero icon** sits **to the left** of the title/description when `showHeroIcon=true`. Both header axes are on the same baseline — enabling the hero doesn't push the title or the close button down.
- **Close button** is `position: absolute` pinned to the panel's top-right corner, so it stays put regardless of whether the hero, description, or dividers are present. The header reserves extra right-padding when `showClose=true` so long titles never tuck under it.

- **Backdrop** is a `<div>` with `position: absolute; inset: 0` and the `--kp-color-dialog-backdrop` fill. Clicking it emits `close` (opt-out via `[closeOnBackdrop]="false"`).
- **Panel** sits above the backdrop via CSS stacking; it owns the `role="dialog"` + `aria-modal="true"` + `aria-labelledby` that points at the title id.
- **Sections** are independent — toggle via `showHeader` / `showFooter` booleans. Body is always rendered.

### Sizes

| Size | Width  | Padding | Hero container | Hero icon | Title style | Desc style |
|------|--------|---------|----------------|-----------|-------------|------------|
| xs   | 320 px | 16      | 48             | 24        | text/md     | text/sm    |
| sm   | 400 px | 16      | 48             | 24        | text/md     | text/sm    |
| md   | 560 px | 20      | 56             | 28        | text/lg     | text/md    |
| lg   | 720 px | 24      | 64             | 32        | text/xl     | text/md    |
| xl   | 960 px | 32      | 64             | 32        | text/2xl    | text/lg    |

`max-width: calc(100vw - 32px)` and `max-height: calc(100vh - 48px)` keep the panel inside the viewport on small screens; body content scrolls internally if the content outgrows the available height.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Controlled open state. Use `[(open)]` for two-way or `[open]` + `(openChange)` manually |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Panel width + typography ramp |
| `title` | `string` | `''` | Header title text — wired to `aria-labelledby` |
| `description` | `string` | `''` | Secondary copy under the title |
| `showHeader` | `boolean` | `true` | Render the entire header section |
| `showHeroIcon` | `boolean` | `false` | Render the hero icon circle above the title |
| `showDescription` | `boolean` | `false` | Render the description under the title |
| `showClose` | `boolean` | `true` | Render the × close button in the header |
| `showFooter` | `boolean` | `true` | Render the footer section |
| `showHeaderDivider` | `boolean` | `false` | 1px rule between header and body |
| `showFooterDivider` | `boolean` | `false` | 1px rule between body and footer |
| `footerLayout` | `'end' \| 'between' \| 'stacked'` | `'end'` | Alignment of footer children |
| `closeOnBackdrop` | `boolean` | `true` | Clicking the backdrop closes the dialog |
| `closeOnEsc` | `boolean` | `true` | Pressing Esc closes the dialog |
| `ariaLabel` | `string` | `''` | Fallback `aria-label` when `showHeader=false` |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `openChange` | `EventEmitter<boolean>` | Fires when open state flips (backdrop/Esc/close button) |
| `closed` | `EventEmitter<void>` | Fires once per close. Use for imperative side-effects |

### Slots

- **`[kpDialogHeroIcon]`** — icon rendered in the circular hero container above the title. Recommended: 24 px SVG with `stroke="currentColor"` so it picks up the hero container's color. Override the color inline (e.g. `style="color: #DC2626"`) for danger/warning/success variants.
- **`[kpDialogBody]`** — body content. Default typography comes from the size variant, but you can drop in a form, list, alert, or any custom layout.
- **`[kpDialogFooter]`** — footer actions. Typically one or more `<kp-button>` instances. The wrapping `<footer>` applies the `footerLayout` class.

## Footer layouts

- **`end`** — default. Actions right-aligned with gap.
- **`between`** — first child pushed to the left (e.g. "Learn more"), rest to the right. Wrap the right group in a `<div>` so it stays together.
- **`stacked`** — vertical column with full-width buttons. Mobile-friendly; put the primary action first (top) for thumb reach.

## Behavior

### Focus management

When `open` transitions `false → true`:
1. The previously-focused element is remembered.
2. Body `overflow` is set to `hidden` (scroll lock).
3. Focus moves to the first interactive element inside the panel (button / link / input). If none exist, focus lands on the panel itself (it has `tabindex="-1"`).

When `open` transitions `true → false`:
1. Body `overflow` is restored.
2. Focus returns to the previously-focused element.

### Esc + backdrop close

Both are enabled by default. Disable for intrusive confirmations (e.g. "you have unsaved changes — really leave?") via `[closeOnBackdrop]="false"` and `[closeOnEsc]="false"`.

### Scroll lock

We set `document.body.style.overflow = 'hidden'` while the dialog is open and restore it on close. If your app already locks scroll (e.g. via a CDK scroll strategy), you can ignore this — re-locking to `hidden` is a no-op.

## Accessibility

- Panel has `role="dialog"` + `aria-modal="true"`.
- `aria-labelledby` points at the title element; `aria-describedby` points at the description when `showDescription=true`.
- When `showHeader=false`, provide `[ariaLabel]` so screen readers still announce the dialog's purpose.
- Close button has `aria-label="Close dialog"`.
- Esc closes the dialog (can be disabled).
- Focus is trapped inside the panel by native tab order — we move focus in on open and restore it on close, but we don't intercept Tab key cycling (browsers do this correctly with `aria-modal` + the overlay DOM position).

## Do / Don't

### Do
- Use `[(open)]` two-way binding — the dialog is a controlled view.
- Put the primary action on the right of a `footerLayout="end"` footer; leftmost is Cancel.
- Use `showHeroIcon` + an inline `color` override for destructive (red), warning (amber), or success (green) confirmations.
- Keep body scrollable — let long content overflow inside the body, not the panel itself.
- For data-heavy dialogs (forms, lists), enable `showHeaderDivider` + `showFooterDivider` to group the chrome away from content.

### Don't
- Don't nest dialogs. If you need a second confirmation, close the first one before opening the second.
- Don't disable the × button and Esc + backdrop close together — always leave users at least one way out.
- Don't use Dialog for inline disclosure (expandable sections) — that's Popover / Collapse territory.
- Don't stuff long-form content. If you need a settings UI, use a Drawer or a routed sub-page.
- Don't ship dialogs with no focus destination. At minimum, the close button should be focusable, even when `showFooter=false`.

## References

- **Figma component**: [`Dialog` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3447-7678)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-dialog
- **Source**: `packages/components/dialog/src/`
- **Tokens used**:
  - Backdrop: `dialog/backdrop`
  - Panel: `dialog/panel/bg`, `dialog/panel/border`
  - Text: `dialog/fg-title`, `dialog/fg-desc`, `dialog/fg-body`
  - Divider: `dialog/divider`
  - Focus: `color/focus/ring`
  - Typography: palette Text Styles (`text/sm` … `text/2xl`) mapped by size

## Changelog

- `0.1.0` — Initial release. `<kp-dialog>` with 5 sizes (xs/sm/md/lg/xl), 3 footer layouts (end/between/stacked), optional hero icon / description / close / dividers, controlled `[(open)]` state with backdrop + Esc close, body scroll lock, and focus restoration.
