# DropdownMenu

> Floating panel container that groups menu items with optional search and footer.

## Contract

DropdownMenu is the floating surface shown after a trigger (button click, right-click, Enter key). It handles container chrome — border, radius, shadow, elevation — and delegates content to MenuItem, MenuDivider, and MenuSectionLabel. Optional Search and Footer elements extend it into a filterable panel or a confirmation dialog.

### Anatomy

```
Container (panel, drop-shadow, border, radius)
├─ Search (optional, top)
│  ├─ Input with search icon
│  └─ Divider
├─ Body (scrollable when content overflows)
│  └─ MenuItem / MenuDivider / MenuSectionLabel (projected)
└─ Footer (optional, bottom)
   ├─ Divider
   └─ Buttons row (Primary first, Cancel ghost — either 1 or 2 buttons)
```

- **Container** — min-width 220, max-width 320, max-height 480 in code; 320 in Figma
- **Search** — built-in Input with left-side search icon, placeholder "Search...", emits to parent
- **Body** — vertical stack of projected content; scrolls when content exceeds max-height
- **Footer** — divider + button row with 1 or 2 equal-width buttons (gap 8px)

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `hasSearch` | `boolean` | `false` | Render the search Input at the top |
| `hasFooter` | `boolean` | `false` | Render the footer button row at the bottom |
| `showCancel` | `boolean` | `true` | Show the Cancel button alongside Primary (2 buttons); `false` = only Primary (1 button) |
| `primaryLabel` | `string` | `'Confirm'` | Primary button text |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button text |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `searchValue` | `string` | `''` | Current search input value |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `searchChange` | `string` | User types in the search input |
| `primary` | `void` | User clicks the primary button |
| `cancel` | `void` | User clicks the cancel button |

### Content projection

- `ng-content` — MenuItem / MenuDivider / MenuSectionLabel in any order

## Variants

| Dimension | Values |
|-----------|--------|
| Size | sm, md, lg (matches the size of contained MenuItems) |
| Has Search | boolean |
| Has Footer | boolean |
| Show Cancel | boolean (controls 1- vs 2-button footer) |

## States

DropdownMenu itself has no interactive states. The menu items inside react to their own hover/focus/selected states.

Open/closed is a parent concern — the trigger decides when to render DropdownMenu.

## Accessibility

- **Role**: `menu`
- **Keyboard**:
  - `Arrow Down / Arrow Up` move focus through items
  - `Enter / Space` activate the focused item
  - `Escape` closes the menu (handled by the trigger)
  - `Tab` (inside footer) moves through Search → body → footer buttons
- **Focus**:
  - When the menu opens, focus moves to the first interactive element (search field if present, otherwise first menu item)
  - When the menu closes, focus returns to the trigger
- **ARIA**:
  - `role="menu"` on the panel
  - `aria-labelledby` referencing the trigger's id
  - Individual MenuItems use their own roles (`menuitem`, `menuitemcheckbox`, `menuitemradio`)
- **Screen reader**: announces role ("menu"), number of items, first item label and position ("1 of 5")

## Do / Don't

### Do
- Use the Search variant when the menu has more than ~10 items
- Use the Footer variant for menus that require an explicit apply step (multi-select, filters)
- Keep menus under ~320px wide — wider feels like a sidebar, not a menu
- Return focus to the trigger when the menu closes
- Close the menu on outside click and Escape

### Don't
- Don't use DropdownMenu for page navigation — use a NavigationMenu or sidebar
- Don't show more than two levels of submenus — nesting gets unmanageable
- Don't combine Search with Footer when there are fewer than 5 items — it's overkill
- Don't show the footer for non-confirmation menus (e.g. context menus, user menus)
- Don't animate the panel's height during typing in Search — it's jarring

## References

- **Figma component**: [`DropdownMenu` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3075-1466)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-dropdownmenu
- **Source**: `packages/components/menu/src/dropdown-menu.component.ts`
- **Related**: [MenuItem](menu-item.md), `MenuDivider`, `MenuSectionLabel`
- **Tokens used**:
  - `menu/panel.bg`, `menu/panel.border`
  - `menu/divider`, `menu/section-label`
  - `primitive.radius.comp.md` (12px)

## Changelog

- `0.1.0` — Initial DropdownMenu with 3 sizes and default content
- `0.2.0` — Added `Has Search` and `Has Footer` variants; Cancel defaults to ghost, Primary is first
