# TimePicker

> Input-triggered picker for hour / minute (optional second), with 12h / 24h display and staged Apply.

## Contract

`<kp-time-picker>` renders an Input-like trigger with a clock icon. Clicking it opens a portaled panel with one scrollable column per time unit (hour / minute / optional second) and, in 12h mode, an AM/PM column. Picks are staged in a draft until the user clicks **Apply** — so accidental scrolls and clicks don't dirty the bound model. Panel portals to `<body>` and flips above the trigger when there's not enough room below.

### Anatomy

```
TimePicker
├─ Trigger        — Input-shaped button with clock icon
│   ├─ Value / placeholder
│   ├─ Clear (×)
│   └─ Clock icon
└─ Panel (portaled to <body>)
    ├─ Columns    — Hour | Min | [Sec] | [AM/PM]
    └─ Footer     — "Now" · "Cancel" · "Apply"
```

### Sizes

Uses the Input size grammar for the trigger: `sm / md / lg`.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Trigger size |
| `format` | `'12h' \| '24h'` | `'24h'` | Display format — stored value is always 24-hour |
| `showSeconds` | `boolean` | `false` | Add a seconds column (and emit `HH:mm:ss`) |
| `minuteStep` | `number` | `1` | Step for the minute column (use `5` / `15` / `30` for rounded pickers) |
| `secondStep` | `number` | `1` | Step for the seconds column |
| `placeholder` | `string` | `'Select time'` | Trigger text when empty |
| `showClear` | `boolean` | `true` | Show the × clear affordance |
| `disabled` | `boolean` | `false` | Disable interaction |
| `forceState` | `KpState \| null` | `null` | Pin visual state for docs |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `valueChange` | `string \| null` | User clicks Apply (or clears). Never fires for intermediate hour/minute clicks |
| `openChange` | `boolean` | Panel opens / closes |

### Forms

Implements `ControlValueAccessor`. The bound model is **always** a canonical 24-hour string:

- Without seconds: `"HH:mm"` — e.g. `"09:00"`, `"14:30"`
- With seconds: `"HH:mm:ss"` — e.g. `"09:45:12"`

Display switches between 12h and 24h via `format`, but the emitted value never changes shape based on display.

```html
<!-- 24h -->
<kp-time-picker [(ngModel)]="meetingStart"/>

<!-- 12h display, same canonical value -->
<kp-time-picker format="12h" [(ngModel)]="meetingStart"/>

<!-- Rounded 15-minute picker -->
<kp-time-picker [minuteStep]="15" [(ngModel)]="slot"/>

<!-- With seconds -->
<kp-time-picker [showSeconds]="true" [(ngModel)]="timestamp"/>
```

## States

| State | Behavior |
|-------|----------|
| rest | Input-styled trigger, no panel |
| hover | Trigger border darkens |
| focus / open | Trigger border turns blue; panel visible (portaled) |
| disabled | Muted trigger, no interaction |
| error | Red border |

## Accessibility

- Trigger is a `<button>` with `aria-haspopup="dialog"` and `aria-expanded`.
- Panel carries `role="dialog"` with `aria-label="Choose time"`.
- Column items are real `<button>`s, so `Tab` moves between them.
- `Esc` cancels (discards draft, closes).
- Click outside cancels.
- "Apply" commits; "Cancel" discards.

## Do / Don't

### Do
- Use `minuteStep={5 | 15 | 30}` for booking, availability, and scheduling UIs — humans rarely want minute-precision for future appointments.
- Pair with `<kp-date-picker>` side by side for datetime fields.
- Leave `format` on the default `24h` unless the product's locale conventions say otherwise — always safe to switch at display time.

### Don't
- Don't treat the bound value as locale-dependent — it's always `HH:mm[:ss]` 24h.
- Don't enable `showSeconds` unless users actually need second-precision — the extra column adds friction for the common case.
- Don't rely on the "Now" button to commit — it fills the draft, but the user still has to click Apply.

## References

- **Figma component**: [`TimePicker` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-timepicker
- **Source**: `packages/components/timepicker/src/`
- **Tokens used**: reuses `datepicker/panel-*`, `datepicker/day-bg-*`, `datepicker/day-fg-*`, `datepicker/weekday`

## Changelog

- `0.1.0` — Initial release. 12h / 24h, optional seconds, 3 sizes, minute/second stepping, staged Apply, portal-to-body panel, full CVA support.
