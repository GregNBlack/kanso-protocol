# Migrating from Kanso v1.x → v2.0.0

v2 replaces 10 components' previously-custom-element implementations with
real native HTML form primitives. Templates / FormData / HTML5 validation
/ label-association / browser-native mutual exclusion / native `<dialog>`
all work without polyfills now.

## TL;DR

Two components changed their **selector**:

| Old (v1) | New (v2) |
|---|---|
| `<kp-button ...>` | `<button kpButton ...>` |
| `<kp-tab ...>` | `<button kpTab ...>` |

Eight components kept the same selector — their template internals
changed but `<kp-checkbox>`, `<kp-radio>`, `<kp-toggle>`,
`<kp-segmented-control>`, `<kp-theme-toggle>`, `<kp-file-upload>`,
`<kp-dialog>`, `<kp-select>` are still your entry points.

## Button — `<kp-button>` → `<button kpButton>`

```diff
- <kp-button variant="default" color="primary" (click)="save()">Save</kp-button>
+ <button kpButton variant="default" color="primary" type="submit" (click)="save()">Save</button>
```

**What changed**
- The component is now an attribute selector on a real native `<button>`.
- `type` defaults to `"button"` (matching the v1 behaviour — native
  buttons default to `"submit"` which surprised consumers).
- `[disabled]` now reflects to the native `disabled` attribute, so the
  browser blocks click events entirely. v1 used `pointer-events: none`
  and `event.preventDefault()`.
- `Enter` / `Space` keyboard activation is browser-native — no manual
  keydown handler.

**Migration**
1. Find/replace `<kp-button` → `<button kpButton`
2. Find/replace `</kp-button>` → `</button>`
3. For buttons inside `<form>`s that should submit: add `type="submit"`
4. For *self-closing* `<kp-button .../>` (rare): rewrite to paired
   `<button kpButton ...></button>` — `<button>` is not a void element.

## Tab — `<kp-tab>` → `<button kpTab>`

Same pattern as Button.

```diff
- <kp-tab label="Inbox" [selected]="active==='inbox'" (selectedChange)="..."/>
+ <button kpTab label="Inbox" [selected]="active==='inbox'" (selectedChange)="..."></button>
```

## Checkbox / Radio / Toggle — same selector, new inputs

Selector stays `<kp-checkbox>` / `<kp-radio>` / `<kp-toggle>`. New
inputs you can leverage for form participation:

| Input | Type | What it does |
|---|---|---|
| `[name]` | `string \| null` | Native `name` attribute. Required for FormData submission. |
| `[value]` | `string \| null` | Native `value` attribute. The value submitted when the box is checked. |
| `[required]` | `boolean` | Triggers native HTML5 required-validation. |

Indeterminate (checkbox only) is now the native DOM property — the
result looks identical.

## Radio group — browser-native mutual exclusion

`<kp-radio-group>` continues to coordinate child radios, but the
underlying mechanism is now native: radios share a `name` attribute,
browser de-selects siblings automatically. No internal register/unregister
hooks visible to consumers — same `[(value)]` / `(valueChange)` API.

## SegmentedControl / ThemeToggle — radios under the hood

`<kp-segmented-control>` and `<kp-theme-toggle variant="segmented">`
now render native `<input type="radio">` groups instead of `role="tab"`
buttons. Browser-native arrow-key navigation between segments works
automatically. New `[name]` input on SegmentedControl for FormData.

## FileUpload — drop zone is now a `<label>`

The drop zone is a real `<label>` wrapping the file `<input>`. Click /
keyboard activation / drag-drop all work natively. New inputs:
`[name]`, `[required]`.

## Dialog — native `<dialog>` element

`<kp-dialog>` now wraps a native `<dialog>`. Focus trap, top-layer
stacking, ESC, `::backdrop` styling — all browser-native. The component
calls `.showModal()` / `.close()` on the native element under the hood.

Public API (`[(open)]`, `(closed)`, slots, sizes, etc.) is unchanged.
**Browser support**: native `<dialog>` is supported in Chrome 37+ /
Edge 79+ / Firefox 98+ / Safari 15.4+ — all major evergreens.

## Select — hidden form input for FormData

`<kp-select>` now renders a hidden `<input>` mirror that carries the
selected value. New inputs:

- `[name]` — sets the form-field name
- `[required]` — triggers native HTML5 validation when no value is set

For multi-select, the hidden input value is a comma-joined string. If
you need an array on submit, prefer Angular forms / FormGroup over raw
FormData.

## Angular peer-dependency floor

Unchanged from v1.0.1 (`@angular/* >= 21.0.0`).

## Why this release

Re-implementing native HTML semantics in custom elements is a category
of avoidable bug. v1.x had:
- Buttons that wouldn't submit `<form>`s
- Checkboxes / radios / toggles invisible to FormData and HTML5
  validation
- Custom focus-trap code in dialogs duplicating what native `<dialog>`
  has built in for two years
- A fake "tablist" inside segmented control that broke
  browser-native arrow-key behaviour

v2 fixes all of this by leaning on the platform.

## Test counter

Total tests across the suite: **414 → 414** (specs were rewritten to
target the new contracts, not added net-new). All 44 spec files pass.
