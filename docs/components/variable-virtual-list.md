# VariableVirtualList

> Window-mode virtual scroller for **variable-height rows** — the sibling to [VirtualList](./virtual-list.md), which stays deliberately simple for the fixed-height fast path. Renders only visible rows + an overscan buffer, sizing each row via a `[itemHeight]` function. Generic — works with any item shape via a projected `<ng-template kpVariableVirtualRow>`.

## Contract

`<kp-variable-virtual-list>` keeps three things:

- A scroll viewport with a fixed `[viewportHeight]`.
- A spacer with `totalHeight = Σ itemHeight(i, items[i])` — gives the scrollbar realistic dimensions.
- A translated window of rendered rows: those whose cumulative offset falls inside the visible span (± `overscan`).

```
<kp-variable-virtual-list>
  └─ .kp-variable-virtual-list__viewport (scrollable, height=viewportHeight)
      └─ .kp-variable-virtual-list__spacer (height=Σ row heights)
          └─ .kp-variable-virtual-list__window (transform: translate3d(0, offsets[visibleStart], 0))
              └─ .kp-variable-virtual-list__row × visibleCount  (each height=itemHeight(index, item))
```

On every `[items]` / `[itemHeight]` change it builds a **cumulative-offset prefix-sum array** (`offsets[i]` = summed height of rows `0..i-1`, `offsets[n]` = total height). Mapping `scrollTop` → first visible row is then a **binary search** over that array — `O(log n)` per scroll, versus the `O(1)` of the fixed variant. No per-scroll measurement pass, no layout thrash.

### Fixed-height equivalence

When every row is the same height `h`, the offsets are exactly `i * h` and the visible-window / transform math reduces to the fixed-height behaviour — a uniform `[itemHeight]` is byte-for-byte equivalent to [`<kp-virtual-list>`](./virtual-list.md). Reach for VirtualList when heights are uniform (simpler, `O(1)`); reach for this when they genuinely vary.

### When to use

- ✅ Chat / comment / feed rows whose height depends on content length.
- ✅ Tables with wrapping cells or expandable rows.
- ✅ Any long list where a single `itemHeight` would clip or leave dead space.
- ❌ Uniform-height rows — use [`<kp-virtual-list>`](./virtual-list.md); the fixed math is cheaper.
- ❌ Lists with <100 rows — DOM cost is negligible, virtualization adds complexity for nothing.
- ❌ Rows whose height cannot be known ahead of paint — you would need a measure-on-mount library; this component trusts the `[itemHeight]` function.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `readonly T[]` | `[]` | Full list. The component never iterates the whole thing on scroll — only the visible window |
| `itemHeight` | `(index: number, item: T) => number` | `() => 40` | Per-row pixel height. Must be pure and stable for a given `[items]`. Uniform values reduce to fixed-height behaviour |
| `estimatedItemHeight` | `number` | `40` | Fallback used when `itemHeight` returns a non-finite / non-positive value |
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
| `rowHeightAt(index)` | Rendered pixel height of a row, read from the offset cache |

### Slot

`<ng-template kpVariableVirtualRow let-item let-i="index">` — your row template. The component renders one per visible row and sizes it to `itemHeight(index, item)`. The `index` is the absolute row index in the full list, not the window-relative index.

## Example

```ts
import {
  KpVariableVirtualListComponent,
  KpVariableVirtualRowDirective,
  KpItemHeightFn,
} from '@kanso-protocol/ui/variable-virtual-list';

@Component({
  imports: [KpVariableVirtualListComponent, KpVariableVirtualRowDirective],
  template: `
    <kp-variable-virtual-list
      [items]="messages"
      [itemHeight]="heightFor"
      [viewportHeight]="480"
      [overscan]="6"
      [trackBy]="trackById"
      (rangeChange)="onRange($event)"
    >
      <ng-template kpVariableVirtualRow let-msg let-i="index">
        <div class="msg">{{ msg.body }}</div>
      </ng-template>
    </kp-variable-virtual-list>
  `,
})
class Demo {
  @ViewChild(KpVariableVirtualListComponent) list!: KpVariableVirtualListComponent;
  messages = loadMessages(); // each has a known line count
  // Height must match what the template actually renders.
  heightFor: KpItemHeightFn<Message> = (_i, m) => 40 + m.lines * 20;
  trackById = (_: number, m: { id: number }) => m.id;

  jumpToLatest() {
    this.list.scrollToIndex(this.messages.length - 1, 'end');
  }

  onRange(r: { start: number; end: number }) {
    // Load more / prefetch above + below the window.
  }
}
```

## Do / Don't

### Do
- Make `[itemHeight]` return the row's **actual** rendered height — chrome, padding, borders, and any `border-bottom` included. A drift over thousands of rows produces visible misalignment.
- Keep `[itemHeight]` pure and derive it from the item's own data (line count, has-image, …) so it is stable across CD passes.
- Replace `[items]` with a new array on change — the offset index rebuilds on the new reference. Angular compares inputs by reference.
- Use a uniform `[itemHeight]` only as a stop-gap — if heights are truly uniform, switch to [`<kp-virtual-list>`](./virtual-list.md).

### Don't
- Don't return a different height for the same `(index, item)` across renders — the offset cache assumes stability; jitter causes the window to jump.
- Don't put click handlers on the component host — they only fire for visible rows. Bind handlers inside your `kpVariableVirtualRow` template.
- Don't read `visibleStart` / `visibleEnd` from outside for filtering — they describe the render window, not user-visible rows. Filter `[items]` upstream.
- Don't mutate `[items]` in place (`.push`, `.splice`). Always replace with a new array.

## References

- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-variablevirtuallist--docs
- **Source**: `packages/ui/variable-virtual-list/src/`
- **Sibling**: [`<kp-virtual-list>`](./virtual-list.md) — fixed-height fast path
- **Tokens used**: none — fully consumer-styled via the `kpVariableVirtualRow` template.

## Changelog

- `0.1.0` — Initial release. Variable-height window-mode virtualization via a cumulative-offset binary search, `[itemHeight]` function, `[estimatedItemHeight]` fallback, `[overscan]`, `[trackBy]`, `(rangeChange)` event, imperative `scrollToIndex(index, 'start' | 'center' | 'end')` and `rowHeightAt(index)`, ARIA `role="list"` + per-row `role="listitem"` with `aria-setsize` / `aria-posinset`. Uniform `[itemHeight]` is equivalent to `<kp-virtual-list>`.
