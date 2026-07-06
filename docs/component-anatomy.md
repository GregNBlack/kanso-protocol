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

This is a *conceptual* contract, not a literal DOM invariant: simple controls
may fuse **Container** and **Content** onto one node (e.g. Input / Select put
`display: flex` directly on the host), and **Body** surfaces under a
role-specific class (`__label` on Button, `__value` on Select, `__field` on
Input) rather than a literal `__body`. The *vocabulary* is uniform even when the
node count isn't.

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

Every interactive component implements the same six **core** states; form
controls (Input, Select, …) add a seventh, `error`. The `KpState` union is
therefore seven values (`rest | hover | active | focus | disabled | loading |
error`) — button-family components use the first six, form-family components add
`error`.

| State | Visual cue | ARIA |
|-------|------------|------|
| `rest` | Default idle | — |
| `hover` | Background or border shifts one step | — |
| `active` | Mid-press, shifts one step further | — |
| `focus` | Focus ring — `--kp-focus-ring-width` outline (or border swap for inputs) | — |
| `disabled` | Muted contrast, `pointer-events: none` | see rule 3 |
| `loading` | Spinner replaces a slot, layout preserved | `aria-busy="true"` |
| `error` *(form controls)* | Border + helper text turn danger | `aria-invalid="true"` |

Three rules that catch most mistakes:

1. **`loading` is not `disabled`.** They are *separate* boolean inputs with
   distinct token ramps and distinct semantics: `loading` is a temporary busy
   state (`aria-busy`), `disabled` is inoperable (`aria-disabled`). Note: on
   native form controls (e.g. `<button kpButton>`) `loading` also asserts the
   real `disabled` attribute while busy — this is deliberate (it blocks the
   axe color-contrast rule from flagging the spinner and prevents double-submit),
   so a natively-loading control is not focusable *during* the load. Host-element
   controls (`kp-input`, `kp-select`) don't have a `loading` state.
2. **State is one axis, variant is another.** A `subtle` `danger` button in
   `hover` is `variant=subtle, color=danger, state=hover` — three orthogonal
   choices, not one combined enum.
3. **ARIA mapping is per-element-family, not uniform.** Native form elements
   (`<button kpButton>`) use the *native* `disabled` attribute (no
   `aria-disabled`); host-element controls (`kp-input`, `kp-select`) expose
   `[attr.aria-disabled]` / `[attr.aria-invalid]`. Both are correct — the native
   attribute is preferred where a real form control exists.

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
- **Focus** — `:focus-visible` only (no focus rings for mouse users). The ring
  is `var(--kp-focus-ring-width) solid var(--kp-color-focus-ring)` with
  `var(--kp-focus-ring-offset)` — thickness, offset, and color are all tokens.
- **ARIA states** — `aria-busy`, `aria-invalid`, `aria-expanded` and disabled
  semantics track the Angular inputs, but the *disabled* mapping is
  element-family-specific (see State-model rule 3): native form elements use the
  native `disabled` attribute; host-element controls use `aria-disabled`.
- **Color contrast** — automatic via tokens, and **machine-verified**: the
  curated foreground/background token pairs are checked for WCAG AA in *both*
  themes on every CI run (`npm run check:contrast`, `scripts/contrast-pairs.json`),
  so a contrast regression fails the build rather than shipping on an unverified
  comment.
- **Reduced motion** — every component honors `@media (prefers-reduced-motion:
  reduce)`, collapsing transitions/decorative animation (loading indicators keep
  a slowed cue).
- **Forced colors** — interactive controls carry `@media (forced-colors: active)`
  rules so focus rings and selected/checked state stay visible under Windows
  High Contrast.

If a component needs to deviate (e.g. `iconOnly` Button requires `aria-label`),
the deviation is called out in that component's `Accessibility` section.

## Where to go next

- **Per-component anatomy** — every file under [`docs/components/`](./components/)
  starts with an `Anatomy` block following the structure above.
- **Patterns** — [`docs/patterns/`](./patterns/) covers higher-order
  compositions (AppShell, FormSection, Sidebar) built *from* these atoms.
- **Adding a component** — copy [`docs/components/_template.md`](./components/_template.md)
  and fill in the same sections.
