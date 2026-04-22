# Avatar

> User-facing identity surface. Image, initials, or glyph. Six sizes, two shapes, seven color roles, optional status dot and contrast ring.

## Contract

`<kp-avatar>` renders a fixed-size square/circle filled with one of:

1. **Image** — when `[src]` is set
2. **Initials** — when `[initials]` is set
3. **Icon** — projected `<svg>` content (fallback: a default user glyph)

Content precedence is top-to-bottom: image beats initials beats icon.

Optionally, a colored presence dot (`[showStatus]="true"` + `[status]`) sits at the bottom-right, and a contrast ring (`[showRing]="true"`) surrounds the avatar for use in stacks.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Outer dimensions |
| `shape` | `'circle' \| 'square'` | `'circle'` | Border-radius style |
| `appearance` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral'` | `'default'` | Color role (bg + fg) |
| `initials` | `string \| null` | `null` | 1–2 letters; rendered when no `src` |
| `src` | `string \| null` | `null` | Image URL; takes precedence over initials |
| `alt` | `string \| null` | `null` | Image alt + aria-label fallback |
| `showStatus` | `boolean` | `false` | Render presence dot |
| `status` | `'online' \| 'offline' \| 'busy' \| 'away'` | `'online'` | Dot color |
| `showRing` | `boolean` | `false` | Outer contrast ring (for stacks) |
| `ariaLabelOverride` | `string \| null` | `null` | Explicit aria-label override |

### Content projection

Provide custom `<svg>` as the icon when neither `src` nor `initials` are set:

```html
<kp-avatar size="lg" shape="square" appearance="neutral">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
    <!-- company glyph -->
  </svg>
</kp-avatar>
```

## Sizes

| Size | Px | Font | Icon | Status dot |
|------|-----|------|------|-----------|
| `xs` | 20 | 10 | 12 | 6 |
| `sm` | 24 | 11 | 14 | 6 |
| `md` | 32 | 12 | 18 | 8 |
| `lg` | 40 | 14 | 20 | 10 |
| `xl` | 56 | 18 | 28 | 14 |
| `2xl` | 80 | 24 | 40 | 18 |

## Do / Don't

### Do
- Use **initials** as a cheap, reliable fallback. Two letters max, uppercase, `font-weight: 600`.
- Use **`appearance="neutral"`** + `shape="square"` for company / org logos. The dark fill reads distinctly from user avatars.
- Use **`showRing`** only inside `AvatarGroup` — on its own an avatar doesn't need a ring.
- Use **`status="online"/"busy"/"away"/"offline"`** consistently across your app — don't invent new statuses like "meeting".

### Don't
- Don't use `xs` or `sm` with initials longer than 2 characters — they get clipped.
- Don't put color appearances on photo avatars — the bg is hidden by the image anyway.
- Don't use the status dot as a generic badge — it's for presence only. For counts or labels, compose with `Badge`.

## Accessibility

- Default `role="img"`.
- `aria-label` auto-resolves: `ariaLabelOverride` → `alt` → `initials` → `null` (decorative).
- Status dot is `aria-hidden="true"`; if status is meaningful, expose it through the parent (e.g., "Anna Jones, online").

## References

- **Figma component**: [`Avatar` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-avatar
- **Source**: `packages/components/avatar/src/`
- **Tokens**: `avatar/bg-*`, `avatar/fg-*`, `avatar/ring`, `avatar/status-*`

## Changelog

- `0.1.0` — Initial release. 6 sizes × 2 shapes × 7 appearances, optional status dot and contrast ring, image / initials / icon content.
