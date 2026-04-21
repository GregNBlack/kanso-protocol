# Pagination

> Minimal page-strip — a container (`<kp-pagination>`) plus a reusable atom (`<kp-pagination-item>`). Ghost by default, subtle pill on hover, primary pill on the current page.

## Contract

Pagination is a two-part component: `<kp-pagination>` is the strip (computes the visible range from `currentPage` / `totalPages`, emits `(pageChange)`, and embeds an optional items-per-page `<kp-select>`), and `<kp-pagination-item>` is each cell (a page-pill, a prev/next nav button, or an inert `…` ellipsis). The container is data-driven — you give it state, it gives you events back.

### Anatomy

```
<kp-pagination> (nav aria-label="Pagination")
├─ <span class="kp-pg__info">Showing 41–50 of 1234</span>   (optional)
├─ <div class="kp-pg__controls">
│   ├─ <kp-pagination-item type="nav" navDirection="prev"/> (optional)
│   ├─ <kp-pagination-item type="page" [page]="1"/>
│   ├─ <kp-pagination-item type="ellipsis"/>
│   ├─ <kp-pagination-item type="page" [page]="5" [selected]="true"/>
│   ├─ <kp-pagination-item type="ellipsis"/>
│   ├─ <kp-pagination-item type="page" [page]="20"/>
│   └─ <kp-pagination-item type="nav" navDirection="next"/>
└─ <div class="kp-pg__per-page">                            (optional)
    ├─ <span>Per page</span>
    └─ <kp-select [options]="[25,50,75,100]" [(ngModel)]="itemsPerPage"/>
```

- **Info text** is derived from `currentPage`, `itemsPerPage`, `itemsTotal` — the component formats `"Showing X–Y of Z"` itself.
- **Controls** interleave pages with ellipses automatically; the algorithm (see [Truncation](#truncation) below) mirrors MUI's usePagination with configurable `siblingCount` and `boundaryCount`.
- **Items-per-page** is a real `<kp-select>` instance sized to match the pagination — same size cascade as the controls.

### Sizes

| Size | Item h | Radius | Icon | Font | Outer gap | Ctrl gap |
|------|--------|--------|------|------|-----------|----------|
| sm   | 28     | 10     | 14   | 12   | 12        | 4        |
| md   | 36     | 14     | 16   | 14   | 16        | 6        |
| lg   | 44     | 16     | 18   | 14   | 16        | 6        |

Page pills are rounded-square, not fully pill — the radius is size-specific so `lg` still looks proportionate. The selected pill still reads as "the active page" even when the container is dense.

## API — `<kp-pagination>`

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Cascades to items + embedded `<kp-select>` |
| `navMode` | `'icon' \| 'text' \| 'icon-text'` | `'icon'` | Prev/Next appearance |
| `currentPage` | `number` | `1` | 1-indexed active page |
| `totalPages` | `number` | `1` | Total number of pages |
| `showPrevNext` | `boolean` | `true` | Render the prev/next nav buttons |
| `showItemsInfo` | `boolean` | `false` | Render `"Showing X–Y of Z"` on the left |
| `showItemsPerPage` | `boolean` | `false` | Render the `Per page` select on the right |
| `itemsPerPage` | `number` | `50` | Current page-size (drives info text + select value) |
| `itemsTotal` | `number` | `0` | Total item count (drives info text) |
| `itemsPerPageOptions` | `number[]` | `[25, 50, 75, 100]` | Dropdown choices |
| `itemsPerPageLabel` | `string` | `'Per page'` | Label next to the select |
| `siblingCount` | `number` | `1` | Pages shown on each side of current in middle-truncation |
| `boundaryCount` | `number` | `1` | Pages pinned at each edge |
| `ariaLabel` | `string` | `'Pagination'` | `aria-label` on the wrapping nav |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `pageChange` | `EventEmitter<number>` | Emits the new 1-indexed page on user click. Caller updates `currentPage` |
| `itemsPerPageChange` | `EventEmitter<number>` | Emits the new page-size from the per-page `<kp-select>` |

## API — `<kp-pagination-item>`

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Usually set by the parent |
| `type` | `'page' \| 'nav' \| 'ellipsis'` | `'page'` | Cell role |
| `page` | `number \| null` | `null` | 1-indexed page number (for `type="page"`) |
| `selected` | `boolean` | `false` | Marks the current page — primary pill + `aria-current="page"` |
| `disabled` | `boolean` | `false` | Greys out and suppresses clicks |
| `navMode` | `'icon' \| 'text' \| 'icon-text'` | `'icon'` | For `type="nav"` |
| `navDirection` | `'prev' \| 'next'` | `'prev'` | For `type="nav"` |
| `navLabel` | `string \| null` | `null` | Override for nav text (defaults to `'Previous'` / `'Next'` based on direction via the container) |
| `ariaLabel` | `string \| null` | `null` | Override auto-generated aria-label (`"Go to page N"`, `"Previous page"`, etc.) |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `itemClick` | `EventEmitter<MouseEvent>` | Fires when a non-disabled, non-selected item is clicked |

## Truncation

The visible range is computed from `currentPage`, `totalPages`, `siblingCount`, and `boundaryCount`. The algorithm is borrowed from MUI's `usePagination` — it always renders `boundaryCount` pages at each edge plus `siblingCount` around the current, and inserts ellipsis gaps where a contiguous range would waste horizontal space.

With the defaults (`boundaryCount=1`, `siblingCount=1`):

- **Few pages** (`totalPages ≤ 7`): `1 2 3 4 5 6 7` — no truncation.
- **Current near start** (`currentPage ≤ 4`): `1 2 3 4 5 … 20`.
- **Current in middle** (`5 ≤ currentPage ≤ 16`): `1 … 9 10 11 … 20`.
- **Current near end** (`currentPage ≥ 17`): `1 … 16 17 18 19 20`.

Bump `siblingCount` for wider "window" around the current page; bump `boundaryCount` to pin more pages at each edge (e.g. `boundaryCount=2` → `1 2 … 10 … 19 20`).

## Accessibility

- Container wraps content in `<nav role="navigation" aria-label="Pagination">` — the [ARIA pagination pattern](https://www.w3.org/WAI/ARIA/apg/patterns/).
- Page items are real `<button>`s; the selected one has `aria-current="page"` (the standard screen-reader cue for "you are here").
- Nav icons carry `aria-label="Previous page"` / `aria-label="Next page"` when in `navMode="icon"`; text/icon-text modes already have visible labels.
- Ellipsis is `role="presentation"` + `aria-hidden="true"` — screen readers skip it.
- Each page button's `aria-label` is auto-generated: `"Go to page 3"` / `"Page 3, current page"`. Override via `ariaLabel` when needed.
- Prev/Next get `disabled` automatically when at the boundary (`currentPage === 1` / `currentPage === totalPages`).

## Do / Don't

### Do
- Drive `[currentPage]` from your own store/signal and react to `(pageChange)` — the component is a controlled view, not a state holder.
- Set `showItemsInfo` + `showItemsPerPage` together for table-style layouts where users expect density controls next to the page strip.
- Use `navMode="icon-text"` on surfaces where the action isn't obvious from context (marketing lists, blog indexes).
- Let the truncation algorithm pick ellipsis placement — don't manually compose the items array unless you need something genuinely custom.

### Don't
- Don't use Pagination for infinite scroll / load-more UIs — that's a different pattern.
- Don't disable the page pills themselves; disabled pagination items read as "this page exists but you can't visit it", which is rarely what you mean. Hide the pagination if the whole dataset fits on one page.
- Don't mix `size` with a different-sized `<kp-select>` for per-page — let the container's size cascade.
- Don't hardcode `totalPages=0` — use `[showPrevNext]="totalPages > 1"` guards in the host component if you render the strip while data is still loading.

## References

- **Figma components**: [`Pagination` container](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3410-10940) · [`PaginationItem` atom](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3406-5263)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-pagination
- **Source**: `packages/components/pagination/src/`
- **Tokens used**:
  - Item bg per state: `pagination/item/bg/{rest|hover|active|selected|disabled}`
  - Item fg per state: `pagination/item/fg/{rest|hover|active|selected|disabled}`
  - Item icon per state: `pagination/item/icon/{rest|hover|active|selected|disabled}`
  - Ellipsis: `pagination/ellipsis`
  - Info + per-page label: `pagination/info`
  - Focus: `color/focus/ring`
  - Typography: palette Text Styles (`text/xs`, `text/sm`) mapped by size

## Changelog

- `0.1.0` — Initial release. `<kp-pagination>` container with `size`, `navMode`, `currentPage`/`totalPages`, items info + per-page slots, and automatic truncation via `siblingCount` / `boundaryCount`. `<kp-pagination-item>` atom with `page` / `nav` / `ellipsis` types, state-driven ghost→subtle→primary styling, and rounded-square page pills (radius `sm=10`, `md=14`, `lg=16`).
