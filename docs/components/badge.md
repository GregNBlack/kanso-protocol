# Badge

> Compact label for statuses, tags, counters, and other short pieces of metadata.

## Contract

Badge is a small, inline element — never full-width, never interactive on its own (beyond the optional close affordance). Use it to attach one to three short pieces of metadata next to content. Reach for it for statuses ("Online", "Pending"), category tags ("Design", "Archived"), or counters ("99+"). Don't use it as a button surface — if a user is meant to click the badge to navigate, use a link or a button instead.

### Anatomy

```
Host (inline-flex)
├─ Leading Dot  (optional — always on when appearance=dot)
├─ Leading Icon (optional — projected via [kpBadgeIcon])
├─ Label        (default ng-content slot)
└─ Close        (optional — ✕ button, emits `close`)
```

- **Leading Dot** — a small filled circle whose color follows the role. Independent slot: set `showLeadingDot` to turn it on for any appearance; it is forced on when `appearance='dot'` since the dot is the only color cue in that mode.
- **Leading Icon** — a Tabler-style stroked 12 / 14 / 16px SVG projected via the `[kpBadgeIcon]` selector. Uses `currentColor`, so it naturally picks up `fg` for the current role × appearance.
- **Label** — the default content slot; single line, `tabular-nums` applied so counters line up.
- **Close** — only rendered when `closable=true`. Emits the `close` event on click. Use it for removable tags (filters, chips).

### Sizes

| Size | Height | Padding-x | Font | Icon | Dot | Close | Radius | Pill radius | Gap |
|------|--------|-----------|------|------|-----|-------|--------|-------------|-----|
| xs   | 18     | 6         | 11   | 12   | 6   | 10    | 4      | 9           | 4   |
| sm   | 22     | 8         | 12   | 14   | 6   | 12    | 6      | 11          | 4   |
| md   | 26     | 10        | 13   | 16   | 8   | 14    | 8      | 13          | 6   |

Heights are fixed; width hugs contents.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md'` | `'md'` | Component size |
| `appearance` | `'filled' \| 'subtle' \| 'outline' \| 'dot'` | `'filled'` | Visual treatment |
| `color` | `'primary' \| 'danger' \| 'success' \| 'warning' \| 'info' \| 'neutral'` | `'primary'` | Semantic color role |
| `pill` | `boolean` | `false` | Use fully rounded (`height / 2`) corners instead of the size-scaled radius — for chips and word-bearing tags |
| `count` | `boolean` | `false` | Counter shape — tight circle (`min-width = height`, 2px horizontal padding) for short numeric content like `1`, `12`, `99+`. Use this for notification badges; pair with `size="xs"` |
| `showLeadingDot` | `boolean` | `false` | Render the leading dot marker. Automatically `true` when `appearance='dot'` |
| `closable` | `boolean` | `false` | Render a ✕ button after the label and emit `close` when clicked |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `close` | `EventEmitter<MouseEvent>` | Fires when the close button is clicked |

### Content projection

- **Default slot** — the label text. Keep it short (1–3 words or a counter).
- **`[kpBadgeIcon]` slot** — a single leading SVG icon. The SVG should use `stroke="currentColor"` so it inherits the role × appearance `fg`. Example:
  ```html
  <kp-badge color="success" appearance="subtle">
    <svg kpBadgeIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12l5 5L20 7"/>
    </svg>
    Active
  </kp-badge>
  ```

## Variants

| Dimension | Values |
|-----------|--------|
| Size | xs, sm, md |
| Appearance | filled, subtle, outline, dot |
| Color | primary, danger, success, warning, info, neutral |
| Shape | rounded (default), pill, count |

### Appearances, visually

- **Filled** — solid role-colored background, white (or dark for warning) text. High-contrast; use sparingly.
- **Subtle** — tinted background + darker role-colored text. The workhorse variant for tags and statuses.
- **Outline** — transparent background + 1px role-colored border + darker role text. Use when the container behind the badge already has a colored fill.
- **Dot** — no background or border. A colored dot is mandatory (auto-shown); label is neutral gray. Reads as a pure status indicator.

## States

Badge is **non-interactive by default** — it has no hover / active / focus / disabled states on the host. The only interactive element is the optional close button, which gets a subtle hover (`opacity` + dim background) and a focus-visible ring.

## Accessibility

- The host is a plain span-like container with no ARIA role — screen readers just announce the text content. If the badge value is a status ("Online"), that's usually enough; pair with surrounding context (e.g. "User status: Online") if not.
- The close button is a real `<button>` with `aria-label="Remove"`. When you wrap the badge in a list of tags, provide a surrounding `role="list"` container so SRs announce count.
- Colors are not the sole carrier of meaning — the text always conveys the status/tag/count. `dot` appearance still includes the label as text, so a greyscale reader is not disadvantaged.
- For counters that are purely visual (e.g. a "3" overlaid on a notification bell), provide a visually-hidden `sr-only` label like "3 unread notifications" next to the badge.

## Do / Don't

### Do
- Use for short statuses, category tags, and counters that fit in 1–3 words
- Pair with surrounding context so the badge doesn't carry semantics alone
- Use `subtle` as the default — `filled` should be reserved for the most prominent states (error, highlighted counters)
- Use `dot` appearance for "live" status indicators (Online / Away / Busy)
- Use `pill` shape for closable chips and word-bearing tags ("Pro", "Enabled", "Design")
- Use `count` shape for short-number notification badges (`size="xs" [count]="true"` with content like `1` / `12` / `99+`)

### Don't
- Don't put long sentences inside a badge — if truncation kicks in, switch to a different UI
- Don't wrap a badge in a `<a>` or make the entire badge clickable — use a button or link instead; badges only expose the close affordance
- Don't build interactive toggles with badges — use `Checkbox`, `Toggle`, or `SegmentedControl`
- Don't use `filled` for every tag in a list — the page turns into rainbow noise
- Don't mix `filled` and `outline` in the same row — it reads as inconsistency, not hierarchy

## References

- **Figma component**: [`Badge` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3206-44)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-badge
- **Source**: `packages/components/badge/src/badge.component.ts`
- **Tokens used**:
  - Background: `badge/{color}/{appearance}/bg`
  - Foreground: `badge/{color}/{appearance}/fg`
  - Border: `badge/{color}/{appearance}/border`
  - Dot: `badge/{color}/{appearance}/dot`
  - Focus (close button): `color/focus/ring`
  - Typography: 11 / 12 / 13 px Onest Medium

## Changelog

- `0.1.0` — Initial component. 3 sizes × 4 appearances × 6 color roles × 2 shapes. Leading dot and close affordance; `[kpBadgeIcon]` projection slot for Tabler-style icons. Token-driven colors from the generated `--kp-color-badge-*` custom properties.
- `0.1.x` — Split overloaded `pill` into two intents: `pill` is now purely a shape (full-radius corners + normal padding) for chips and word-bearing tags; `count` is the new boolean for notification-style circular counters (full radius + `min-width = height` + tight 2px padding + center alignment). Fixes cramped horizontal padding on non-closable pill badges with text content.
