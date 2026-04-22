# Tree

> Recursive nested list. Expandable nodes, single-selection, optional tri-state checkboxes, optional file-type icons and trailing badges.

## Contract

`<kp-tree>` takes a `[data]` array of `KpTreeNode` objects. Each node may have `children`; the component recursively renders them with an expand/collapse chevron. Clicking the label selects the node (single-select, tracked by `[selected]` = node id). When `showCheckboxes="true"`, each node renders a checkbox; parent state is derived from the union of its leaves (tri-state: unchecked / checked / indeterminate).

### Anatomy

```
Tree
├─ Node row
│   ├─ Chevron (or placeholder when not expandable)
│   ├─ Checkbox (optional)
│   ├─ Icon (folder / file, optional)
│   ├─ Label
│   └─ Badge (optional trailing count)
└─ Nested ul (when expanded)
```

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md'` | `'md'` | Node height / padding |
| `data` | `KpTreeNode[]` | `[]` | Root-level nodes |
| `showIcons` | `boolean` | `true` | Render folder / file icons per node |
| `showCheckboxes` | `boolean` | `false` | Render checkbox per node with tri-state parent derivation |
| `expanded` | `string[]` | `[]` | Two-way bindable — ids of expanded nodes |
| `selected` | `string \| null` | `null` | Two-way bindable — id of the selected node (single select) |
| `checked` | `string[]` | `[]` | Two-way bindable — ids of checked **leaves**. Parent state is derived |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `expandedChange` | `string[]` | Chevron toggles |
| `selectedChange` | `string \| null` | Row is clicked |
| `checkedChange` | `string[]` | Checkbox toggles (parent toggle flips all descendant leaves) |
| `nodeClick` | `KpTreeNode` | Any row click, independent of selection |

### `KpTreeNode`

```ts
interface KpTreeNode {
  id: string;                    // stable id
  label: string;
  icon?: string;                 // semantic key (consumer-defined)
  badge?: string | number;       // trailing badge
  expandable?: boolean;          // override — defaults to (children?.length ?? 0) > 0
  disabled?: boolean;
  children?: KpTreeNode[];
}
```

## Tri-state checkboxes

When `showCheckboxes="true"`, the `checked` input holds **leaf** ids only. The component computes parent state on the fly:

- All descendant leaves checked → parent shows `checked`
- Some leaves checked → parent shows `indeterminate`
- None checked → parent shows `unchecked`

Toggling a parent flips all its descendant leaves at once.

## Accessibility

- `role="tree"` on the list, `role="treeitem"` on each node, `role="group"` on nested sub-lists.
- `aria-level` reflects depth (1-indexed).
- `aria-expanded` on expandable nodes.
- `aria-selected` on the selected node.
- Checkboxes carry `aria-label="Select <label>"`.

## Do / Don't

### Do
- Use stable `id`s — the component tracks expansion/selection by id across re-renders.
- Use `badge` for counts ("24 members", "3"), not arbitrary status; keep it short.
- Flip `showIcons="false"` when your labels already carry iconography (e.g., custom avatars in a separate wrapper).

### Don't
- Don't nest more than ~5 levels — horizontal padding becomes unreadable. Collapse deep hierarchies or paginate children.
- Don't pre-populate `children` with hundreds of items eagerly — use `expandable: true` + lazy fetch on `expandedChange`.
- Don't use checkboxes for single-select — that's `selected`.

## References

- **Figma component**: [`Tree` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System) (pending)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-tree
- **Source**: `packages/components/tree/src/`
- **Tokens**: `tree/node-bg-*`, `tree/node-fg-*`, `tree/node-icon-*`, `tree/node-chevron`, `tree/indent-line`

## Changelog

- `0.1.0` — Initial release. Recursive rendering, expandable nodes, single-select, tri-state checkbox propagation, icons + badges, 2 sizes.
