# Accordion

> Expandable sections for FAQs, settings, and nested navigation. Two-part component: `<kp-accordion>` (container, coordinates single / multi mode) plus `<kp-accordion-item>` (each expandable row).

## Contract

Each `<kp-accordion-item>` renders a clickable trigger (title + optional description + chevron) and a content panel that shows when `[expanded]="true"`. The chevron rotates 180° on expand. The parent `<kp-accordion>` watches `(expandedChange)` on every item and — in `mode="single"` — collapses the others when one opens.

```
<kp-accordion size="md" mode="single" [showOuterBorder]="true">
  └─ <kp-accordion-item>
     ├─ <button class="kp-ai__trigger">
     │   ├─ [kpAccordionItemIcon]   (slot, Show Icon Left)
     │   ├─ Title + Description
     │   └─ Chevron
     └─ .kp-ai__content             (when expanded)
         └─ [kpAccordionItemContent] (slot)
```

### Sizes

| Size | Trigger height | Chevron | Trigger padding | Title |
|------|----------------|---------|-----------------|-------|
| sm   | 40             | 14      | 12              | text/sm |
| md   | 48             | 16      | 16              | text/md |
| lg   | 56             | 18      | 20              | text/lg |

## API — `<kp-accordion>`

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Cascades to every projected item |
| `mode` | `'single' \| 'multi'` | `'single'` | Whether multiple items can be open simultaneously |
| `showOuterBorder` | `boolean` | `false` | Wrap the group in a 1px bordered radius-12 container |

## API — `<kp-accordion-item>`

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Auto-set by parent `<kp-accordion>` |
| `title` | `string` | `''` | Trigger label |
| `description` | `string` | `''` | Secondary line under the title |
| `showDescription` | `boolean` | `false` | Render the description |
| `showIconLeft` | `boolean` | `false` | Reserve a leading icon slot |
| `expanded` | `boolean` | `false` | Controls whether content renders |
| `disabled` | `boolean` | `false` | Grey the trigger and suppress toggles |
| `lastInGroup` | `boolean` | `false` | **Set by container** — hides trailing border on the last item |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `expandedChange` | `EventEmitter<boolean>` | Fires on toggle; in `mode="single"` the container listens to auto-collapse siblings |

### Slots

- **`[kpAccordionItemIcon]`** — leading icon (SVG with `stroke="currentColor"`). Only renders when `showIconLeft=true`.
- **`[kpAccordionItemContent]`** — content panel. Can also use the default content slot.

## Accessibility

- Trigger is a real `<button>`; Enter / Space toggle natively.
- Trigger carries `aria-expanded` and `aria-controls` pointing at the panel id.
- Panel has `role="region"` + `aria-labelledby` pointing at the trigger id — screen readers announce panel content in relation to its trigger.
- `mode="single"` collapses siblings — keyboard focus stays on the newly-opened trigger; no focus is stolen.

## Do / Don't

### Do
- Use `mode="single"` for FAQs where only one answer is usually relevant at once.
- Use `mode="multi"` for settings groups where users want to compare sections side-by-side.
- Pair with `showOuterBorder=true` when the accordion is the only element on a surface; skip when it's inside a Card (which already has a border).
- Start with one item expanded for FAQ / onboarding contexts — never leave all collapsed when there's a clear primary answer.

### Don't
- Don't nest accordions deeper than one level. If you need a tree, use a proper Tree component.
- Don't use Accordion for navigation on narrow surfaces — that's what Drawer is for.
- Don't combine short descriptions and long titles — pick one style for the whole accordion.

## References

- **Figma components**: [`Accordion` container](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3481-8668) · [`AccordionItem` atom](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3480-8218)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-accordion
- **Source**: `packages/components/accordion/src/`
- **Tokens used**:
  - Trigger bg per state: `accordion/trigger/bg/{rest|hover|expanded}`
  - Trigger fg per state: `accordion/trigger/fg/{rest|expanded|disabled}`
  - Trigger icon per state: `accordion/trigger/icon/{rest|expanded}`
  - Content: `accordion/content`
  - Border: `accordion/border`

## Changelog

- `0.1.0` — Initial release. `<kp-accordion>` + `<kp-accordion-item>` with single/multi modes, three sizes, optional description / icon / outer border.
