# TableToolbar

> Panel that sits above a data table. Two modes: everyday search/filter/actions, and a selection summary with bulk actions when rows are selected.

## Contract

`<kp-table-toolbar>` composes the Kanso `SearchBar`, `Button`, and `Badge` into a single horizontal bar. Every optional slot (Filters, Sort, Density, Columns, Export, Create) is a boolean toggle — you dial the toolbar from minimal ("search + create") up to a full admin bar without touching templates.

Switching `mode` to `bulk-select` hides the default bar and shows a selection summary with bulk actions (Export / Tag / Move / Delete). Emit the outputs, keep selection state outside.

## API

### `KpTableToolbarComponent`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | `'default' \| 'bulk-select'` | `'default'` | Which row of controls to render |
| `showSearch` | `boolean` | `true` | Render inline SearchBar |
| `searchPlaceholder` | `string` | `'Search…'` | Placeholder passed to SearchBar |
| `searchValue` | `string` | `''` | Controlled value |
| `showFilter` | `boolean` | `true` | Render "Filters" button |
| `activeFilterCount` | `number` | `0` | Badge count on Filters button |
| `showSort` | `boolean` | `false` | Render "Sort" button |
| `showDensity` | `boolean` | `false` | Render 3-segment density toggle |
| `density` | `'compact' \| 'comfortable' \| 'spacious'` | `'comfortable'` | Active density segment |
| `showColumnPicker` | `boolean` | `false` | Render column-picker icon button |
| `showExport` | `boolean` | `false` | Render ghost "Export" button |
| `showCreate` | `boolean` | `true` | Render primary "Create new" button |
| `createLabel` | `string` | `'Create new'` | Label on the create button |
| `selectedCount` | `number` | `0` | Number shown in `bulk-select` mode |

### Outputs

- **default mode**: `searchChange`, `filterClick`, `sortClick`, `densityChange(density)`, `columnsClick`, `exportClick`, `createClick`
- **bulk-select mode**: `clearSelection`, `bulkExport`, `bulkTag`, `bulkMove`, `bulkDelete`

### Wiring density to a table

`densityChange` is a plain output — the toolbar is presentational and does **not**
resize a table by itself. You own the density state and map it to the table's
`size` (and `virtual-list` / `table-virtual` `rowHeight`). The mapping is 1:1:

| Toolbar density | `kp-table` / `kp-table-virtual` `size` | `rowHeight` |
|---|---|---|
| `compact` | `sm` | `40` |
| `comfortable` *(default)* | `md` | `48` |
| `spacious` | `lg` | `56` |

```ts
// component
readonly DENSITY_SIZE = { compact: 'sm', comfortable: 'md', spacious: 'lg' } as const;
density: KpTableToolbarDensity = 'comfortable';
```

```html
<kp-table-toolbar [showDensity]="true" [density]="density"
                  (densityChange)="density = $event"></kp-table-toolbar>
<kp-table [size]="DENSITY_SIZE[density]"> … </kp-table>
```

Persist `density` yourself (see the Don'ts) — the toolbar keeps no state.

> **App-wide density** (one preference tightening the *whole* shell — forms,
> menus, nav — not just tables) is intentionally not a single switch today:
> Kanso density is per-surface via each component's `size` input. Making it a
> global cascade is a tracked design decision (it would reverse the "spacing is
> structural, not a brand axis" stance in [theming.md](../theming.md) and touch
> every component). Until then, use `size` per surface as above.

## Do / Don't

### Do
- **Swap to `bulk-select` as soon as selection is non-empty** — it frees the bar from "irrelevant" default actions and puts the dangerous one (Delete) in a scoped row with a clear exit (Clear selection).
- **Keep the Filters badge count in sync** with whatever `FilterBar` or filter popover is showing — don't double-count.
- **Pair with `FilterBar` underneath** when you have chip-based filters. TableToolbar opens the picker; FilterBar shows the active state.
- **Show `showExport` and `showColumnPicker` only when they matter** — an export on a 3-row internal table is noise.

### Don't
- Don't render both Filters+Sort+Density+Columns+Export on a sub-1200px table. It wraps ugly. Use sm/md screens to drop Sort/Density into an "…" overflow menu.
- Don't put destructive actions outside `bulk-select` mode. A single delete on a row belongs in the row kebab, not the toolbar.
- Don't make the density toggle save per-user without also writing it somewhere durable — users get frustrated when it resets every session.

## References

- **Figma**: `TableToolbar` Component Set on the [📐 Patterns page](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System).
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-tabletoolbar
- **Source**: `packages/ui/table-toolbar/src/`

## Changelog

- `0.1.0` — Initial release. Default + bulk-select modes, 7 optional slots, 3-segment density toggle.
