# ThemeToggle

> Theme switcher between **light / dark / system**. Three presentations: single cycling icon, inline segmented, or labelled dropdown.

## Contract

`<kp-theme-toggle>` is a presentational control — it renders the UI and emits `themeChange`. Actually *applying* the theme (toggling a class on `<html>`, persisting the choice, watching `prefers-color-scheme` for `system`) stays with the consumer.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'icon' \| 'segmented' \| 'dropdown'` | `'icon'` | Presentation style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `currentTheme` | `'light' \| 'dark' \| 'system'` | `'light'` | |
| `showLabel` | `boolean` | `false` | Adds a "Theme" label before segmented/dropdown controls |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `themeChange` | `KpThemeValue` | User picks a theme (icon cycles; segmented selects; dropdown emits after user picks) |
| `dropdownClick` | `void` | Dropdown trigger button clicked — consumer opens the menu |

## Variants

### icon

Single icon button. Clicking cycles through `light → dark → system → light`. Best in a header where space is at a premium.

### segmented

Three inline icon segments; the current theme has a raised white tile. Best in settings pages or user menus where the options should all be visible.

### dropdown

Ghost button showing the current theme's icon + label + chevron-down. Opens a dropdown menu listing all three themes. Best when there's room for text and you want to expose the selected state verbatim.

## Do / Don't

### Do
- **Pick one variant per surface.** `icon` in the app Header; `segmented` in Settings; `dropdown` inside the UserMenu.
- **Treat `system` as a real option.** Many users want the OS to drive the theme.
- **Wire `themeChange` to persisted state** (localStorage) AND apply it to `<html>` in a single effect.

### Don't
- Don't render the toggle in multiple places of the same page.
- Don't use `icon` variant if the current theme isn't otherwise discoverable — cycling an icon hides the concept.

## References

- **Figma**: `ThemeToggle` Component Set (Patterns page) — 27 variants (3 × 3 × 3)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-themetoggle
- **Source**: `packages/patterns/theme-toggle/src/`

## Changelog

- `0.1.0` — Initial release. Three variants × three sizes × three current-theme states.
