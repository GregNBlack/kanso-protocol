# @kanso-protocol/elements

Framework-agnostic **custom elements** for the [Kanso Protocol](https://github.com/GregNBlack/kanso-protocol) design system. Use `<kp-badge>`, `<kp-card>`, `<kp-select>`, … from **React, Vue, Svelte, or plain HTML** — no Angular required.

> Angular apps should use [`@kanso-protocol/ui`](https://www.npmjs.com/package/@kanso-protocol/ui) instead — same components, no embedded runtime, full tree-shaking. This package embeds the Angular runtime so non-Angular hosts can render Kanso.

> **Status: experimental (`0.x`).** API is stable but the packaging (single bundle today) may evolve. Pin the exact version.

## Install

```bash
npm install @kanso-protocol/elements @kanso-protocol/ui
```

`@kanso-protocol/ui` is used for the token stylesheet (`styles/tokens.css`); the components themselves are bundled in.

## Use

Import once — it auto-defines every `kp-*` element — and load the tokens:

```html
<link rel="stylesheet" href="node_modules/@kanso-protocol/ui/styles/tokens.css" />
<script type="module">
  import '@kanso-protocol/elements';
</script>

<kp-badge appearance="success">Active</kp-badge>
<kp-card><h3>Works in any framework</h3></kp-card>
```

Or control timing:

```js
import { defineKansoElements } from '@kanso-protocol/elements';
await defineKansoElements();
```

Components render in **light DOM**, so the global `tokens.css` and any [brand theme](https://github.com/GregNBlack/kanso-protocol/blob/main/docs/theming.md) apply unchanged.

## API mapping

| Angular | Custom element |
|---|---|
| string/number/bool `@Input` | attribute `foo="…"` or property `el.foo = …` |
| object/array `@Input` | property only: `el.items = [...]` |
| `@Output() valueChange` | `el.addEventListener('valueChange', e => e.detail)` |
| content projection | light-DOM children / named slots |

### React (19+)

```jsx
<kp-select size="md" onValueChange={(e) => setValue(e.detail)} />
```

React ≤ 18: set object inputs and attach listeners via a `ref` (see the [full guide](https://github.com/GregNBlack/kanso-protocol/blob/main/docs/web-components.md)).

### Vue

```vue
<kp-select :items.prop="options" size="md" @valueChange="onChange" />
```

Mark `kp-*` as custom elements: `app.config.compilerOptions.isCustomElement = t => t.startsWith('kp-')`.

## Not available as elements

Four Kanso surfaces are attribute selectors / structural directives and can't be custom elements: `kpButton` and `kpTab` (apply `.kp-button` / `.kp-tab` classes to a native `<button>`), and `kpVirtualRow` / `kpTableCell` (Angular-only). See the [web-components guide](https://github.com/GregNBlack/kanso-protocol/blob/main/docs/web-components.md).

## License

MIT — © GregNBlack. Part of the [Kanso Protocol](https://github.com/GregNBlack/kanso-protocol) monorepo.
