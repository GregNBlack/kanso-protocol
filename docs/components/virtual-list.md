# VirtualList

> Window-mode virtual scroller for **fixed-height rows**. Renders only visible rows + an overscan buffer. Generic — works with any item shape via a projected `<ng-template kpVirtualRow>`.

## Contract

`<kp-virtual-list>` keeps three things:

- A scroll viewport with a fixed `[viewportHeight]`.
- A spacer with `totalHeight = items.length * itemHeight` — gives the scrollbar realistic dimensions.
- A translated window of rendered rows: only those whose index falls inside `[scrollTop / itemHeight - overscan, ... + visibleCount + overscan]`.

```
<kp-virtual-list>
  └─ .kp-virtual-list__viewport (scrollable, height=viewportHeight)
      └─ .kp-virtual-list__spacer (height=items.length * itemHeight)
          └─ .kp-virtual-list__window (transform: translate3d(0, visibleStart*itemHeight, 0))
              └─ .kp-virtual-list__row × visibleCount  (each height=itemHeight)
```

Math is O(1) per scroll event — `Math.floor(scrollTop / itemHeight)` gives the first visible index. No measurement pass, no layout thrash.

### Why fixed-height only

A variable-height virtual list needs either pre-measured row heights or a measure-on-mount strategy with a position cache. Both add complexity, both risk layout reflow on every scroll, both require careful invalidation when `[items]` changes. Fixed-height is the 90% case for data tables / log views / chat scrolls — start there.

Variable-height is on the roadmap as a separate `<kp-variable-virtual-list>` so the simple fast path stays simple.

### When to use

- ✅ Lists with **>500 rows** of similar shape.
- ✅ Tables with thousands of rows.
- ✅ Log viewers, chat scrolls, message lists.
- ❌ Lists with <100 rows — DOM cost is negligible, virtualization adds complexity for nothing.
- ❌ Rows whose height varies based on content — wait for `<kp-variable-virtual-list>` or use a measured-row library.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `readonly T[]` | `[]` | Full list. The component never iterates the whole thing — only the visible window |
| `itemHeight` | `number` | `40` | Pixel height per row. **Must be uniform.** |
| `viewportHeight` | `number` | `400` | Pixel height of the scroll viewport |
| `overscan` | `number` | `4` | Extra rows above + below the visible range to soften scroll-flicker |
| `trackBy` | `((index: number, item: T) => unknown) \| null` | `null` | Optional trackBy. Defaults to absolute row index |

### Outputs

| Name | Payload | Fires when |
|------|---------|-----------|
| `(rangeChange)` | `{ start: number; end: number }` | Visible window changes (debounced via microtask). `start` inclusive, `end` exclusive |

### Imperative methods

| Method | Purpose |
|--------|---------|
| `scrollToIndex(index, position?)` | Scroll a row into view. `position` is `'start'` (default), `'center'`, or `'end'` |

### Slot

`<ng-template kpVirtualRow let-item let-i="index">` — your row template. The component renders one of these per visible row. The `index` is the absolute row index in the full list, not the window-relative index.

## Example

```ts
import { KpVirtualListComponent, KpVirtualRowDirective } from '@kanso-protocol/virtual-list';

@Component({
  imports: [KpVirtualListComponent, KpVirtualRowDirective],
  template: `
    <kp-virtual-list
      [items]="rows"
      [itemHeight]="44"
      [viewportHeight]="480"
      [overscan]="6"
      [trackBy]="trackById"
      (rangeChange)="onRange($event)"
    >
      <ng-template kpVirtualRow let-row let-i="index">
        <div class="row" [class.row--alt]="i % 2">
          <span>#{{ row.id }}</span>
          <span>{{ row.name }}</span>
        </div>
      </ng-template>
    </kp-virtual-list>
  `,
})
class Demo {
  @ViewChild(KpVirtualListComponent) list!: KpVirtualListComponent;
  rows = Array.from({ length: 10_000 }, (_, i) => ({ id: i, name: `Row ${i}` }));
  trackById = (_: number, row: { id: number }) => row.id;

  jumpToRow5000() {
    this.list.scrollToIndex(5000, 'center');
  }

  onRange(r: { start: number; end: number }) {
    // Useful for: loading data on demand, prefetching above/below the window,
    // updating a "Showing 1-20 of 10000" indicator.
  }
}
```

## Do / Don't

### Do
- Match `[itemHeight]` to your row's actual rendered height — including padding, borders, and any `border-bottom`. A 1px mismatch over thousands of rows produces visible misalignment.
- Set `[viewportHeight]` explicitly (don't rely on flex/auto). The component uses it directly in math.
- Use `[trackBy]` with a stable id when items have a natural key — avoids row recreation when the array updates.
- Plan for the `(rangeChange)` event for "load more" patterns — it fires per scroll-window-shift, not per pixel.

### Don't
- Don't use this for lists with variable row heights. Picking a "max" height and clipping content makes the list look broken; picking a "min" creates dead space. Wait for `<kp-variable-virtual-list>`.
- Don't put click handlers on the component host — they'll only fire for visible rows. Bind handlers in your `kpVirtualRow` template instead.
- Don't try to read `visibleStart` / `visibleEnd` from outside the component for filtering — those describe the render window, not user-visible rows. Filter `[items]` upstream.
- Don't mutate `[items]` in place (`.push`, `.splice`). Always replace with a new array — Angular's CD compares by reference for inputs.

## Roadmap

- **`v0.2.x`** — sticky group headers (e.g. "Today / Yesterday / Last week" in chat lists).
- **`v0.3.x`** — `<kp-variable-virtual-list>` sibling component for measured-height rows.
- **`v0.4.x`** — `IntersectionObserver`-based "load more" helper directive.

## References

- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-virtuallist--docs
- **Source**: `packages/components/virtual-list/src/`
- **Tokens used**: none — fully consumer-styled via the `kpVirtualRow` template.

## Changelog

- `0.1.0` — Initial release. Fixed-height window-mode virtualization, `[overscan]`, `[trackBy]`, `(rangeChange)` event, imperative `scrollToIndex(index, 'start' | 'center' | 'end')`, ARIA `role="list"` + per-row `role="listitem"` with `aria-rowcount` / `aria-rowindex`.
