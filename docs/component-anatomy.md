# Component Anatomy

> Shared vocabulary used in every per-component doc. Read this once and the
> 40+ component pages snap into a consistent shape.

Every component in Kanso Protocol decomposes into the same family of parts.
Naming and responsibilities are deliberately uniform so a designer reviewing
Figma, an engineer writing the Angular template, and a contributor reading the
docs all use the same word for the same thing.

## The four shared parts

```
Container
└─ Content
   ├─ Slot Left  (optional — Icon, Avatar, Adornment)
   ├─ Body       (Label, Value, Text, or projected content)
   └─ Slot Right (optional — Icon, Clear, Spinner, Adornment)
```

| Part | Owns | Token surface |
|------|------|---------------|
| **Container** | Outer dimensions: height, padding, border, radius, background, focus ring | `<component>/bg`, `<component>/border`, `<component>/radius`, `primitive.sizing.*` |
| **Content** | Inner layout: `display: flex`, gap between slots, vertical centering | `primitive.spacing.*` |
| **Slot Left / Right** | Optional, projected. Icons and adornments. | `<component>/icon`, follows the local fg color by default |
| **Body** | The thing the component is *about* — typed text, label, value | `<component>/fg`, `font.family.*`, `font.size.*` |

A component's anatomy diagram is just this skeleton with the optional parts
filled in. If you find yourself inventing a fifth top-level part, you're
probably building two components in one.

## Naming conventions

- **Container** — never "wrapper", "root", "outer". Always `Container`.
- **Content** — never "inner", "stack", "row". Always `Content`.
- **Slot Left / Slot Right** — if a slot has a fixed role (e.g. always a clear
  button), use the role name (`Clear Button`, `Spinner`) and document that it
  occupies the right slot.
- **Label** — visible text the user reads to identify the control.
- **Value** — the user's typed-in or selected data.
- **Placeholder** — only used for empty-state hint text inside text inputs.
- **Helper Text** / **Error Text** — supplied by the surrounding `FormField`,
  not by the component itself.

Stick to these and a reader can scan any anatomy block in two seconds.

## Sizing

Every interactive component supports the same five sizes:

| Size | Container height | Typical use |
|------|------------------|-------------|
| `xs` | 24 px | Inline filters, table-row controls |
| `sm` | 28 px | Compact toolbars, dense forms |
| `md` | 36 px | Default. Forms, dialogs, most pages |
| `lg` | 44 px | Hero CTAs, mobile-first surfaces |
| `xl` | 52 px | Landing pages, oversized empty states |

Mixing sizes in the same row is a contract violation — Input `md` next to
Button `sm` will never line up correctly because radius, padding, and font-size
all scale together.

### Concentric radius (containers built from components)

When a container is composed of components (Dialog, DropdownMenu,
Popover, Card, NotificationCenter, Toast, …), its `border-radius`
must be **one step larger** than the radius of the components inside.
Inner elements then sit visually nested instead of poking corners
into the container's corners.

| Inner components | Container radius token |
|---|---|
| `xs` (8px) | `radius.comp.sm` (10px) |
| `sm` (10px) | `radius.comp.md` (12px) |
| `md` (12px) — **default** | `radius.comp.lg` (14px) |
| `lg` (14px) | `radius.comp.xl` (16px) |
| `xl` (16px) | `radius.comp.xl` (16px — ramp cap) |

The default size across the system is `md`, so most containers
end up at `radius.comp.lg` (14px). Full rule + edge cases:
[ADR §7.3 — Concentric radius rule](architecture-decision-record.md#73-concentric-radius-rule).

## State model

Every interactive component implements the same six states:

| State | Visual cue | ARIA |
|-------|------------|------|
| `rest` | Default idle | — |
| `hover` | Background or border shifts one step | — |
| `active` | Mid-press, shifts one step further | — |
| `focus` | 2 px focus ring (or border swap for inputs) | — |
| `disabled` | Muted contrast, `pointer-events: none` | `aria-disabled="true"` |
| `loading` | Spinner replaces a slot, layout preserved | `aria-busy="true"` |

Two rules that catch most mistakes:

1. **`loading` is not `disabled`.** Loading preserves focus and is temporary;
   disabled removes interactivity entirely. They are *separate* boolean inputs.
2. **State is one axis, variant is another.** A `subtle` `danger` button in
   `hover` is `variant=subtle, color=danger, state=hover` — three orthogonal
   choices, not one combined enum.

Components that don't have a clear "interactive" surface (Skeleton, Divider,
Progress) implement only the states that make sense for them; this is called
out in the component's own States table.

## Variants vs. modes

Kanso draws a hard line:

- **Real variant property** — usually only `size`. Exposed as a Figma variant
  and as an Angular `@Input`.
- **Mode override** — `variant`, `color`, `state`. Managed via Figma Variable
  Modes (e.g. `State`, `Appearance`) and resolved through token aliases at
  render time.

This is why a component with 360 visual combinations (5 × 4 × 3 × 6) ships as
a single Figma component with 5 size variants, not 360 separate frames. The
same principle applies in code: the component reads a few inputs and lets
the token system resolve the rest.

## Accessibility baseline

Every component doc has an `Accessibility` section, but the baseline is the
same across all of them:

- **Role** — uses the most appropriate native element. Custom ARIA roles only
  when a native element doesn't exist (e.g. `role="combobox"`).
- **Keyboard** — fully operable without a mouse. Documented per-component.
- **Focus** — `:focus-visible` only. No focus rings for mouse users.
- **ARIA states** — `aria-disabled`, `aria-busy`, `aria-invalid`,
  `aria-expanded` mirror the Angular inputs 1:1.
- **Color contrast** — automatic via tokens. Components don't pick colors
  themselves; they read semantic tokens that are pre-validated against
  WCAG AA in both light and dark themes.

If a component needs to deviate (e.g. `iconOnly` Button requires `aria-label`),
the deviation is called out in that component's `Accessibility` section.

## Where to go next

- **Per-component anatomy** — every file under [`docs/components/`](./components/)
  starts with an `Anatomy` block following the structure above.
- **Patterns** — [`docs/patterns/`](./patterns/) covers higher-order
  compositions (AppShell, FormSection, Sidebar) built *from* these atoms.
- **Adding a component** — copy [`docs/components/_template.md`](./components/_template.md)
  and fill in the same sections.
