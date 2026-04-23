# PageError

> Full-page error state for **404 / 500 / offline / access-denied**. Illustration + title + description + two actions.

## Contract

`<kp-page-error>` composes a hero error code (for 404/500), a circular illustration with a Tabler icon, a title/description pair, and a primary + secondary action slot. Titles, descriptions, icons, and error code default to the `type` preset; any input can be overridden.

Typically mounted in place of the page body (inside `Container` or bare inside `AppShell`). Keep the Header visible so users can navigate away.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'404' \| '500' \| 'offline' \| 'access-denied'` | `'404'` | Preset |
| `title` | `string \| null` | from preset | Override title |
| `description` | `string \| null` | from preset | Override body copy |
| `icon` | `string \| null` | from preset | Override Tabler icon (without `ti-` prefix) |
| `errorCode` | `string \| null \| undefined` | preset (404/500 only) | Hero code; pass `''` to hide on 404/500 |
| `showPrimary` | `boolean` | `true` | |
| `showSecondary` | `boolean` | `true` | |

### Projection slots

| Selector | Slot |
|----------|------|
| `[kpPageErrorPrimary]` | Primary CTA (`<kp-button>`) |
| `[kpPageErrorSecondary]` | Secondary CTA (typically `variant="ghost"`) |

### Defaults per `type`

| Type | Icon | Title | Primary / Secondary |
|------|------|-------|---------------------|
| `404` | `alert-circle` | "Page not found" | Go home · Report broken link |
| `500` | `alert-triangle` | "Something went wrong" | Try again · Contact support |
| `offline` | `wifi-off` | "You're offline" | Retry · Work offline |
| `access-denied` | `lock` | "Access denied" | Request access · Go home |

## Do / Don't

### Do
- **Keep the app Header visible** above the error — users should be able to navigate home without hitting back.
- **Use `description` to surface a support identifier** on 500 errors: `"Error ID: #A7F3B2"` — makes bug reports actionable.
- **Override `title` + `description` for paywalls** (repurpose `access-denied`): "Team analytics is a Pro feature" + upgrade CTA.

### Don't
- Don't show PageError inside a Dialog. A modal over a modal is confusing; route to a dedicated URL.
- Don't pair PageError with a Banner — the error IS the message. Banners go above normal content, not over errors.
- Don't include analytics / performance metrics on this view. Keep it lean.

## References

- **Figma**: `PageError` Component Set (Patterns page) — 4 types.
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-pageerror
- **Source**: `packages/patterns/page-error/src/`

## Changelog

- `0.1.0` — Initial release. 4 types × preset defaults + override inputs.
