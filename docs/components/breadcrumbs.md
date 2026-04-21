# Breadcrumbs

> Navigation path — a container (`<kp-breadcrumbs>`) plus two atoms (`<kp-breadcrumb-item>` and `<kp-breadcrumb-separator>`). Fully composable; size cascades from the container.

## Contract

Breadcrumbs are a three-part component: `<kp-breadcrumbs>` is the strip (the `<nav aria-label="Breadcrumb">` + `<ol>` wrapper and the shared size), `<kp-breadcrumb-item>` is each cell in the path, and `<kp-breadcrumb-separator>` is the inert visual between cells. The container does **not** auto-insert separators — callers include them explicitly, in order, in the template. This keeps overflow (`…`) trivial and lets every item/separator be swapped or skipped independently.

### Anatomy

```
<kp-breadcrumbs> (nav + role="list" equivalent)
├─ <kp-breadcrumb-item type="link">   (first crumb — usually icon-only home)
│   └─ [kpBreadcrumbIcon]              (optional leading icon)
├─ <kp-breadcrumb-separator type="chevron"/>
├─ <kp-breadcrumb-item type="link" label="Projects" href="/projects"/>
├─ <kp-breadcrumb-separator type="chevron"/>
├─ <kp-breadcrumb-item type="ellipsis" (itemClick)="openHiddenMenu()"/>
├─ <kp-breadcrumb-separator type="chevron"/>
└─ <kp-breadcrumb-item type="current" label="Button"/>
```

- **Container** renders `<nav aria-label="Breadcrumb"><ol>...</ol></nav>`. The `aria-label` is configurable via `[ariaLabel]`.
- **Item** renders one of: `<a>` (`type="link"` with `href`), `<button>` (`type="link"` without `href` or `type="ellipsis"`), or a plain `<span aria-current="page">` for `type="current"`.
- **Separator** renders a chevron SVG, a `/` glyph, or a 3×3 accent-colored dot. It carries `aria-hidden="true"` so screen readers skip it.

### Sizes

| Size | Height | Padding-x | Gap | Font | Icon | Separator |
|------|--------|-----------|-----|------|------|-----------|
| sm   | 20     | 4         | 4   | 12   | 14   | 14        |
| md   | 24     | 4         | 6   | 14   | 16   | 16        |

`<kp-breadcrumbs>` cascades `size` to every projected item and separator via `@ContentChildren`, so you set it in one place.

## API — `<kp-breadcrumbs>`

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md'` | `'md'` | Cascades to all projected items + separators |
| `ariaLabel` | `string` | `'Breadcrumb'` | `aria-label` on the wrapping `<nav>` — override if you render multiple breadcrumbs on a page |

## API — `<kp-breadcrumb-item>`

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md'` | `'md'` | Auto-set by parent `<kp-breadcrumbs>` |
| `type` | `'link' \| 'current' \| 'ellipsis'` | `'link'` | Determines rendered element (`<a>`/`<button>`, `<span>`, `<button>`) and its styling |
| `label` | `string` | `''` | Item label text. Can be omitted if you project the label as default content |
| `href` | `string \| null` | `null` | When set on `type="link"`, renders `<a href>` instead of `<button>` |
| `disabled` | `boolean` | `false` | Greys out the item and suppresses clicks |
| `ariaLabel` | `string` | `''` | Used on `type="ellipsis"` to describe how many levels are hidden (e.g. `"Show 3 hidden breadcrumbs"`) |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `itemClick` | `EventEmitter<MouseEvent>` | Fires on `<a>`/`<button>` click when not disabled. Use to drive router nav, open the ellipsis dropdown, etc. |

### Slots

- **`[kpBreadcrumbIcon]`** — leading icon. Use an SVG with `stroke="currentColor"` so it picks up the state-driven `--kp-color-breadcrumbs-item-icon-*` colors.
- **Default** — projected content goes after the icon, same visual slot as `label`. Use either `[label]` for plain strings or default projection for rich content.

## API — `<kp-breadcrumb-separator>`

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md'` | `'md'` | Auto-set by parent `<kp-breadcrumbs>` |
| `type` | `'chevron' \| 'slash' \| 'dot'` | `'chevron'` | Chevron / slash are gray; dot is a 3×3 shape in the accent color |

## States

- **rest** — link items are muted gray (`gray.600`), icon `gray.500`.
- **hover** — text darkens to `gray.900`, icon to `gray.700`. Applies to link-type items only.
- **current** — the last (active) crumb: `gray.900` with medium weight; renders as an inert `<span>` with `aria-current="page"`.
- **disabled** — `gray.400` text + `gray.300` icon, `cursor: not-allowed`, no click events propagate. Use sparingly; a breadcrumb that isn't navigable usually shouldn't appear at all.

Focus is handled via `:focus-visible` with the standard focus ring on any interactive child element.

## Accessibility

- Container wraps content in `<nav aria-label="Breadcrumb">` + `<ol>` — the [ARIA breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/).
- Items carry `role="listitem"`; the current item adds `aria-current="page"`.
- Separators carry `aria-hidden="true"` + `role="presentation"` so screen readers skip them.
- The ellipsis item is a real `<button>` with a caller-provided `ariaLabel` (recommended: describe the hidden count, e.g. `"Show 3 hidden breadcrumbs"`).
- Interactive items are `<a>` when `href` is set, otherwise `<button>` — native keyboard behavior falls out for free (Enter / Space).

## Do / Don't

### Do
- Always end the path with `type="current"` — it's the only cell that carries `aria-current="page"` and the darker visual treatment.
- Make the first cell an icon-only home link when the surface already has a "Home" affordance elsewhere; otherwise use `label="Home"`.
- Collapse long paths with `type="ellipsis"` that opens a Popover / DropdownMenu with the hidden crumbs — usually anything past 4–5 levels.
- Pair `<kp-breadcrumb-item type="link">` with routerLink via the `href` input or by binding `(itemClick)` and calling `Router.navigateByUrl(...)`.

### Don't
- Don't use breadcrumbs for primary navigation between top-level app sections — that's the nav rail's job.
- Don't skip the current marker. Every breadcrumb path ends in a non-interactive current crumb, even when it duplicates the page `<h1>`.
- Don't mix separator types in one strip. Pick chevron (default), slash (file-path vibe), or dot (marketing) and stick with it.
- Don't set `disabled` on crumbs that would simply be absent in the real route. Disabled means "intentionally unavailable here", not "route not yet loaded".

## References

- **Figma components**: [`Breadcrumbs` container](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3389-5179) · [`BreadcrumbItem` atom](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3382-4584) · [`BreadcrumbSeparator` atom](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3387-4564)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-breadcrumbs
- **Source**: `packages/components/breadcrumbs/src/`
- **Tokens used**:
  - Item fg per state: `breadcrumbs/item/fg/{link-rest|link-hover|current|disabled}`
  - Item icon per state: `breadcrumbs/item/icon/{link-rest|link-hover|current|disabled}`
  - Separator: `breadcrumbs/separator` (chevron + slash) · `breadcrumbs/separator-dot` (accent)
  - Ellipsis: `breadcrumbs/ellipsis`
  - Focus: `color/focus/ring`
  - Typography: palette Text Styles (`text/xs`, `text/sm`) mapped by size

## Changelog

- `0.1.0` — Initial release. `<kp-breadcrumbs>` container with `size` + `ariaLabel` cascade. `<kp-breadcrumb-item>` atom with `link` / `current` / `ellipsis` types, optional `href`, `disabled`, and `[kpBreadcrumbIcon]` slot. `<kp-breadcrumb-separator>` with `chevron` / `slash` / `dot` types — dot is a 3×3 shape in the accent color rather than the middot glyph.
