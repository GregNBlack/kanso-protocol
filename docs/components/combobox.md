# Combobox

> Select with an embedded text input for filtering options. Single and multiple selection.

## Contract

`<kp-combobox>` is a Select-shaped control where the trigger is a real text field. Typing into it narrows the option list via case-insensitive substring match; matches are highlighted. Pick with click, `Enter`, or `Tab`. Shares the Input size ramp (`xs / sm / md / lg / xl`) so it composes with the rest of the form grammar.

### Anatomy

```
Combobox
├─ Trigger (focuses on click, holds the query text)
│   ├─ Multi-summary        — "3 selected" when closed in multi mode
│   ├─ Input                — filter query + aria-expanded / aria-activedescendant
│   ├─ Clear                — × button (when a value is set)
│   └─ Chevron              — rotates when open
└─ Dropdown (listbox, appears below trigger)
    ├─ Option                — with optional checkbox (multi) + <mark>-highlighted match
    └─ Empty state           — "No results found"
```

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size ramp (inherits Input's grammar) |
| `options` | `KpComboboxOption[]` | `[]` | `{ value, label, disabled? }` list |
| `placeholder` | `string` | `'Search or select…'` | Shown when no value |
| `emptyMessage` | `string` | `'No results found'` | Shown when the filtered list is empty |
| `multiple` | `boolean` | `false` | Multi-select mode |
| `showClear` | `boolean` | `true` | Show the × clear affordance |
| `disabled` | `boolean` | `false` | Disable the whole control |
| `ariaLabel` | `string` | `''` | Accessible label forwarded to the `<input>` |
| `forceState` | `KpState \| null` | `null` | Pin visual state (`hover`, `focus`, `error`, `disabled`) for docs |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `openChange` | `boolean` | Dropdown opens / closes |
| `queryChange` | `string` | User types in the filter input |

### Forms

Implements `ControlValueAccessor`. In single mode `ngModel` is a `string \| null`; in multi mode it's `string[]`.

```html
<kp-combobox [options]="fruits" [(ngModel)]="fruit"/>
<kp-combobox [multiple]="true" [options]="tags" [(ngModel)]="picked"/>
```

## States

| State | Behavior |
|-------|----------|
| rest | Neutral border, placeholder visible |
| hover | Border darkens |
| focus / open | Border turns blue; dropdown visible when open |
| disabled | Muted background, no interaction |
| error | Red border |

## Accessibility

- **Roles**: `role="combobox"` on the `<input>`, `role="listbox"` on the dropdown, `role="option"` on each row.
- **ARIA**:
  - `aria-expanded` tracks open state
  - `aria-autocomplete="list"`
  - `aria-controls` + matching `id` on the listbox
  - `aria-activedescendant` points to the current keyboard-highlighted option
  - `aria-selected` on selected options; `aria-multiselectable` on the listbox when `multiple`
- **Keyboard**:
  - `↓` / `↑` — move the highlight; skips disabled options
  - `Home` / `End` — jump to first / last
  - `Enter` — pick the highlighted option
  - `Escape` — close the dropdown and clear the query
  - `Backspace` on an empty query in multi mode — remove the last picked tag
- **Click-outside** closes the dropdown; focus returns naturally to where the user clicked.

## Do / Don't

### Do
- Pair long lists of known values (countries, tags, SKUs) with Combobox — the filter makes them scannable.
- Provide a short `placeholder` that hints at the search, e.g. `"Search countries…"`.
- Use `multiple` when users routinely pick more than one value; otherwise stick with single.

### Don't
- Don't use Combobox for free-form input — it snaps to known options on commit. If users need to type arbitrary strings, use `<kp-input>` + a suggestions menu.
- Don't put more than ~500 options in the default (synchronous) mode. For async / remote results, render `options` from your query observable and let the component filter the displayed slice.
- Don't hide the clear affordance when a value is set — users expect to reset without opening a menu.

## References

- **Figma component**: [`Combobox` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-combobox
- **Source**: `packages/components/combobox/src/`
- **Tokens used**:
  - Input border / background (shared with `<kp-input>`, `<kp-select>`)
  - Match highlight: `combobox/highlight`

## Changelog

- `0.1.0` — Initial release. Single + multi, 5 sizes, keyboard navigation, match-highlighting, full CVA support.
