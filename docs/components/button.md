# Button

> Primary interactive element for triggering actions.

## Contract

Button represents a user action — submit a form, open a dialog, navigate, delete. It's the most common interactive element and the reference implementation of Kanso Protocol's component anatomy. Every other interactive component should feel consistent with Button in sizing, rhythm, and state behavior.

### Anatomy

```
Container
└─ Content
   ├─ Icon Left (optional)
   ├─ Label
   └─ Icon Right (optional)
```

- **Container** — height, padding, border, radius, background, focus ring
- **Content** — horizontal layout, gap between elements, center alignment
- **Icon Left / Icon Right** — optional icons via content projection with `[kpButtonIconLeft]` / `[kpButtonIconRight]`
- **Label** — text content via default `ng-content`
- **Spinner** — replaces icons when `loading=true`, preserves layout

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Component size |
| `variant` | `'default' \| 'subtle' \| 'outline' \| 'ghost'` | `'default'` | Visual style |
| `color` | `'primary' \| 'danger' \| 'neutral'` | `'primary'` | Semantic color role |
| `disabled` | `boolean` | `false` | Non-interactive with reduced contrast |
| `loading` | `boolean` | `false` | Shows spinner, preserves focus, disables pointer events |
| `forceState` | `KpState \| null` | `null` | Force a visual state — for Storybook / docs only |

### Outputs

Button relies on native DOM events — no custom outputs. Use `(click)` to handle activation.

### Content projection

- `ng-content` — label text
- `[kpButtonIconLeft]` — icon before the label
- `[kpButtonIconRight]` — icon after the label

## Variants

| Dimension | Values |
|-----------|--------|
| Size | xs (24px), sm (28px), md (36px), lg (44px), xl (52px) |
| Variant | default, subtle, outline, ghost |
| Color | primary, danger, neutral |
| State | rest, hover, active, focus, disabled, loading |

Total visual combinations: 5 × 4 × 3 × 6 = **360**. Managed in Figma via Variable Modes (State + Appearance), not as separate variants — only Size is a real variant property.

## States

| State | Behavior |
|-------|----------|
| rest | Default idle |
| hover | Background darkens one step |
| active | Background darkens two steps (mid-press) |
| focus | 2px focus ring, offset 2px, color `focus.ring` |
| disabled | Neutral gray background, muted text, `pointer-events: none`, `aria-disabled="true"` |
| loading | Spinner replaces icons, text hidden, `aria-busy="true"`, `pointer-events: none`, **focus preserved** |

**Critical rule**: loading ≠ disabled. Loading preserves focus and is temporary. Disabled removes interactivity entirely.

## Accessibility

- **Role**: native `<button>` element (via host binding)
- **Keyboard**: `Space` and `Enter` activate; `Tab` to focus
- **Focus**: 2px ring via `outline`, offset 2px, visible only on `:focus-visible`
- **ARIA**:
  - `aria-busy="true"` during loading
  - `aria-disabled="true"` when disabled
  - `aria-label` required for icon-only buttons (no visible text)
- **Screen reader**: announces "{label}, button" in rest state; adds "busy" during loading; adds "dimmed" or "disabled" when disabled

## Do / Don't

### Do
- Use `primary` for the main action on a screen (submit, confirm, create)
- Use `neutral` for secondary actions (cancel, back)
- Use `danger` only for destructive actions that can't be easily undone (delete, remove)
- Pair with Input of the same size in forms
- Use icon-only buttons only with an `aria-label`
- Use loading state for async actions that take longer than 200ms

### Don't
- Don't use multiple `primary` buttons on the same screen — there should be one clear primary action per context
- Don't use `danger` for errors or warnings — it's for user-initiated destructive actions
- Don't nest buttons inside buttons
- Don't disable the primary button in a form on client-side validation — use inline field errors instead
- Don't mix `ghost` and `default` variants in the same button group — pick one
- Don't override padding or radius via CSS — use size prop

## References

- **Figma component**: [`Button` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=36-12)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-button
- **Source**: `packages/components/button/src/button.component.ts`
- **Tokens used**:
  - `color.primary.default.{bg|fg|border}.{state}` and equivalent for danger, neutral
  - `color.primary.{subtle|outline|ghost}.{bg|fg|border}.{state}`
  - `color.focus.ring`
  - `primitive.sizing.{xs|sm|md|lg|xl}`
  - `primitive.radius.comp.{xs|sm|md|lg|xl}`
  - `font.family.sans`, `font.weight.medium`
  - `motion.duration.fast`, `motion.easing.in-out`

## Changelog

- `0.1.0` — Initial component with 5 sizes × 4 variants × 3 colors × 6 states
- `0.1.1` — Added `forceState` input for Storybook documentation
