# NotificationCenter

> Panel with a list of notifications. Anchored to the bell icon in the Header via a popover/dropdown.

## Contract

`<kp-notification-center>` is a self-contained panel: header ("Notifications" title + "Mark all as read" + settings icon), optional filter chips, scrollable list of `NotificationItem`s, optional footer ("View all notifications"). Three states: `with-items`, `empty`, `loading`.

Items come from `[notifications]`. Either an `avatarInitials`/`avatarSrc` (user-authored notification) or an `icon` + `appearance` (system notification) — never both.

## API

### `KpNotificationCenterComponent`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `state` | `'with-items' \| 'empty' \| 'loading'` | `'with-items'` | Body state |
| `notifications` | `KpNotification[]` | `[]` | Rendered when state is `with-items`. Replacing the array identity resets the reveal window to page 1. |
| `pageSize` | `number \| null` | `null` | Incremental reveal window. When set, only the first `pageSize` items render; a "Show N more" control reveals the next page. `null` = render all (default). |
| `showFilters` | `boolean` | `false` | Filter chips (All / Unread / Mentions) |
| `activeFilter` | `string` | `'all'` | |
| `filters` | `{ id; label; count? }[]` | default 3 | Override filter chips |
| `showFooter` | `boolean` | `true` | "View all" button |

Outputs: `markAllRead`, `settingsClick`, `itemClick(notification)`, `filterChange(id)`, `viewAll`, `loadMore({ visible, total })`.

### Incremental reveal (long lists)

Long lists should not render every row up front. Set `pageSize` to cap the initial render; the panel then shows the first page plus a **"Show N more"** control (the Kanso ghost Button) that widens the visible window by one page per press. `hasMore` hides the control once every item is visible.

The reveal is **presentational** — the component only ever shows items it already holds in `[notifications]`. For server-driven feeds, listen to `(loadMore)`: it fires after each press with `{ visible, total }` (how many are now shown and how many are held locally), so the app can fetch and append the next batch as `visible` approaches `total`.

```html
<kp-notification-center
  [notifications]="items"
  [pageSize]="8"
  (loadMore)="onLoadMore($event)"
/>
```

Swapping the `[notifications]` array reference (e.g. on a filter change) collapses the window back to the first page, so a fresh list never starts scrolled open. With `pageSize` unset the behavior is unchanged: all items render and no control appears.

### `KpNotification`

```ts
interface KpNotification {
  id: string;
  title: string;
  message?: string;
  time?: string;
  read?: boolean;
  // System notification path
  icon?: string;          // Tabler name without ti- prefix
  appearance?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  // Or user-authored path
  avatarInitials?: string;
  avatarSrc?: string;
}
```

### `KpNotificationItemComponent`

Atomic list row. Same fields as above, emits `click$`.

## Do / Don't

### Do
- **Anchor the center to the bell icon** via the same portal pattern used for dropdowns (body-portal, position fixed).
- **Use `avatarInitials/src`** for human-authored events ("@Sarah mentioned you") and the colored **icon + appearance** path for system events (build failed, maintenance).
- **Truncate messages to 2 lines** — users should glance, not read.

### Don't
- Don't mix `avatarSrc` and `icon` on the same item. Pick one.
- Don't show more than ~50 items in-panel. Anything older moves to "View all" dedicated page.
- Don't auto-dismiss or auto-mark-read on hover. Require explicit action.

## References

- **Figma**: `NotificationCenter` + `NotificationItem` Component Sets.
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-notificationcenter
- **Source**: `packages/ui/notification-center/src/`

## Changelog

- `0.2.0` — Incremental reveal for long lists: `[pageSize]` + "Show N more" control + `(loadMore)` `{ visible, total }`; window resets when the list is replaced.
- `0.1.0` — Initial release. 3 states, filter chips, Avatar + icon paths, footer CTA.
