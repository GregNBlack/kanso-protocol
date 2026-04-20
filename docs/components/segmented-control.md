# SegmentedControl

> Pill-style switcher for 2–5 mutually exclusive options.

## Contract

SegmentedControl is a horizontal group of 2–5 segments inside a gray pill-shaped track. Exactly one segment is selected at a time — it lifts above the track as a white "pill" with a soft drop-shadow. Use it when the full list of choices is short, known, and worth showing all at once; reach for Select instead when the list is longer or dynamic.

### Anatomy

```
Track (host)
└─ Segment (repeated, one per option)
   ├─ Icon (optional)
   └─ Label (optional)
```

- **Track** — gray `segmented/track-bg` pill, 2px internal padding on all sides so the selected segment sits flush inside; radius = segment radius + 2
- **Segment** — button per option, `iconOnly`-square-like when icons only, or wider when text; height per size; `segmented/segment-*` tokens drive bg and fg
- **Icon** — 14 / 16 / 18 / 22 / 24px Tabler-style stroked icon (size follows the control's size)
- **Label** — medium-weight text, tabular-nums not applied here (unlike NumberStepper) since labels are free text

The selected segment gets `0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.08)` box-shadow — the subtle lift that signals the "active pill" above the track.

### Animation

The pill is a **single** absolutely-positioned element that lives behind all segments (z-index 0, segments at z-index 1). When the value changes, its `transform: translateX(…)` and `width` update to the next segment's position and width, animated with `240ms cubic-bezier(0.32, 0.72, 0, 1)` — an ease-out curve that matches the iOS "tab switcher" feel. Segments stay transparent; only their text color changes when selected, also transitioned over 240ms so the color swap resolves in step with the pill sliding.

The pill is fade-in invisible on first paint and the transition class is applied two RAF frames later, so the pill never animates from `(0, 0)` on initial render. A `ResizeObserver` re-measures whenever the host or a segment changes size (font loads, label edits, responsive layout).

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Component size — matches Input / Button |
| `options` | `KpSegmentOption[]` | `[]` | Segments to render |
| `display` | `'text' \| 'icon' \| 'icon-text'` | `'text'` | What to render inside each segment |
| `disabled` | `boolean` | `false` | Disable the entire control |

### Option shape

```ts
interface KpSegmentOption {
  value: string;
  label?: string;
  icon?: string;      // SVG `d` attribute, Tabler-style stroked
  disabled?: boolean; // disable this single segment
}
```

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `valueChange` | `EventEmitter<string>` | Fires on every selection change |

Implements `ControlValueAccessor` — use `[(ngModel)]` or reactive-form bindings. Model value is `string \| null`.

### Content projection

None — segments are passed via the `options` input. For a custom icon set, pass the SVG `d` attribute string in `option.icon`.

## Variants

| Dimension | Values |
|-----------|--------|
| Size | xs (20px segment / 24px track), sm (24 / 28), md (32 / 36), lg (40 / 44), xl (48 / 52) |
| Display | text, icon, icon-text |
| State | rest, hover (unselected only), active / selected, disabled |

Per-size sizing:

| Size | Segment h | Segment radius | Track radius | Pad-x | Icon | Font |
|------|-----------|----------------|--------------|-------|------|------|
| xs   | 20        | 6              | 8            | 8     | 14   | 12   |
| sm   | 24        | 8              | 10           | 10    | 16   | 14   |
| md   | 32        | 10             | 12           | 12    | 18   | 14   |
| lg   | 40        | 12             | 14           | 14    | 22   | 16   |
| xl   | 48        | 14             | 16           | 16    | 24   | 20   |

## States

| State | Behavior |
|-------|----------|
| rest (unselected) | Transparent bg, muted fg (`gray.600`) |
| hover (unselected) | Light gray bg (`gray.200`), darker fg (`gray.900`) |
| selected | White bg, dark fg, lift shadow |
| focus | 2px blue outline (focus ring) offset 1px inside the segment |
| disabled (segment) | Muted fg (`gray.400`), no hover, `aria-disabled="true"`, not in the roving tab sequence |
| disabled (control) | Whole track at 0.6 opacity, `pointer-events: none`, `aria-disabled="true"` |

## Accessibility

- **Role**: host is `role="tablist"`; each segment is `<button role="tab">` with `aria-selected="true\|false"`
- **Keyboard (roving tabindex)**:
  - `Tab` enters the control — focus lands on the currently-selected segment
  - `Arrow Right` / `Arrow Left` — cycle through enabled segments (wraps)
  - `Home` / `End` — jump to first / last enabled segment
  - `Space` / `Enter` — native button activation (same as clicking)
  - Activation also moves focus, so the selected segment is always the one with `tabindex="0"`
- **Skipped segments**: disabled segments are skipped by arrow-key navigation
- **Screen reader**: announces "tablist, {N} tabs"; per segment "{label}, tab, selected / not selected"
- **Icon-only segments** MUST have a meaningful label in the option's `value` or an explicit `aria-label` on the host for screen readers

## Do / Don't

### Do
- Use for 2–5 mutually exclusive options that are worth showing all at once (view mode, time period, pricing tier)
- Pair with Input / Button of the same size in a form row
- Use `icon-text` mode when the icon is decorative and the label carries the meaning
- Use `icon` only when the meaning is unambiguous from the icon itself (grid / list toggle)
- Localize all labels — truncation inside a segment looks broken

### Don't
- Don't use for more than 5 segments — use Select or Radio list instead
- Don't use for multi-select — use Checkbox group
- Don't hide the whole track when only one option is valid — use a plain label
- Don't style the track or segments with custom CSS to match a brand colour; let the shared semantic tokens drive it
- Don't put an icon-only SegmentedControl without either `value`-driven labels (for SR) or an `aria-label`

## References

- **Figma component**: [`SegmentedControl` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3180-2075)
- **Figma Segment primitive**: [`Segment` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System?node-id=3179-5338)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-segmentedcontrol
- **Source**: `packages/components/segmented-control/src/segmented-control.component.ts`
- **Tokens used**:
  - Track: `segmented/track-bg`
  - Segment bg: `segmented/segment-bg/*` (selected / unselected-rest / unselected-hover / disabled)
  - Segment fg: `segmented/segment-fg/*`
  - Focus: `color/focus/ring`
  - Typography: palette Text Styles (`text/xs`, `text/sm`, `text/md`, `text/lg`) mapped by size
  - `primitive.sizing.{xs|sm|md|lg|xl}`, `primitive.radius.comp.{xs|sm|md|lg|xl}`

## Changelog

- `0.1.0` — Initial component. Options-driven API (2–5 segments), `text` / `icon` / `icon-text` display modes, full CVA integration, roving-tabindex keyboard nav (arrows + home/end), palette-aligned typography.
- `0.1.1` — Animate the selection: single absolutely-positioned pill slides between segments with a 240ms ease-out transform/width transition, synchronized with a 240ms text-color cross-fade on the old/new segments. ResizeObserver keeps the pill aligned when labels or viewport size change.
