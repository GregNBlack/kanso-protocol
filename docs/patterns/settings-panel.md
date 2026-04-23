# SettingsPanel

> Card-shaped container for a group of related settings. Header at the top, then a column of `<kp-settings-row>`s — each row has a title + description on the left and a control on the right.

## Contract

`<kp-settings-panel>` is a layout shell with an optional bordered card and an optional header. Drop `<kp-settings-row>` children inside; each row is a slot for one Toggle / Select / Input / Button / Badge / anything else you want.

Use one panel per topical group (Notifications / Privacy / Billing). Panels stack vertically on a settings page with a breathable gap between them.

## API

### `KpSettingsPanelComponent`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Header padding + type scale |
| `title` | `string` | `'Settings group'` | Header title |
| `description` | `string` | `''` | Subtitle under the title |
| `showHeader` | `boolean` | `true` | Render the card header at all |
| `showDescription` | `boolean` | `true` | Hide subtitle even if `description` is set |
| `showOuterBorder` | `boolean` | `true` | Render the bordered card outline |

### `KpSettingsRowComponent`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Row padding + gap + type scale (must match the panel) |
| `title` | `string` | `'Setting name'` | Required label |
| `description` | `string` | `''` | Subtitle shown under the title |
| `showDescription` | `boolean` | `true` | Hide subtitle even if `description` is set |
| `showDivider` | `boolean` | `true` | Bottom border — turn off on the last row of a panel |

Slot: default `<ng-content>` — the right-side control. Goes flush right.

## Do / Don't

### Do
- **Match the panel's `size` on every row inside it.** Mixing sm/md/lg looks bumpy.
- **Turn off `showDivider` on the last row** — the bordered panel already provides a visual close.
- **Use Badges for read-only state** ("Pro", "Enabled", "Trial — 6 days left") and Buttons for actions ("Manage", "Delete"). Toggles are for booleans, Selects for enums.
- **Stack multiple panels vertically with a 24-32px gap** for a clean settings page.

### Don't
- Don't render >7 rows in one panel. Split into two panels with a clear topic for each.
- Don't put two controls in one row (e.g., Toggle + "Configure…" button). Make a child panel or open a dialog instead — the row pattern is one decision per line.
- Don't use SettingsPanel for fields that need validation (email, URL, complex inputs). Use FormSection for those.

## References

- **Figma**: `SettingsPanel` Component Set on the [📐 Patterns page](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System).
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-settingspanel
- **Source**: `packages/patterns/settings-panel/src/`

## Changelog

- `0.1.0` — Initial release. SettingsPanel + SettingsRow components, three sizes, bordered/borderless modes, control-agnostic right slot.
