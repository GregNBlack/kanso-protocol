# Banner

> Global strip under the app Header for system messages: trial status, maintenance, payment alerts, feature launches.

## Contract

`<kp-banner>` renders a full-width subtle strip with an icon, title, optional description, optional action slot, and a close button. It reuses **alert-*-subtle** tokens, so color roles match Alert and Toast.

Mount a Banner inside `AppShell`'s `[kpAppShellBanner]` slot for global messages. For per-page, in-content notifications use Alert instead.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral'` | `'primary'` | Color role |
| `size` | `'sm' \| 'md'` | `'md'` | Compact vs. default strip |
| `title` | `string` | `'Global notification message'` | Main message |
| `description` | `string \| null` | `null` | Optional secondary line (inline with title) |
| `showIcon` | `boolean` | `true` | Leading semantic icon |
| `showClose` | `boolean` | `true` | Trailing ✕ ghost button |

### Outputs

| Name | Fires when |
|------|------------|
| `close` | User clicks the ✕ |

### Projection slot

| Selector | Slot |
|----------|------|
| `[kpBannerAction]` | Trailing CTA (use `<kp-button size="sm">`) |

## Do / Don't

### Do
- **Use for app-wide, temporary state** (trial, maintenance, payment).
- **Pair `color` with semantic intent** (`warning` for trial expiring, `danger` for payment failed, `info` for maintenance, `primary` for feature announcements).
- **Keep title short** — one sentence. Use `description` sparingly.

### Don't
- Don't stack more than one Banner at a time. If you have two global concerns, pick the most urgent.
- Don't use Banner for navigation (that's Header). Don't use it for confirmations (that's Toast).
- Don't hide `showClose=false` unless the message is truly non-dismissible (e.g., major outage).

## References

- **Figma**: `Banner` Component Set (Patterns page) — 6 colors × 2 sizes.
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-banner
- **Source**: `packages/patterns/banner/src/`
- **Tokens**: reuses `alert/{color}/subtle/{bg,border,fg-title,fg-desc,icon}`.

## Changelog

- `0.1.0` — Initial release. 6 colors × 2 sizes, optional action slot, reuses alert subtle tokens.
