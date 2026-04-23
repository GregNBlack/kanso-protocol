# FormSection

> Titled block of a form with a description and the related fields. Building unit of every settings page, profile editor, and onboarding form.

## Contract

`<kp-form-section>` is a presentational container. Drop your `<kp-form-field>` / `<kp-input>` / `<kp-toggle>` / `<kp-select>` etc. as children. The host renders the title + optional description, lays out fields in a column, and adds an optional bottom divider so consecutive sections separate cleanly.

Two layouts:

- **`inline`** — title and description on the left (320px column), fields on the right. Classic "settings page" style for wide viewports.
- **`stacked`** — title and description on top, fields below (full width). Use it on narrow viewports, in onboarding wizards, or when the field column needs more breathing room.

## API

### `KpFormSectionComponent`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `layout` | `'inline' \| 'stacked'` | `'inline'` | Header position |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Title type scale + gap between header and fields |
| `title` | `string` | `'Section title'` | Required label |
| `description` | `string` | `''` | Subtitle under the title |
| `showDescription` | `boolean` | `true` | Hide subtitle even if `description` is set |
| `showDivider` | `boolean` | `true` | Bottom horizontal divider — turn off on the last section |

Slot: default `<ng-content>` — drop fields here. The component spaces them with a 16px column gap.

## Do / Don't

### Do
- **Use `inline` for desktop settings pages.** The fixed-width header column gives every section a consistent spine, even when field counts differ.
- **Use `stacked` in dialogs, drawers, and onboarding.** When the field column is the whole purpose of the screen, the header above feels lighter than to the left.
- **Turn off `showDivider` on the last section** — the section above the form footer doesn't need a horizontal line under it.
- **Compose with `kp-form-field`** so labels, helper text, and error states stay consistent.

### Don't
- Don't put more than ~6 fields in one section. Split into two sections when the form gets long; the descriptions help users orient themselves.
- Don't mix `inline` and `stacked` on the same page. Pick one rhythm and stick with it.
- Don't render section titles as `<h1>` — `<kp-form-section>` uses an `<h3>` so the page heading hierarchy stays clean.

## References

- **Figma**: `FormSection` Component Set on the [📐 Patterns page](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System).
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-formsection
- **Source**: `packages/patterns/form-section/src/`

## Changelog

- `0.1.0` — Initial release. Inline + stacked layouts × sm/md/lg sizes, optional description, optional bottom divider.
