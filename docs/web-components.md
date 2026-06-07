# Web Components (use Kanso without Angular)

Kanso ships an **Angular implementation**, but its components can be compiled to **framework-agnostic custom elements** so React, Vue, Svelte, or plain HTML can use the same design system. This is the bridge for non-Angular teams.

> **Status: experimental / foundational.** The build and a runtime smoke are in the repo (`npm run build:elements`, CI `web-components` job); a published `@kanso-protocol/elements` package with per-component bundles is a tracked follow-up. If you're on Angular, use the native [`@kanso-protocol/ui`](getting-started.md) package — don't ship the custom-elements bundle (it embeds the Angular runtime).

## Build the bundle

```bash
npm run build:elements
# → dist/elements/kanso-elements.mjs  (self-contained ESM, includes the Angular runtime)
```

It registers **73 element-selector components** (`<kp-badge>`, `<kp-card>`, `<kp-select>`, …) auto-discovered from `packages/ui`. The build runs the Angular linker over the AOT output so no `@angular/compiler` is needed at runtime.

## Use it

Load the bundle as a module (it auto-defines every `kp-*` element) plus the token stylesheet:

```html
<link rel="stylesheet" href="@kanso-protocol/ui/styles/tokens.css" />
<script type="module" src="/path/to/kanso-elements.mjs"></script>

<kp-badge appearance="success">Active</kp-badge>
<kp-card>
  <h3>Hello from any framework</h3>
</kp-card>
```

Or import and control timing:

```js
import { defineKansoElements } from './kanso-elements.mjs';
await defineKansoElements();
```

Components render in **light DOM**, so the global `tokens.css` and any [brand theme](theming.md) apply unchanged — no shadow-DOM style piercing needed.

## API mapping (Angular → custom element)

| Angular | Custom element |
|---|---|
| `@Input() foo` (string/number/bool) | attribute `foo="…"` **or** JS property `el.foo = …` |
| `@Input() items` (object/array) | JS property only: `el.items = [...]` (attributes are strings) |
| `@Output() valueChange` | DOM event: `el.addEventListener('valueChange', e => e.detail)` |
| content projection (`<ng-content>`) | light-DOM children / named slots |

### React

```jsx
function Demo() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el.items = [{ id: 1, label: 'One' }];          // object input via property
    const onChange = (e) => console.log(e.detail);  // output via event
    el.addEventListener('valueChange', onChange);
    return () => el.removeEventListener('valueChange', onChange);
  }, []);
  return <kp-select ref={ref} size="md" />;
}
```

(React ≤ 18 passes unknown props as attributes — set object inputs and listen to events via a ref as above. React 19 supports custom-element properties/events directly.)

### Vue

```vue
<kp-select :items.prop="options" size="md" @valueChange="onChange" />
```

Tell Vue these are custom elements: `app.config.compilerOptions.isCustomElement = (t) => t.startsWith('kp-')`.

## Not available as custom elements

Four surfaces can't be plain custom elements (they're attribute selectors on native elements or structural directives). Non-Angular consumers use the underlying primitive directly:

| Kanso | Why | Use instead |
|---|---|---|
| `button[kpButton]` | styles a native `<button>` | a `<button>` with the `.kp-button` classes (see button docs) |
| `button[kpTab]` | styles a native `<button>` | a `<button>` with the `.kp-tab` classes |
| `[kpVirtualRow]` | structural directive | Angular-only |
| `ng-template[kpTableCell]` | template ref | Angular-only |

## Bundle size

The bundle embeds the Angular runtime, so it's ~1.9 MB minified (~300–400 KB gzipped) for all 73 components. That's the cost of a framework-agnostic distribution. For per-component or per-app trimming, tree-shake by building a custom entry that imports only the `KANSO_ELEMENTS` subset you need (the registry is plain data). **Angular apps should use `@kanso-protocol/ui` instead** — same components, no embedded runtime, full tree-shaking.

## How it works (for maintainers)

- `scripts/generate-elements-registry.js` scans `packages/ui` for `kp-*` selectors → `packages/elements/src/registry.generated.ts` (`{ tag, component }[]`).
- `packages/elements/src/main.ts` bootstraps a zoneless Angular application (`createApplication` + `provideZonelessChangeDetection`) and `createCustomElement`-registers each entry.
- `scripts/build-elements.js` esbuild-bundles it, with two plugins: one pins `@kanso-protocol/ui/*` to the AOT `dist/fesm2022` (the npm-workspace symlink points at source, which esbuild can't compile), and one runs the **Angular linker** (`@angular/compiler-cli/linker/babel`) over partial-compiled modules so they don't need a runtime JIT compiler.
- `e2e/elements.spec.ts` loads the bundle on a blank page and asserts elements upgrade + render (CI `web-components` job).
