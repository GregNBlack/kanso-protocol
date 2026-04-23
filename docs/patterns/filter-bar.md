# FilterBar

> Horizontal strip of active filter chips with an "Add filter" affordance and optional Save / Clear all actions. Sits under a TableToolbar or any filterable view.

## Contract

`<kp-filter-bar>` renders one closable `Badge` chip per active filter and emits events for removal / add / save / clear. State lives outside — the component is purely presentational.

Each chip's label carries both the facet name and the value (`"Status: Active"`, `"Category: 3 selected"`). For multi-value facets, format the label yourself — the chip itself is single-line.

## API

### `KpFilterBarComponent`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `filters` | `KpFilterChip[]` | `[]` | One chip per active filter |
| `showAddFilter` | `boolean` | `true` | Render "+ Add filter" button (opens a picker in your app) |
| `showSaveFilter` | `boolean` | `false` | Render "Save filter" ghost action |
| `showClearAll` | `boolean` | `true` | Render "Clear all" — auto-hidden when there are no chips |

### `KpFilterChip`

```ts
interface KpFilterChip {
  id: string;
  label: string;                   // "Status: Active"
  color?: 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}
```

### Outputs

- `removeFilter(id: string)` — chip close button clicked
- `addFilter()` — "+ Add filter" clicked (open your filter picker)
- `saveFilter()` — "Save filter" clicked (persist the current set as a preset)
- `clearAll()` — "Clear all" clicked

## Do / Don't

### Do
- **Give semantic chips a colour**. A danger-red `Level: Error` chip reads faster than the generic neutral — use `color: 'danger'` for errors, `success` for positive states, `primary` for a "pinned" facet.
- **Pair FilterBar with TableToolbar above**. Toolbar's "Filters" button opens the picker; FilterBar shows the active state. Don't duplicate filter state in the toolbar dropdown.
- **Wrap chips on narrow widths** — the component already sets `flex-wrap: wrap` with a `row-gap`, so there's no horizontal scroll.

### Don't
- Don't let chip labels grow past ~40 chars. If a facet has many values, summarise as `"Category: 3 selected"` and show the list in a popover on hover.
- Don't render a FilterBar with `showAddFilter=false` *and* no chips — there's nothing to interact with. Hide the whole component instead.
- Don't emit `clearAll` if the user only removed one chip; use `removeFilter(id)` and let the consumer update `filters`.

## References

- **Figma**: `FilterBar` Component Set on the [📐 Patterns page](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System).
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-filterbar
- **Source**: `packages/patterns/filter-bar/src/`

## Changelog

- `0.1.0` — Initial release. Closable Badge chips, Add / Save / Clear ghost actions, per-chip colour.
