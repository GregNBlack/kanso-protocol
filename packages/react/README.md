# @kanso-protocol/react

Typed **React wrappers** over the [Kanso Protocol](https://github.com/GregNBlack/kanso-protocol) `<kp-*>` custom elements. Use `<KpButton>`, `<KpSelect>`, `<KpCard>`, … as ordinary React components — with typed props, object inputs, and typed `on…` events — on **React 18 and 19**.

> These are thin, hand-rolled wrappers (no runtime dependency) around [`@kanso-protocol/elements`](https://www.npmjs.com/package/@kanso-protocol/elements). On React ≤ 18 they automate the `useRef` + `useEffect` + `addEventListener` recipe custom elements otherwise require for object props and events. On Angular, use [`@kanso-protocol/ui`](https://www.npmjs.com/package/@kanso-protocol/ui) instead.

> **Status: experimental (`0.x`).** Pin the exact version.

## Install

```bash
npm install @kanso-protocol/react @kanso-protocol/elements @kanso-protocol/ui react
```

`@kanso-protocol/elements` (the custom-elements bundle) and `react` are peer dependencies; `@kanso-protocol/ui` supplies the token stylesheet.

## Use

Load the tokens once, then use the components. Importing any wrapper auto-defines the underlying `<kp-*>` elements (via `@kanso-protocol/elements`).

```tsx
import '@kanso-protocol/ui/styles/tokens.css';
import { KpSelect, KpBadge } from '@kanso-protocol/react';

function Demo() {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ];
  return (
    <>
      <KpBadge appearance="success">Active</KpBadge>

      {/* object input set as a JS property; event via a typed on-prop */}
      <KpSelect
        size="md"
        placeholder="Pick one"
        options={options}
        onOpenChange={(event) => console.log('open:', event.detail)}
      />
    </>
  );
}
```

What the wrapper handles for you:

| Angular `@Input` / `@Output` | React wrapper prop |
|---|---|
| string / number / boolean `@Input() foo` | `foo` — set as an attribute |
| object / array `@Input() items` | `items` — set as a JS property via a ref (avoids `[object Object]`) |
| `@Output() valueChange` | `onValueChange={(e) => …}` — a `CustomEvent`; the emitted value is `e.detail` |
| content projection (`<ng-content>`) | `children` (and named `slot` props) |

## Refs

Every wrapper forwards its ref to the underlying custom element:

```tsx
const ref = useRef<HTMLElement>(null);
// ref.current is the <kp-select> element
<KpSelect ref={ref} />;
```

## Types

Props are generated from each component's `@Input()`s and `@Output()`s, so usage is type-checked:

- string-union inputs (`size`, `appearance`, …) list their literal members but still accept any string;
- object/array inputs are passed through as properties;
- `on…` handlers receive a `CustomEvent<Detail>` whose `detail` is the emitted value (falling back to `unknown` for values whose type can't be resolved without importing Angular internals);
- unknown props are type errors.

```tsx
<KpSelect size="md" onOpenChange={(e) => e.detail /* boolean */} />;
<KpSelect notAProp />; // ✗ type error
```

## License

MIT — © GregNBlack. Part of the [Kanso Protocol](https://github.com/GregNBlack/kanso-protocol) monorepo.
