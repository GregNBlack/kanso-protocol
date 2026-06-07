# CommandPalette

> Modal command launcher (⌘K-style). Composes `<kp-dialog>` (chromeless) with an internal input + grouped result list. Owns keyboard navigation and an optional global open-shortcut.

## Contract

`<kp-command-palette>` renders a chromeless `<kp-dialog>` containing a search input, a grouped result list, and a footer with kbd hints:

```
<kp-command-palette>
  └─ <kp-dialog [showHeader]=false [showFooter]=false>
      └─ .kp-cmdk
          ├─ .kp-cmdk__input-row   (icon + input + clear)
          ├─ .kp-cmdk__list        (groups → items, role="listbox")
          │   └─ .kp-cmdk__item × N (role="option")
          └─ .kp-cmdk__footer      (↑/↓/↵/esc + open-shortcut)
```

The component is **filter-agnostic**: the consumer owns search state. Every keystroke fires `(filterChange)` — reply by handing back a fresh `[groups]` array (filtered, sorted, async-loaded — your call).

### Keyboard

| Key | Behavior |
|-----|----------|
| ↑ / ↓ | Move active item (skips disabled, wraps) |
| Home / End | Jump to first / last item |
| Enter | Select active item, emit `(itemSelect)`, close palette |
| Esc | Close palette (via dialog) |
| Global `[shortcut]` (default `mod+k`) | Toggle `open` from anywhere on the page |

`mod` resolves to ⌘ on macOS and Ctrl elsewhere — the kbd hint in the footer renders accordingly.

### Sizes

| Size | Dialog width |
|------|--------------|
| sm | sm dialog |
| md | md dialog (default) |
| lg | lg dialog |

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dialog width |
| `open` | `boolean` | `false` | Two-way binding via `[(open)]` |
| `groups` | `KpCommandGroup[]` | `[]` | Result groups; the consumer filters/sorts |
| `filter` | `string` | `''` | Current input value (controlled) |
| `placeholder` | `string` | `'Type a command or search…'` | Input placeholder |
| `emptyMessage` | `string` | `'No results found'` | Shown when `totalItems === 0` |
| `ariaLabel` | `string` | `'Command palette'` | Dialog aria-label |
| `shortcut` | `KpCommandShortcut \| null` | `{ combo: 'mod+k' }` | Global open-shortcut (set `null` to disable) |

### Outputs

| Name | Payload | Fires when |
|------|---------|-----------|
| `(openChange)` | `boolean` | Open state changes (Esc, backdrop, shortcut, item-select) |
| `(filterChange)` | `string` | User types in the input |
| `(itemSelect)` | `KpCommandItem` | User clicks or hits Enter on an item |

### Types

```ts
interface KpCommandShortcut {
  /** Combo, e.g. 'mod+k', 'mod+shift+p', '?'. `mod` = ⌘ on Mac, Ctrl elsewhere. */
  combo: string;
}

interface KpCommandItem {
  id: string;
  label: string;
  hint?: string;        // secondary text after the label
  shortcut?: string;    // visual hint (e.g. 'g s')
  disabled?: boolean;
  data?: unknown;       // your payload (route, action handler, etc.)
}

interface KpCommandGroup {
  id: string;
  label?: string;       // section header
  items: KpCommandItem[];
}
```

## Example

```ts
import { KpCommandPaletteComponent, KpCommandGroup, KpCommandItem } from '@kanso-protocol/ui/command-palette';

@Component({
  imports: [KpCommandPaletteComponent],
  template: `
    <kp-command-palette
      [(open)]="open"
      [groups]="groups()"
      [filter]="filter"
      (filterChange)="filter = $event"
      (itemSelect)="run($event)"
    />
  `,
})
class Demo {
  all: KpCommandGroup[] = [
    { id: 'pages', label: 'Go to', items: [
      { id: 'inbox', label: 'Inbox', shortcut: 'g i' },
      { id: 'settings', label: 'Settings', shortcut: 'g s' },
    ]},
  ];
  filter = '';
  open = false;

  groups() {
    const q = this.filter.toLowerCase().trim();
    if (!q) return this.all;
    return this.all
      .map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q)) }))
      .filter(g => g.items.length > 0);
  }

  run(item: KpCommandItem) {
    // route, dispatch action, etc. The palette closes automatically.
  }
}
```

## Do / Don't

### Do
- Keep filtering on the consumer side — fast for small static lists, async-fetch-friendly for big ones.
- Group by **intent** (Go to / Actions / Help), not by data type. Users scan groups by what they want to do.
- Use `shortcut` strings on items for discoverability — even if you don't bind those shortcuts globally.
- Set a custom `emptyMessage` per context ("Search documentation…" → "No matching docs").

### Don't
- Don't put more than ~30 items on screen without filtering — a palette is for finding, not browsing. If the list is long, force the user to type first.
- Don't use the palette for primary navigation. It's a power-user accelerator on top of regular nav.
- Don't keep the palette open after `(itemSelect)` — the component closes automatically; resist the urge to override it.
- Don't bind `shortcut` to a key that conflicts with the OS or browser (`Cmd+W`, `Cmd+T`, etc.). `Cmd+K` is the de-facto convention.

## References

- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-commandpalette--docs
- **Source**: `packages/ui/command-palette/src/`
- **Composes**: `@kanso-protocol/ui/dialog` (peer)
- **Tokens used**:
  - List bg: `gray.50` (page-level), `gray.100` (active row), `white` (palette surface from dialog)
  - Item label / hint: `gray.900` / `gray.500`
  - kbd background: `gray.100` with `gray.200` border, `gray.700` foreground
  - Focus ring: `accent.primary.fg`

## Changelog

- `0.1.0` — Initial release. Dialog-backed, keyboard nav (↑/↓/Home/End/Enter/Esc), global `mod+k` shortcut (configurable), grouped items with hints + per-item shortcut hints, disabled items skipped in cycling, `aria-activedescendant` ARIA combobox pattern.
