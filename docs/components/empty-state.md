# EmptyState

> Centered placeholder for empty lists, missing data, or zero-result screens. Stack of optional illustration → title → description → actions.

## Contract

`<kp-empty-state>` renders four optional pieces in a single centered column:

```
<kp-empty-state size="md">
  ├─ <div class="kp-es__illustration">     (Show Illustration = true)
  │   └─ [kpEmptyStateIcon]               (slot — SVG with stroke="currentColor")
  ├─ <div class="kp-es__text">
  │   ├─ <h3 class="kp-es__title">…</h3>
  │   └─ <p class="kp-es__desc">…</p>     (Show Description = true)
  └─ <div class="kp-es__actions">
      └─ [kpEmptyStateActions]            (slot — usually <kp-button> instances)
```

The illustration is a circular gray container; project an icon SVG into the `[kpEmptyStateIcon]` slot — color it via inline `color:` on a wrapping span for warning/error variants. Actions are a flex row beneath the text — slot 1-2 buttons.

### Sizes

| Size | Illustration | Icon | Title | Description | Vertical padding |
|------|--------------|------|-------|-------------|------------------|
| sm   | 48           | 24   | text/md | text/sm | 32 |
| md   | 64           | 32   | text/lg | text/md | 48 |
| lg   | 80           | 40   | text/xl | text/md | 64 |

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Compact / page / hero scales |
| `title` | `string` | `''` | Required — main one-liner explaining the empty state |
| `description` | `string` | `''` | Secondary copy (only rendered when `showDescription=true`) |
| `showIllustration` | `boolean` | `true` | Render the circular icon container |
| `showDescription` | `boolean` | `true` | Render the description below the title |

### Slots

- **`[kpEmptyStateIcon]`** — illustration content. Use a 24×24 SVG with `stroke="currentColor"` so it inherits the illustration container's color. Wrap in a span with `color:` style for color overrides (red for errors, etc.).
- **`[kpEmptyStateActions]`** — action buttons. Typically 1-2 `<kp-button>` instances (Primary + Secondary ghost). The slot is hidden when empty.

## Do / Don't

### Do
- Keep titles short and emotionally honest. "No items yet" beats "Empty list".
- Pair with one clear call-to-action when there's a sensible next step ("Create item", "Refresh", "Upload"). Skip the action when truly nothing can be done.
- Use a colored icon for error/warning states (`<span style="color:#DC2626"><svg ...></span>`).
- Use `size="sm"` inside cards / panels; `size="md"` for pages; `size="lg"` only for full-screen onboarding.

### Don't
- Don't dump multiple paragraphs into the description. If you need that much copy, link to docs.
- Don't show two primary actions side-by-side. Pair primary + ghost for two-action layouts.
- Don't use EmptyState for loading skeletons — that's a different pattern (Skeleton component).
- Don't make the illustration the focal point of the page. Title + actions carry the meaning; the icon is decoration.

## References

- **Figma component**: [`EmptyState` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3470-7933)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-emptystate
- **Source**: `packages/components/empty-state/src/`
- **Tokens used**:
  - Illustration bg / icon: `empty-state/illustration-bg`, `empty-state/illustration-icon`
  - Text: `empty-state/fg-title`, `empty-state/fg-description`

## Changelog

- `0.1.0` — Initial release. Three sizes, slot-driven illustration + actions, optional description.
