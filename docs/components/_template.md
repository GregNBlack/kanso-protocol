# {ComponentName}

> One-line purpose — what this component is for.

## Contract

Short description of what the component does and what problem it solves. 2-3 sentences.

### Anatomy

```
Container
└─ Content
   ├─ Element 1
   ├─ Element 2
   └─ Element N
```

- **Container** — responsible for: padding, border, radius, background, dimensions
- **Content** — responsible for: gap management, child alignment
- **Elements** — individual atomic parts (icon, label, etc.)

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Component size from the sizing scale |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `valueChange` | `string` | User changes the value |

### Content projection

- `ng-content` — default slot for the label
- `[kpSlotName]` — named slot for additional content

## Variants

| Dimension | Values | Notes |
|-----------|--------|-------|
| Size      | xs, sm, md, lg, xl | All 5 unless otherwise specified |
| Variant   | default, subtle, outline, ghost | Visual style |
| Color     | primary, danger, neutral | Semantic role |
| State     | rest, hover, active, focus, disabled, loading | All interactive components |

## States

| State | Behavior |
|-------|----------|
| rest | Default idle state |
| hover | Pointer is over the component |
| active | Pressed / mid-click |
| focus | Keyboard focus ring visible |
| disabled | Not interactive, reduced contrast, `aria-disabled="true"` |
| loading | Shows spinner, preserves focus, `aria-busy="true"`, pointer-events disabled |

## Accessibility

- **Role**: `button` (or the appropriate role)
- **Keyboard**: `Space` and `Enter` activate the component
- **Focus**: visible 2px ring, offset 2px
- **ARIA**:
  - `aria-busy` when loading
  - `aria-disabled` when disabled
  - `aria-label` required when no visible text
- **Screen reader**: announces role, state, and label

## Do / Don't

### Do
- Use MD as the default size
- Pair components of the same size in forms
- Use `danger` color only for destructive actions
- Always provide a label, even for icon-only variants (via `aria-label`)

### Don't
- Don't mix sizes in a single row (e.g., MD button next to SM input)
- Don't use `danger` for generic errors — it's for destructive user actions
- Don't override internal padding or radius via custom CSS — use component props
- Don't nest interactive components (button inside button)

## References

- **Figma component**: [Figma link with node-id]
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-{name}
- **Source**: `packages/components/{name}/src/{name}.component.ts`
- **Tokens used**: list of semantic tokens this component consumes

## Changelog

- `0.1.0` — Initial component
