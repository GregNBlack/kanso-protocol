# Toast

> Transient notification. Queue-driven, corner-positioned, auto-dismisses.

## Contract

Toasts are emitted imperatively from a service; a `<kp-toast-host>` placed anywhere in the app renders the current queue in one of four viewport corners. The host portal itself lives in `<body>`, so no ancestor overflow can clip it. Each toast has an `appearance` (primary/success/danger/warning/info/neutral), a title, an optional description, and an optional action button. Auto-dismiss after `duration` ms (default `5000`). `duration: 0` keeps it up until dismissed explicitly.

### Anatomy

```
ToastHost (portaled to <body>, fixed to a corner)
└─ Stack (column of active toasts)
    └─ Toast
        ├─ Icon (appearance-specific)
        ├─ Content
        │   ├─ Title
        │   ├─ Description (optional)
        │   └─ Action button (optional)
        └─ Close ×
```

## API

### Service — `KpToastService`

```ts
const toast = inject(KpToastService);
toast.show({ appearance: 'success', title: 'Saved', description: 'Your changes are live.' });
toast.success('Task completed');
toast.danger('Upload failed', 'Check your connection and retry.');
toast.show({ appearance: 'info', title: 'Update available', duration: 0 });   // sticky

// Returns an id you can use to dismiss programmatically.
const id = toast.warning('Approaching quota', '…');
toast.dismiss(id);

// Or nuke the queue.
toast.dismissAll();
```

### Host — `<kp-toast-host>`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` | Which corner the stack anchors to |
| `size` | `'sm' \| 'md'` | `'md'` | Toast size (affects padding / radius / width) |
| `showIcon` | `boolean` | `true` | Show the appearance-specific icon |
| `max` | `number` | `5` | Cap on visible toasts — older ones stay in the queue until a slot frees up |

### Interfaces

```ts
type KpToastAppearance = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
type KpToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
type KpToastSize = 'sm' | 'md';

interface KpToastShowInput {
  appearance?: KpToastAppearance;   // default 'neutral'
  title: string;
  description?: string;
  action?: { label: string; handler: (id: number) => void };
  duration?: number;                 // default 5000, 0 = sticky
}
```

## Appearances

| Appearance | Use for | Shares tokens with |
|-----------|---------|--------------------|
| `primary` | Informational highlights | `alert/primary-subtle/*` |
| `success` | Completed positive actions | `alert/success-subtle/*` |
| `danger` | Errors, destructive outcomes | `alert/danger-subtle/*` |
| `warning` | Caution, soft limits | `alert/warning-subtle/*` |
| `info` | Neutral system info | `alert/info-subtle/*` |
| `neutral` | Default — generic messages | plain neutral palette |

## Accessibility

- Stack has `aria-live="polite"` + `aria-atomic="false"` so screen readers announce new toasts as they arrive without interrupting the user.
- Each toast carries `role="status"`.
- The close button has `aria-label="Dismiss"`.
- Use `appearance="danger"` sparingly — critical errors that require acknowledgement should be a dialog, not a toast.

## Do / Don't

### Do
- Place **one** host per app in a common layout component (the root shell).
- Use `action` + a matching handler for undoable operations ("Task archived — Undo").
- Keep titles under ~40 chars and descriptions under ~100.
- Use `duration: 0` for important system messages that the user must see (maintenance notices, license alerts).

### Don't
- Don't stack more than ~3 toasts simultaneously for routine notifications — `max` caps the visible count, but even ~5 at once is a bad UX signal.
- Don't replace form validation with toasts — inline errors are more contextual.
- Don't use toasts for navigation / confirmation flows — that's a dialog.

## References

- **Figma component**: [`Toast` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-toast
- **Source**: `packages/components/toast/src/`
- **Tokens used**:
  - Appearances: `alert/primary-subtle/*`, `alert/success-subtle/*`, `alert/danger-subtle/*`, `alert/warning-subtle/*`, `alert/info-subtle/*`
  - Close button: `toast/close`

## Changelog

- `0.1.0` — Initial release. Signal-driven service, four corner positions, six appearances, optional action button, configurable auto-dismiss, portal-to-body host.
