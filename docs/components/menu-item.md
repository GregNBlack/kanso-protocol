# MenuItem

> Single option inside a DropdownMenu, context menu, or select dropdown.

## Contract

MenuItem is the atomic row inside any menu-style surface. It supports icons, a label with optional description, and a trailing slot (shortcut / check / chevron / custom). Destructive actions use the `danger` appearance — it's the same component, just a different semantic tone. Checkboxes and radios appear in the leading slot to build multi-select and single-select menus.

### Anatomy

```
Container (horizontal row)
├─ Leading slot (Checkbox / Radio / custom, optional)
├─ Icon Left (optional)
├─ Text
│  ├─ Label
│  └─ Description (optional, lg only)
└─ Trailing slot
   (shortcut text / check icon / chevron / custom)
```

- **Container** — horizontal auto-layout, centered vertically, radius 6px, full-width
- **Leading** — reserved for Checkbox or Radio when the menu is selection-capable
- **Icon Left** — decorative or identifying icon before the label
- **Text** — Label (always visible); Description (secondary line, lg size only)
- **Trailing** — single slot that can hold a keyboard shortcut, check icon (for selected), chevron (for submenu), or arbitrary custom content

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Row height and typography |
| `label` | `string` | `''` | Primary text |
| `description` | `string` | `''` | Secondary text below label (lg recommended) |
| `shortcut` | `string` | `''` | Keyboard shortcut shown on right |
| `hasChevron` | `boolean` | `false` | Show right-pointing chevron for submenu indication |
| `selected` | `boolean` | `false` | Selected state — blue bg, blue fg, auto check icon if no other trailing |
| `danger` | `boolean` | `false` | Red fg and icon tint for destructive actions |
| `disabled` | `boolean` | `false` | Non-interactive |
| `forceState` | `KpState \| null` | `null` | Force visual state — Storybook only |

### Outputs

None — use native `(click)` on `<kp-menu-item>`.

### Content projection

- `[kpMenuItemLeading]` — slot for Checkbox / Radio / avatar before Icon Left
- `[kpMenuItemIcon]` — icon slot left of the text
- `[kpMenuItemTrailing]` — custom trailing content (overrides shortcut / chevron / check)

## Variants

| Dimension | Values |
|-----------|--------|
| Size | sm (28px, 13px text), md (32px, 14px text), lg (40px, 14px text; 52px with description) |
| Trailing Type | none, shortcut, check, chevron, custom |
| Appearance | menu-default, menu-selected, menu-danger (via Variable Mode) |
| State | rest, hover, active, focus, disabled |

## States

| State | Behavior |
|-------|----------|
| rest | Transparent bg, default fg |
| hover | Light gray bg |
| active | Slightly darker gray bg |
| focus | Light gray bg + focus outline |
| selected | Blue tint bg, blue fg, blue icon — shown via `selected` input or `menu-selected` Variable Mode |
| disabled | Muted fg and icon; `aria-disabled="true"`; `pointer-events: none` |

## Accessibility

- **Role**: `menuitem` (default); `menuitemcheckbox` when used with Checkbox; `menuitemradio` when used with Radio
- **Keyboard**: `Arrow Up/Down` navigates; `Enter/Space` activates; `Escape` closes the parent menu
- **Focus**: visible via background change + outline
- **ARIA**:
  - `aria-disabled="true"` when disabled
  - `aria-checked` when used as a checkbox/radio menu item
  - `aria-label` required when label is visual-only (icon + shortcut)
- **Screen reader**: announces role, label, shortcut (if present), and selected/disabled state

## Do / Don't

### Do
- Use the Leading slot for selection controls (Checkbox / Radio) in multi-select or single-select menus
- Pair icons with labels for frequently-used actions — improves scanability
- Use shortcut text to teach keyboard shortcuts, not as decoration
- Use `danger` color for destructive actions, and group them under a "Danger" section label if there are multiple
- Keep labels short — one or two words is the norm; descriptions carry the rest

### Don't
- Don't mix `selected` and custom trailing content that implies selection — pick one
- Don't nest MenuItems — they don't support submenus as children; use a separate DropdownMenu triggered by chevron
- Don't use Icon Left just to fill space — if the action doesn't need an icon, omit it
- Don't use description in sm or md sizes — only lg has the vertical room
- Don't use `danger` for cancel or close — reserve it for actions the user can't undo

## References

- **Figma component**: [`MenuItem` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3073-457)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-dropdownmenu
- **Source**: `packages/components/menu/src/menu-item.component.ts`
- **Tokens used**:
  - `menu-item/bg`, `menu-item/fg`, `menu-item/icon` (State collection)
  - Appearance modes `menu-default`, `menu-selected`, `menu-danger` re-map the same variables

## Changelog

- `0.1.0` — Initial MenuItem with 3 sizes × 5 trailing types
- `0.1.1` — Added `Show Checkbox` / `Show Radio` properties and leading slot
