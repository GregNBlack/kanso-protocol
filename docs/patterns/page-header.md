# PageHeader

> Content-area header. Three sizes, optional breadcrumbs, back button, description, actions slot, tabs slot, and bottom divider.

## Contract

`<kp-page-header>` sits at the top of a content area (inside `Container`, below `Header`). It gathers the page's identity — breadcrumb trail, title, description, primary actions — in a single block and optionally provides a Tabs strip for sub-navigation.

Slots:
- `[kpPageHeaderBreadcrumbs]` — your `Breadcrumbs` instance
- `[kpPageHeaderTitle]` — custom title node (e.g., title + inline `Badge`)
- `[kpPageHeaderActions]` — action buttons on the right
- `[kpPageHeaderTabs]` — your `Tabs` instance under the header

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Title scale and spacing |
| `title` | `string` | `'Page title'` | Displayed when `[kpPageHeaderTitle]` slot is empty |
| `description` | `string \| null` | `null` | Shown when `showDescription=true` |
| `showBreadcrumbs` | `boolean` | `false` | |
| `showBackButton` | `boolean` | `false` | Left-side arrow button |
| `showDescription` | `boolean` | `false` | |
| `showActions` | `boolean` | `false` | |
| `showTabs` | `boolean` | `false` | |
| `showBottomDivider` | `boolean` | `true` | Border below the block |

### Outputs

| Name | Fires when |
|------|------------|
| `backClick` | Back-arrow button pressed |

### Sizes

| Size | Title | Description | Padding-bottom |
|------|-------|-------------|----------------|
| `sm` | 18px / medium | 13px | 16px |
| `md` | 24px / medium | 14px | 24px |
| `lg` | 30px / semibold | 16px | 32px |

## Do / Don't

### Do
- **Pick one size per content scope** — `md` for most app pages, `lg` for detail / hero pages, `sm` for drawers or settings subpages.
- **Use breadcrumbs when the page is 2+ levels deep**. A single-level page doesn't need a breadcrumb "Home › Page title".
- **Put the primary action furthest right** and the secondary (ghost) to its left. Match the Button order conventions.

### Don't
- Don't duplicate the title in the browser tab only — page title belongs visible in the PageHeader too.
- Don't use both Back button and Breadcrumbs. They're redundant; pick one per navigation style.
- Don't put more than 3 actions in the actions slot. If you need more, use a `DropdownMenu` behind a "More" button.

## References

- **Figma**: `PageHeader` Component Set (Patterns page)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-pageheader
- **Source**: `packages/patterns/page-header/src/`

## Changelog

- `0.1.0` — Initial release. 3 sizes, 6 toggleable sections, slot projection for breadcrumbs / title / actions / tabs.
