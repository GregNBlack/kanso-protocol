# DatePicker

> Input-triggered calendar popup. Single date or date-range, with optional preset panel.

## Contract

`<kp-date-picker>` renders an Input-like trigger. Clicking it opens a portaled calendar panel where the user navigates months / years and picks either a single day (`mode="single"`) or a two-click range (`mode="range"`). Value is exposed via `ControlValueAccessor`, so `ngModel` / reactive forms work without any glue.

### Anatomy

```
DatePicker
├─ Trigger             — Input-shaped button with calendar icon
│   ├─ Value / placeholder
│   ├─ Clear (×)        — appears when a value is set
│   └─ Calendar icon
└─ Panel (portaled to <body>)
    ├─ Presets column (optional)
    └─ Calendar
        ├─ Header       — prev / month-year title / next
        ├─ Weekday row  — Mo Tu We Th Fr Sa Su (or Sun-first)
        └─ Grid         — 42 day cells / 12 months / 12 years
```

### Sizes

Shares the Input size ramp (`xs / sm / md / lg / xl`) — the trigger height, radius, typography, and clear-button scale mirror `<kp-input>` so the two sit flush in a form row.

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size ramp |
| `mode` | `'single' \| 'range'` | `'single'` | Single date or range |
| `placeholder` | `string` | `'Select date'` | Trigger text when empty |
| `min` | `Date \| null` | `null` | Earliest selectable date |
| `max` | `Date \| null` | `null` | Latest selectable date |
| `showClear` | `boolean` | `true` | Show the × clear affordance |
| `showPresets` | `boolean` | `false` | Show the preset column on the left of the panel |
| `presets` | `KpDatePickerPreset[] \| null` | `null` | Override preset list (defaults cover Today / Yesterday / Last 7 · 30d / This · Last month) |
| `firstDayOfWeek` | `0 \| 1` | `1` | Sunday (`0`) or Monday (`1`) start |
| `dateFormatter` | `((d: Date) => string) \| null` | `null` | Custom formatter for the trigger text |
| `rangeSeparator` | `string` | `' – '` | Separator between start and end in the trigger |
| `disabled` | `boolean` | `false` | Disable interaction |
| `forceState` | `KpState \| null` | `null` | Pin visual state for docs |

### Outputs

| Name | Payload | Fires when |
|------|---------|------------|
| `valueChange` | `Date \| [Date \| null, Date \| null] \| null` | User commits a new date / range, or clears |
| `openChange` | `boolean` | Panel opens / closes |

### Forms

Implements `ControlValueAccessor`. In single mode `ngModel` is `Date \| null`; in range mode it's `[Date \| null, Date \| null]`.

```html
<!-- Single -->
<kp-date-picker [(ngModel)]="birthday"/>

<!-- Range -->
<kp-date-picker mode="range" [(ngModel)]="reportRange"/>

<!-- Range with presets -->
<kp-date-picker mode="range" [showPresets]="true" [(ngModel)]="dates"/>
```

### Presets

```ts
interface KpDatePickerPreset {
  label: string;
  // Returns a single Date for single mode or a [start, end] tuple for range mode.
  value: () => Date | [Date, Date];
}
```

Built-in defaults (used when `presets` is left null):

| Label | Value |
|-------|-------|
| Today | today |
| Yesterday | yesterday |
| Last 7 days | [today − 6, today] |
| Last 30 days | [today − 29, today] |
| This month | [first of this month, today] |
| Last month | [first of last month, last of last month] |

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
- Panel carries `role="dialog"` with `aria-label="Choose date"`.
- Day cells are real `<button>`s, so `Tab` / `Shift+Tab` move between them.
- `Esc` closes the panel.
- Click-outside (on both the host and the portaled panel) closes cleanly.
- Disabled days (outside `min`/`max`) use native `disabled` so they can't receive focus.

## Do / Don't

### Do
- Use `showPresets` for reports, analytics and any range picker where common windows dominate usage — it cuts picks from several clicks to one.
- Constrain with `min` / `max` for fields like "date of birth" (no future) or "appointment" (no past).
- Supply a `dateFormatter` to align with the host app's locale / format.

### Don't
- Don't use range mode for a single-value field — use two separate single pickers if start and end are independent and can be cleared individually.
- Don't rely on the built-in format for locales other than English — pass `dateFormatter` with your app's `Intl.DateTimeFormat` instance.

## References

- **Figma component**: [`DatePicker` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-datepicker
- **Source**: `packages/components/datepicker/src/`
- **Tokens used**:
  - Panel: `datepicker/panel-bg`, `datepicker/panel-border`
  - Header: `datepicker/header-fg`, `datepicker/header-nav-fg`
  - Weekday row: `datepicker/weekday`
  - Day cell: `datepicker/day-bg-*`, `datepicker/day-fg-*`, `datepicker/day-today-ring`

## Changelog

- `0.1.0` — Initial release. Single + range, 5 sizes, presets panel, min/max constraints, day/month/year views, portal-to-body panel, full CVA support.
