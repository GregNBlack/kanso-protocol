# Table

> Data-driven table. Columns schema + row data, with sortable headers, optional selection, striped / bordered variants, and template-per-column cell rendering.

## Contract

`<kp-table>` takes a `[columns]` schema and `[data]` array and renders an HTML `<table>`. Cells render via one of two paths:

1. **Accessor fallback** — `column.accessor: (row) => value` returns the raw value to print. Fast path for simple strings / numbers.
2. **Template** — `<ng-template kpTableCell="id" let-row let-i="index">` renders whatever you want inside the cell. Used for badges, action buttons, custom formatting.

Header labels can likewise be templated via `<ng-template kpTableHeader="id">` when the plain label isn't enough (tooltips, custom sort widgets).

### Anatomy

```
Table
├─ Header row
│   ├─ [Select-all checkbox]
│   └─ Header cells  — label + sort indicator (if column.sortable)
└─ Body
    └─ Row  — [checkbox] + cells + optional selected styling
```

## API

### `<kp-table>` inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Row height + padding |
| `columns` | `KpTableColumn<T>[]` | `[]` | Column schema |
| `data` | `T[]` | `[]` | Row data |
| `striped` | `boolean` | `false` | Zebra stripes on alternating rows |
| `bordered` | `boolean` | `false` | 1px outer border + rounded corners |
| `selectable` | `boolean` | `false` | Add checkbox column; row clicks toggle selection |
| `selected` | `T[]` | `[]` | Two-way bindable — currently selected rows |
| `sort` | `KpTableSort \| null` | `null` | Two-way bindable — active sort (you apply it to `data`) |
| `emptyMessage` | `string` | `'No data'` | Shown when `data` is empty |
| `trackBy` | `(row: T, i: number) => unknown` | `null` | Override row tracking for `@for` |

### `<kp-table>` outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `selectedChange` | `T[]` | Selection changes |
| `sortChange` | `KpTableSort \| null` | User clicks a sortable header (third click clears) |
| `rowClick` | `T` | A row is clicked (independent of selection toggle) |

### `KpTableColumn<T>`

```ts
interface KpTableColumn<T = unknown> {
  id: string;                                  // stable id — referenced by kpTableCell / kpTableHeader
  label: string;                               // header text
  align?: 'left' | 'center' | 'right';          // cell + header alignment
  sortable?: boolean;                          // show sort indicator, fire sortChange on click
  width?: string;                              // CSS length for the th's width
  accessor?: (row: T) => unknown;              // fallback when no cell template exists
}

interface KpTableSort {
  columnId: string;
  direction: 'asc' | 'desc';
}
```

### Templates

```html
<kp-table [columns]="cols" [data]="rows">
  <ng-template kpTableCell="status" let-row>
    <kp-badge [color]="row.active ? 'success' : 'neutral'">
      {{ row.active ? 'Active' : 'Inactive' }}
    </kp-badge>
  </ng-template>

  <ng-template kpTableHeader="status">
    Status <span aria-label="Help">?</span>
  </ng-template>
</kp-table>
```

## Sorting

The component emits `sortChange` but does NOT sort `data` for you — hand the new sort spec to your data layer (API query, in-memory sort, RxJS pipe) and hand back a sorted array via `[data]`.

The third click on an already-sorted column clears sort (emits `null`).

## Selection

- `selectable="true"` inserts a checkbox column.
- Row clicks toggle selection (ignore if you stop propagation in a custom cell template).
- Header "select all" toggles between all rows and none.

Selection is index-blind — it compares rows by reference. Provide `trackBy` if the same row identity can shift between renders (e.g., after refetch).

## Accessibility

- Semantic `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<th scope="col">` / `<td>`.
- Sortable headers carry `aria-sort="ascending" | "descending" | "none"`.
- Checkboxes carry row-specific `aria-label`.
- Tab / space interacts with checkboxes and sortable header buttons.

## Do / Don't

### Do
- Use `accessor` for plain text/number columns — it's lighter than a template.
- Template complex cells (badges, avatars, action menus) rather than returning HTML from `accessor`.
- Externalize sorting/paging — `<kp-table>` renders state; your data layer owns it.

### Don't
- Don't embed a full action menu inside the row click zone — wrap actions in a cell template with `(click)="$event.stopPropagation()"`.
- Don't rely on `selected` identity matching after a data refetch — provide a stable `trackBy`.

## References

- **Figma component**: [`Table` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System) (pending)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-table
- **Source**: `packages/components/table/src/`
- **Tokens**: `table/header-*`, `table/row-*`, `table/border`, `table/border-soft`

## Changelog

- `0.1.0` — Initial release. Columns schema, template-per-column rendering, sortable headers, selection with tri-state select-all, striped / bordered variants, 3 sizes.
