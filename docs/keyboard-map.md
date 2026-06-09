# Keyboard map

The keyboard contract for every interactive Kanso component, in one place. Sourced from each component's `docs/components/<name>.md` accessibility section and its spec. Where a component leans on a native element (`<button>`, `<input>`, native radio group), the browser provides the behavior and it's marked **native**.

Conventions: `Tab` / `Shift+Tab` move between focusable elements everywhere and are omitted per-row unless a component does something special (focus trap, roving tabindex).

## Form controls

| Component | Keys |
|---|---|
| `button` | `Enter` / `Space` activate (native). |
| `checkbox` | `Space` toggles (native). |
| `radio` / `radio-group` | `Arrow` keys move selection within the group; `Space` activates (native radio-group roving). |
| `toggle` | `Space` toggles (native `role="switch"` checkbox). |
| `segmented-control` | `Tab` enters onto the selected segment; `Arrow Left` / `Arrow Right` cycle enabled segments (wraps); `Home` / `End` jump to first / last; `Enter` / `Space` activate. Disabled segments are skipped. |
| `select` | `Space` / `Enter` open the panel; `Escape` closes (native `<select>` arrow behavior inside). |
| `combobox` | Type to filter; `Arrow Up` / `Arrow Down` move the highlight; `Home` / `End` jump to first / last; `Enter` picks the highlighted option; `Escape` closes and clears the query; `Backspace` on an empty query (multi mode) removes the last tag. `aria-activedescendant` tracks the highlight. |
| `input` / `textarea` | All native text-editing keys. |
| `number-stepper` | Type digits (non-numeric stripped); `Enter` or blur clamps to `[min, max]` and commits; the −/+ buttons activate with `Enter` / `Space`. |
| `slider` | `Arrow` keys step by `step`; `Shift`+`Arrow` and `PageUp` / `PageDown` step by `10 × step`; `Home` / `End` jump to min / max (thumb-focused). |
| `form-field` | None directly — focus and keys belong to the wrapped control. |
| `file-upload` | Drop zone is `role="button"`: `Enter` / `Space` open the file browser. |
| `rich-text-editor` | Toolbar buttons are native `<button>`s (`Enter` / `Space`). The editing surface is a TipTap `contenteditable`, so standard rich-text shortcuts apply natively — `mod+B` / `mod+I` / `mod+U` (bold / italic / underline), etc. The link bar: `Enter` applies, `Escape` closes it. |

## Disclosure & navigation

| Component | Keys |
|---|---|
| `accordion` | Trigger is a real `<button>`: `Enter` / `Space` toggle. Focus stays on the toggled trigger in `mode="single"`. |
| `tabs` | Roving tabindex across the strip: `Arrow Left` / `Arrow Right` move between tabs; `Enter` / `Space` activate. |
| `tree` | Roving tabindex over visible nodes: `Arrow Up` / `Arrow Down` move; `Arrow Right` / `Arrow Left` expand / collapse; `Enter` / `Space` select; `Space` toggles the checkbox in `showCheckboxes` mode. |
| `nav-item` | `<button>`-based: `Enter` / `Space` activate. |
| `breadcrumbs` | Crumbs are native `<a>` / `<button>`; current crumb is an inert `<span aria-current="page">`. |
| `pagination` | Page cells and prev/next are native `<button>`s (`Enter` / `Space`). |
| `notification-item` | Row is focusable (`tabindex="0"`): `Enter` / `Space` activate (emits `click$`). |
| `card` | Only when `[clickable]`: host is `role="button"` with `tabindex="0"` — `Enter` / `Space` activate (emit `cardClick`). Plain cards are inert containers. |
| `theme-toggle` | `segmented` variant is a `role="radiogroup"` (`Arrow` keys move + select, like radio-group); `dropdown` variant opens a `role="listbox"` (`Arrow` keys navigate, `Enter` selects, `Escape` closes); `icon` variant is a single `<button>` toggle. |

## Overlays

| Component | Keys |
|---|---|
| `dialog` | Focus is trapped (`Tab` cycles within the panel); `Escape` closes (when enabled); focus is restored to the opener on close. |
| `drawer` | `Escape` closes (when enabled); backdrop click closes. |
| `popover` | `Escape` dismisses; outside click and the built-in close button also dismiss. |
| `tooltip` | `Tab` onto the trigger shows it after the delay; `Escape` dismisses immediately without moving focus off the trigger. |
| `dropdown-menu` | `Arrow Down` / `Arrow Up` move focus through items; `Enter` / `Space` activate; `Escape` closes; `Tab` cycles Search → body → footer when present. |
| `command-palette` | `mod+K` opens (configurable); `Arrow Up` / `Arrow Down` navigate; `Home` / `End` jump; `Enter` runs the highlighted item; `Escape` closes. Disabled items are skipped. |
| `datepicker` | Day cells are `<button>`s: `Tab` / `Shift+Tab` move between them; `Escape` closes the panel. |
| `timepicker` | Column options are buttons; `Escape` cancels (discards the draft and closes). |

## Data

| Component | Keys |
|---|---|
| `table` | Sortable headers are buttons (`Enter` / `Space` to sort, `aria-sort` reflects state); row/select-all checkboxes use `Space`. |
| `virtual-list` | The scroll viewport is focusable and scrolls with the usual `Arrow` / `PageUp` / `PageDown` / `Home` / `End` keys; row interactivity is whatever your row template provides. |

## Non-interactive

These render no focusable interaction of their own and have no keyboard map: `icon`, `divider`, `badge`, `avatar` / `avatar-group`, `skeleton`, `alert` (aside from its optional close button), `empty-state`, `progress`, `tooltip` body, and the layout patterns `container` / `grid` / `row` / `stack` / `banner` / `page-error` / `stat-card`. Their close/action buttons, where present, are native `<button>`s.

---

Maintenance: when a component gains or changes a keyboard behavior, update its row here and the accessibility section of its component doc in the same PR. The per-component docs remain the source of truth; this page is the cross-component index.
