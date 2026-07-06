# Web Components (use Kanso without Angular)

Kanso ships an **Angular implementation**, but its components can be compiled to **framework-agnostic custom elements** so React, Vue, Svelte, or plain HTML can use the same design system. This is the bridge for non-Angular teams.

> **Status: experimental (`0.x`), published as [`@kanso-protocol/elements`](https://www.npmjs.com/package/@kanso-protocol/elements).** The API is stable; the packaging (one bundle today) may evolve. If you're on Angular, use the native [`@kanso-protocol/ui`](getting-started.md) package instead — don't ship the custom-elements bundle (it embeds the Angular runtime).

## Install

```bash
npm install @kanso-protocol/elements @kanso-protocol/ui
```

`@kanso-protocol/ui` is only for the token stylesheet (`styles/tokens.css`); the **73 element-selector components** (`<kp-badge>`, `<kp-card>`, `<kp-select>`, …) are bundled in. The bundle is built by running the Angular linker over the AOT output, so no `@angular/compiler` is needed at runtime.

## Use it

Import the package once (it auto-defines every `kp-*` element) plus the token stylesheet:

```html
<link rel="stylesheet" href="node_modules/@kanso-protocol/ui/styles/tokens.css" />
<script type="module">
  import '@kanso-protocol/elements';
</script>

<kp-badge appearance="success">Active</kp-badge>
<kp-card>
  <h3>Hello from any framework</h3>
</kp-card>
```

Or control timing:

```js
import { defineKansoElements } from '@kanso-protocol/elements';
await defineKansoElements();
```

> Building from source instead? `npm run build:elements` → `dist/packages/elements/kanso-elements.mjs`.

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

## Server-side rendering

**The `<kp-*>` custom elements are client-upgrade-only — they do not server-render.** The bundle bootstraps a browser-platform Angular application (`createApplication` from `@angular/platform-browser`) and its auto-define is gated on `typeof customElements !== 'undefined'`, which is false in Node. So under React/Next.js (or any) SSR, `<kp-badge>Active</kp-badge>` is emitted to the server HTML as an un-upgraded element — its projected light-DOM children render, but Kanso's own markup/styling only appears after the bundle loads and upgrades it on the client. Plan for that flash:

- Reserve layout space (fixed height / skeleton) for elements that render empty pre-upgrade, so hydration doesn't shift the page.
- Or gate the element behind a client-only boundary (e.g. Next.js `dynamic(..., { ssr: false })`).

> The **`SSR-safe`** guarantee in [`docs/ssr.md`](ssr.md) applies to the native Angular package [`@kanso-protocol/ui`](getting-started.md) with `@angular/ssr`, **not** to the custom-elements bundle. If you need true server-rendered Kanso markup, that path is Angular-only today. (Declarative Shadow DOM SSR is incompatible with Kanso's deliberate light-DOM + global-token architecture.)

## TypeScript & JSX

The package ships generated type metadata so `<kp-*>` type-checks in a TSX/React project instead of erroring as an unknown element:

- **`custom-elements.json`** — a [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest) describing every tag's attributes, properties, and events. IDEs and tools that read the CEM get autocomplete + hover docs.
- **JSX types** — importing `@kanso-protocol/elements` augments `JSX.IntrinsicElements` with a typed entry per tag (props derived from each component's `@Input()`s, plus `ref`). No hand-written `declare global` needed.

```tsx
// after `import '@kanso-protocol/elements'` — <kp-select> is now type-checked
<kp-select size="md" placeholder="Pick one" />
```

React 19 forwards custom-element properties and events natively, so object inputs and `on…` events work without the `useRef` + `addEventListener` recipe shown above (still required on React ≤ 18).

## How it works (for maintainers)

- `scripts/generate-elements-registry.js` scans `packages/ui` for `kp-*` selectors → `packages/elements/src/registry.generated.ts` (`{ tag, component }[]`).
- `packages/elements/src/main.ts` bootstraps a zoneless Angular application (`createApplication` + `provideZonelessChangeDetection`) and `createCustomElement`-registers each entry.
- `scripts/build-elements.js` esbuild-bundles it, with two plugins: one pins `@kanso-protocol/ui/*` to the AOT `dist/fesm2022` (the npm-workspace symlink points at source, which esbuild can't compile), and one runs the **Angular linker** (`@angular/compiler-cli/linker/babel`) over partial-compiled modules so they don't need a runtime JIT compiler.
- `e2e/elements.spec.ts` loads the bundle on a blank page and asserts elements upgrade + render (CI `web-components` job).
