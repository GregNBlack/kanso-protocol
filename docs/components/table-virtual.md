# TableVirtual

> A windowed table for large datasets (>500 rows). `<kp-table>` + `<kp-virtual-list>` baked together so you don't wire virtualization by hand: a sticky header over a virtualized body, only the visible rows in the DOM.

## Contract

`<kp-table-virtual>` renders a sticky header row above a `<kp-virtual-list>` of data rows. Header and rows share one CSS grid template, so columns line up — give each column a `width` (any CSS length) or they share `1fr`. Row height is **fixed** (`[rowHeight]`, no per-row measurement) which is what keeps scrolling cheap.

For small, fully-rendered tables (sort, selection, `<500` rows) use [`<kp-table>`](./table.md). This component is purpose-built for the long-list case and intentionally omits sort/selection — compose those over your data.

### Inputs

| Input | Type | Default | Notes |
|-------|------|---------|-------|
| `columns` | `KpTableColumn<T>[]` | `[]` | Reuses Table's column model (`id` · `label` · `width?` · `align?` · `accessor?`). |
| `data` | `T[]` | `[]` | The full dataset — only the visible window is rendered. |
| `rowHeight` | `number` | `48` | Fixed px height per row. |
| `viewportHeight` | `number` | `480` | Height of the scrolling body. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding + font ramp. |
| `striped` / `bordered` | `boolean` | `false` | Visual variants matching `<kp-table>`. |
| `overscan` | `number` | `4` | Extra rows rendered above/below the viewport. |
| `trackBy` | `(i, item) => unknown \| null` | `null` | Identity for efficient re-render. |
| `ariaLabel` | `string \| null` | `null` | Accessible name for the list. |

### Outputs

| Output | Payload | When |
|--------|---------|------|
| `(rowClick)` | `T` | A row is clicked. |

### Cells

Plain columns render `accessor(row)`. For rich cells (badges, links), project a per-column template:

```html
<kp-table-virtual [columns]="cols" [data]="rows" ariaLabel="Users">
  <ng-template kpVirtualTableCell="status" let-row>
    <kp-badge size="sm" appearance="subtle" [color]="tone(row.status)">{{ row.status }}</kp-badge>
  </ng-template>
</kp-table-virtual>
```

### Accessibility

Semantics mirror `<kp-virtual-list>` — a **labelled list** of rows (`role="list"`/`listitem` with `aria-setsize`/`aria-posinset`), not a `role="grid"`. ARIA grid semantics over a windowed (partially-rendered) set aren't sound, so a labelled list is the honest, screen-reader-correct choice. Give it an `[ariaLabel]`. Keyboard: the viewport is focusable and scrolls with `Arrow` / `PageUp/Down` / `Home/End`.
