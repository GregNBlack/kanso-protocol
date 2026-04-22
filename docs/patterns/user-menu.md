# UserMenu

> Dropdown menu anchored on the user Avatar in Header. Identity block at top, main actions, optional theme toggle / help links, Sign out at the bottom.

## Contract

`<kp-user-menu>` is a *preset* of the generic `DropdownMenu` — it has a fixed structure (user info · items · theme · help · sign out) with visibility toggles. Use it when you want consistent user dropdowns across the app without rebuilding the layout per page.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md'` | `'md'` | 240 vs 280 width; Avatar md vs lg |
| `userName` | `string \| null` | `'Greg Black'` | |
| `userEmail` | `string \| null` | `'greg@example.com'` | |
| `userInitials` | `string \| null` | `'GB'` | |
| `showEmail` | `boolean` | `true` | |
| `showPlanBadge` | `boolean` | `false` | Inline badge next to the name |
| `planName` | `string` | `'Pro'` | Badge text |
| `showThemeToggle` | `boolean` | `false` | Reveal the theme slot |
| `showHelpLink` | `boolean` | `true` | Reveal the help slot |

### Outputs

| Name | Fires when |
|------|------------|
| `signOut` | Sign-out row clicked |

### Projection slots

| Selector | Slot |
|----------|------|
| `[kpUserMenuItems]` | Main menu rows (Profile / Settings / Billing / Team) |
| `[kpUserMenuHelp]` | Help rows (Docs / Feedback) |
| `[kpUserMenuTheme]` | Theme switcher (e.g., a SegmentedControl with sun/moon/monitor) |

## Do / Don't

### Do
- **Pair with the user Avatar in Header** as a DropdownMenu. This preset is not intended for other trigger surfaces.
- **Keep the plan badge short** — "Free", "Pro", "Admin". Don't stuff tier descriptions into it.
- **Use the `signOut` output** for sign-out handling; the row is always rendered and carries the destructive styling.

### Don't
- Don't add business-logic rows (e.g., "Switch workspace") into `[kpUserMenuItems]`. That belongs in a separate WorkspaceSwitcher pattern.
- Don't repurpose `showPlanBadge` for notifications — it is a plan affordance. For counts, use a Badge inside one of the menu items.

## Accessibility

- `role="menu"` on the host.
- Sign-out is a `<button>` with destructive color; screen readers hear "Sign out, button".
- Keyboard navigation is handled by the parent `DropdownMenu` trigger.

## References

- **Figma**: `UserMenu` Component Set (Patterns page)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/patterns-usermenu
- **Source**: `packages/patterns/user-menu/src/`

## Changelog

- `0.1.0` — Initial release. 2 sizes, toggleable email / plan badge / theme / help, fixed sign-out row.
