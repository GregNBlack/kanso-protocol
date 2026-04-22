# Card

> Universal container with optional header, body, and footer. Four appearances cover the common surface patterns: white default, gray muted, shadowed elevated, transparent outline.

## Contract

`<kp-card>` is a slot-driven container. Each section (header, body, footer) toggles via boolean inputs; optional dividers between sections handle dense data presentations. Set `[clickable]="true"` to turn the whole card into an interactive surface that emits `(cardClick)`.

### Anatomy

```
<kp-card size="md" appearance="default">
  ├─ <header class="kp-card__header">             (Show Header = true)
  │   ├─ Title + Description                       (Show Description = true)
  │   └─ [kpCardHeaderAction]                      (Show Header Action = true)
  ├─ <div class="kp-card__divider"/>               (Show Header Divider = true)
  ├─ <div class="kp-card__body">
  │   ├─ [kpCardBody]                              (slot)
  │   └─ default content                           (catch-all)
  ├─ <div class="kp-card__divider"/>               (Show Footer Divider = true)
  └─ <footer class="kp-card__footer">              (Show Footer = true)
      └─ [kpCardFooter]                            (slot)
```

### Sizes

| Size | Width | Padding | Title style | Body style |
|------|-------|---------|-------------|------------|
| sm   | 280   | 12      | text/sm     | text/sm    |
| md   | 360   | 16      | text/md     | text/sm    |
| lg   | 480   | 24      | text/lg     | text/md    |

### Appearances

| Appearance | Background | Border | Shadow |
|------------|------------|--------|--------|
| `default`  | `card/bg` (white) | `card/border` (gray.200) | none |
| `muted`    | `card/bg-muted` (gray.50) | `card/border` | none |
| `elevated` | `card/bg` (white) | transparent | 2-layer subtle shadow |
| `outline`  | transparent | `card/border` | none |

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Width + padding + typography ramp |
| `appearance` | `'default' \| 'muted' \| 'elevated' \| 'outline'` | `'default'` | Surface treatment |
| `title` | `string` | `''` | Header title |
| `description` | `string` | `''` | Header description |
| `showHeader` | `boolean` | `true` | Render the header section |
| `showDescription` | `boolean` | `false` | Render the description under the title |
| `showHeaderAction` | `boolean` | `false` | Reserve a slot for trailing header action (button/menu) |
| `showFooter` | `boolean` | `false` | Render the footer section |
| `showHeaderDivider` | `boolean` | `false` | 1px divider between header and body |
| `showFooterDivider` | `boolean` | `false` | 1px divider between body and footer |
| `clickable` | `boolean` | `false` | Card becomes a button: hover bg, focus ring, click handler |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `cardClick` | `EventEmitter<Event>` | Fires only when `clickable=true`. Triggered by click, Enter, or Space |

### Slots

- **`[kpCardHeaderAction]`** — trailing element in the header (button, icon, kebab menu). Only renders when `showHeaderAction=true`.
- **`[kpCardBody]`** — body content. Falls back to default-content slot if absent.
- **`[kpCardFooter]`** — footer actions (typically buttons). Footer aligns flex-end with size-specific gap.

## Accessibility

- When `clickable=true`, host gains `role="button"`, `tabindex="0"`, and listens for Enter + Space — same keyboard model as a real `<button>`.
- Header title is rendered as `<h3>` so it participates in document outline.
- Default (non-clickable) cards are semantically inert containers.

## Do / Don't

### Do
- Use `appearance="elevated"` on neutral page backgrounds where shadow can read; switch to `outline` on cards atop colored or already-shadowed surfaces.
- Pair `[showHeaderAction]="true"` with a small ghost button (`size="sm"`) or icon — the slot expects a single compact element, not a button row.
- Use `showHeaderDivider`/`showFooterDivider` only for data-dense cards (settings, multi-step content). Skip for marketing or product cards.
- Set `clickable=true` for entire-card click targets (e.g. catalog grids). Provide `[ariaLabel]` via the host if title alone isn't enough.

### Don't
- Don't nest cards. If a list of cards needs visual grouping, wrap the list in a section, not another card.
- Don't combine `appearance="elevated"` with `clickable=true` and a focus ring stack — the focus ring already provides depth; the shadow makes it noisy.
- Don't put primary navigation in `[kpCardHeaderAction]`. That's a side-action; the title should already make the destination clear.

## References

- **Figma component**: [`Card` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3468-7841)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-card
- **Source**: `packages/components/card/src/`
- **Tokens used**:
  - Background: `card/bg`, `card/bg-muted`
  - Border: `card/border`
  - Text: `card/fg-title`, `card/fg-desc`, `card/fg-body`
  - Divider: `card/divider`

## Changelog

- `0.1.0` — Initial release. Three sizes (sm/md/lg), four appearances (default/muted/elevated/outline), header / body / footer composition with optional dividers, clickable mode with full keyboard support.
