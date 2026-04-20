# Alert

> In-page banner for short, status-level messages — errors, warnings, confirmations, and informational notes.

## Contract

Alert is a full-width, non-modal banner that sits inside page content and conveys a single status message. It has a colored role (primary / danger / success / warning / info / neutral), an appearance (how the role is expressed visually), an optional leading icon, an optional action (inline or stacked), and an optional close button. Reach for Alert when the message is tied to the page the user is on (e.g., "Changes saved", "Payment failed"); reach for a Toast when the message is transient and system-level.

### Anatomy

```
Host (inline-flex, overflow: hidden)
├─ Left Accent bar   (only when appearance='left-accent')
└─ Content
   ├─ Leading Icon   (projected via [kpAlertIcon])
   ├─ Text
   │  ├─ Title
   │  ├─ Description (optional)
   │  └─ Stacked Action (projected via [kpAlertAction] when actionPlacement='stacked')
   ├─ Inline Action  (projected via [kpAlertAction] when actionPlacement='inline')
   └─ Close button   (only when closable=true)
```

- **Left Accent bar** — a 3 / 4 px vertical strip on the left edge. Only rendered for the `left-accent` appearance. The bar uses the role color; the rest of the alert stays neutral so the accent is the only color cue.
- **Leading Icon** — projected via `[kpAlertIcon]`. Use a Tabler-style stroked SVG with `stroke="currentColor"`; the alert sets the icon color via the role × appearance `icon` token.
- **Title** — always rendered. Medium weight. One line ideally; wraps if the banner is narrow.
- **Description** — only rendered when the `description` input is non-empty. Regular weight. Wraps freely.
- **Action** — projected via `[kpAlertAction]`. Position controlled by `actionPlacement`: `inline` pins the action to the right of the text column (default, good for short labels); `stacked` places it below the description with a top margin (use when the action label is long, or the description spans multiple lines and the button would feel cramped inline).
- **Close** — only rendered when `closable=true`. Emits `close` on click. Sits top-right regardless of action placement.

### Sizes

| Size | Padding | Gap (icon↔text) | Gap (title↔desc) | Action gap (stacked) | Radius | Icon | Close | Accent |
|------|---------|-----------------|------------------|----------------------|--------|------|-------|--------|
| sm   | 12      | 10              | 2                | 8                    | 10     | 16   | 20    | 3      |
| md   | 16      | 12              | 4                | 12                   | 12     | 18   | 24    | 4      |
| lg   | 20      | 16              | 4                | 12                   | 14     | 22   | 28    | 4      |

Text scales with size: Title uses `text/sm` / `text/md` / `text/lg` (medium weight); Description uses `text/xs` / `text/sm` / `text/md` (regular).

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `appearance` | `'subtle' \| 'solid' \| 'outline' \| 'left-accent'` | `'subtle'` | Visual treatment |
| `color` | `'primary' \| 'danger' \| 'success' \| 'warning' \| 'info' \| 'neutral'` | `'primary'` | Semantic color role |
| `title` | `string` | `''` | The heading text |
| `description` | `string` | `''` | Supporting body text. Hidden when empty |
| `actionPlacement` | `'inline' \| 'stacked'` | `'inline'` | Where the projected action sits relative to the text |
| `closable` | `boolean` | `false` | Render the close button and emit `close` when clicked |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `close` | `EventEmitter<MouseEvent>` | Fires when the close button is clicked |

### Content projection

- **`[kpAlertIcon]` slot** — the leading SVG icon. Use `stroke="currentColor"` so the icon inherits the role × appearance `icon` token.
- **`[kpAlertAction]` slot** — a single action control (most commonly a `kp-button`). Appearance matches the alert role in practice, but the component doesn't enforce this — you choose the variant that reads right against the alert background.

```html
<kp-alert color="warning" appearance="left-accent"
          title="Review required" description="3 items need your approval.">
  <svg kpAlertIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 9v4M12 17v.01M10.24 3.957L3.2 16.104a2 2 0 0 0 1.737 3h14.118a2 2 0 0 0 1.737-3L13.76 3.957a2 2 0 0 0-3.52 0z"/>
  </svg>
  <kp-button kpAlertAction size="sm" variant="subtle" color="primary">Review</kp-button>
</kp-alert>
```

## Variants

| Dimension | Values |
|-----------|--------|
| Size | sm, md, lg |
| Appearance | subtle, solid, outline, left-accent |
| Color | primary, danger, success, warning, info, neutral |
| Action placement | inline (default), stacked |

### Appearances, visually

- **Subtle** — tinted background + colored text + matching border. The workhorse; reads as a banner without demanding attention.
- **Solid** — full role-colored background + white (or dark for warning) text. Use for the most critical states (single error on a form submission, destructive confirmation); avoid stacking multiple solid alerts.
- **Outline** — white background + colored border + colored title. Use when the surrounding page already has a tinted background and a subtle alert would blend in.
- **Left accent** — white background, neutral text, a role-colored bar on the left edge. The quietest option; reads as "noteworthy" without being shouty. Good for persistent advisories (subscription expiring, draft unsaved).

## States

Alert is **non-interactive by default**. The only focusable elements are the action button and the close button — each owns its own hover / focus styles. The alert host itself has no hover / active / disabled states.

## Accessibility

- Host has `role="alert"` — screen readers announce the content when the alert appears. If the alert is mounted purely for layout (e.g., a static banner on page load), consider applying `role="status"` (polite) instead via host override.
- The close button is a real `<button>` with `aria-label="Close"`. The action slot's accessibility is owned by whatever control you project.
- Colors are not the only carrier of meaning — the title always conveys the status as text. The `solid` appearance meets WCAG AA against typical page backgrounds across all roles; `subtle` / `outline` / `left-accent` rely on the title text for contrast and all use `gray.900` or a deep role tint for the title.
- Keep the title short and scannable. Long descriptions are fine, but the SR announcement reads title first, then description — front-load the important information in the title.

## Do / Don't

### Do
- Use a single alert per status. If two things need announcing, write one alert that covers both, or stack two alerts vertically with spacing.
- Pair `danger` + `solid` only for critical, blocking errors. For recoverable errors use `danger` + `subtle`.
- Use `actionPlacement="stacked"` when the description is long or the action label is more than one word.
- Use `left-accent` for persistent advisories that shouldn't dominate the page.
- Project a `kp-button` into the action slot so it inherits the design system.

### Don't
- Don't use Alert for transient notifications — that's Toast.
- Don't mount more than one `solid` alert at a time on the same view — they fight for attention.
- Don't put more than one action in the action slot. If you need multiple actions, consider a Modal instead.
- Don't nest Alert inside Alert.
- Don't use Alert as a blocking confirmation — use a Dialog/Modal for that.

## References

- **Figma component**: [`Alert` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3240-6425)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-alert
- **Source**: `packages/components/alert/src/alert.component.ts`
- **Tokens used**:
  - Background: `alert/{color}/{appearance}/bg`
  - Title text: `alert/{color}/{appearance}/fg-title`
  - Description text: `alert/{color}/{appearance}/fg-desc`
  - Border: `alert/{color}/{appearance}/border`
  - Icon: `alert/{color}/{appearance}/icon`
  - Accent bar (only for `left-accent`): `alert/{color}/{appearance}/accent`
  - Focus ring (close button): `color/focus/ring`
  - Typography: palette Text Styles (`text/xs` through `text/lg`) mapped by size

## Changelog

- `0.1.0` — Initial component. 3 sizes × 4 appearances × 6 color roles; projected icon and action slots; inline or stacked action placement; close affordance with `close` event. Colors driven by the generated `--kp-color-alert-*` custom properties.
