# Divider

> Thin line separator. Horizontal by default with optional center/start/end label; vertical for inline use between adjacent text or controls.

## Contract

`<kp-divider>` renders a single 1px line. When `orientation="horizontal"` and a `[label]` is provided (or content is projected with `[hasProjected]="true"`), the line splits and the label sits between the two segments at the configured position. Vertical dividers are label-less by design — labels overlap awkwardly in vertical flows.

The component is fully presentational; no state, no events.

### Anatomy

```
horizontal (no label):
  └─ <span class="kp-divider__line"/>

horizontal (label, position="center"):
  ├─ <span class="kp-divider__line"/>     ← grows
  ├─ <span class="kp-divider__label">Or</span>
  └─ <span class="kp-divider__line"/>     ← grows

horizontal (label, position="start"):
  ├─ <span class="kp-divider__label">…</span>
  └─ <span class="kp-divider__line"/>     ← grows

vertical:
  └─ <span class="kp-divider__line"/>     ← 1px wide, full host height
```

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction of the line |
| `label` | `string` | `''` | Label text — only honored on horizontal dividers |
| `labelPosition` | `'center' \| 'start' \| 'end'` | `'center'` | Label placement along the horizontal divider |
| `hasProjected` | `boolean` | `false` | Set when projecting custom label nodes via default content slot instead of `[label]` |

### Slots

- **default** — projected content rendered as the label when `hasProjected=true`. Use for icons + text or formatted markup. The plain `[label]` input is preferred for one-string labels.

## Sizing

- **Horizontal** — host is `display: flex; width: 100%`. The line segments use `flex: 1 1 auto` to fill the container; wrap the divider in a sized parent to control width.
- **Vertical** — host is `display: inline-flex; align-self: stretch`. Set explicit `height` on the host (or wrap in a parent with stretched alignment) to control line length. There's a `min-height: 16px` safeguard so unbounded vertical dividers still render visibly.

## Accessibility

- Host carries `role="separator"` and `aria-orientation` matching the prop.
- The label, when present, is part of the divider element and announced as separator text by screen readers.
- No keyboard interaction — divider is non-interactive.

## Do / Don't

### Do
- Use horizontal dividers between sections of a form, dialog body, or settings page.
- Use vertical dividers between inline metadata (e.g. `Home · About · Contact`).
- Pair with a label when grouping related content (`"Billing details"`, `"Or continue with"`).

### Don't
- Don't put a label on a vertical divider — set `orientation="vertical"` only when `label` is empty.
- Don't stack dividers as decoration. One per section break.
- Don't use Divider as a thicker visual rule. For 2-4 px accent lines, use a styled `<hr>` or a Box/Card border instead.

## References

- **Figma component**: [`Divider` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3466-7798)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-divider
- **Source**: `packages/components/divider/src/`
- **Tokens used**:
  - Line: `divider/line`
  - Label: `divider/label`

## Changelog

- `0.1.0` — Initial release. Horizontal + vertical orientations; label with center/start/end positioning on horizontal.
