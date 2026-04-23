# SearchBar

> Two variants: **inline** (header/page filter) and **command-palette** (⌘K global search panel).

## Contract

`<kp-search-bar>` is a presentational input. It doesn't filter results itself — it emits what the user types; the consumer owns debouncing, filtering, and item selection.

The `command-palette` variant renders a self-contained panel (input + grouped results + footer hints). It's intended to sit inside a Dialog/Overlay triggered by ⌘K.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'inline' \| 'command-palette'` | `'inline'` | Presentation |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Inline width/height |
| `placeholder` | `string` | `'Search anything...'` | |
| `value` | `string` | `''` | Controlled value |
| `showShortcutHint` | `boolean` | `true` | Render ⌘K kbd hint on inline |
| `shortcutHint` | `string` | `'⌘K'` | Hint label |
| `groups` | `KpSearchResultGroup[]` | `[]` | Rendered only in command-palette variant |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `valueChange` / `search` | `string` | Text input |
| `itemClick` | `KpSearchResultItem` | Palette option clicked |

## Do / Don't

### Do
- **Debounce `search` emissions** in the consumer (250ms+). SearchBar emits on every keystroke.
- **Pair ⌘K with the palette variant** — a global shortcut that opens a dialog containing this.
- **Group results semantically** (Recent / Actions / Pages). 1 group = ~3–6 items; 3–5 groups is usually the sweet spot.

### Don't
- Don't put the palette variant inline on a page — it's built to live inside a dialog overlay.
- Don't emit loading spinners from the SearchBar itself. Compose Spinner inside the palette's groups if needed.

## References

- **Figma**: `SearchBar` Component Set (Patterns page) — inline × 3 sizes × 3 states + command-palette demo
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-searchbar
- **Source**: `packages/patterns/search-bar/src/`
- **Tokens**: `search/palette/bg`, `search/palette/border`, `search/palette/shortcut-*`, `search/palette/group-label`

## Changelog

- `0.1.0` — Initial release. Inline (3 sizes × 3 states) + command-palette variant.
