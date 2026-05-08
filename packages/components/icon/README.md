# @kanso-protocol/icon

Color-controllable wrapper around inlined Tabler Icons SVG, with size-aware
stroke-width tuning that matches the rest of the Kanso component ramp.

```bash
npm install @kanso-protocol/icon @kanso-protocol/core
```

## Quick start

```ts
import { Component } from '@angular/core';
import { KpIconComponent } from '@kanso-protocol/icon';

@Component({
  standalone: true,
  imports: [KpIconComponent],
  template: `
    <kp-icon name="search" size="md" />
    <kp-icon name="star-filled" size="sm" />
  `,
})
export class MyComponent {}
```

The host element renders an inline `<svg>` whose size + stroke-width are
derived from the `size` ramp (`xs` / `sm` / `md` / `lg` / `xl`) and whose
color follows `currentColor` — set the surrounding text color and the icon
follows.

## What ships in the box: 115 baseline icons

The package bundles **115 curated Tabler glyphs** (72 outlined + 43 filled)
inline as SVG strings. This baseline is sized to power **Kanso component
internals** — the chevron in DropdownMenu, the close-cross in Popover, the
search-magnifier in Input, the bell in NotificationCenter, etc. — plus the
most common UI affordances (`user`, `settings`, `calendar`, `dashboard`,
`folder`, `trash`, …).

It is **deliberately curated**, not exhaustive:

- The full Tabler library has ~5500 icons. Bundling all of them adds ~10 MB
  of inline SVG to the package — a hard non-starter for production
  consumers.
- The 115-icon allowlist keeps `@kanso-protocol/icon` under ~50 KB while
  covering everything the design system itself renders out of the box.

The exact list lives in
[`icons.allowlist.json`](./icons.allowlist.json).

## Need an icon outside the baseline? Install `@tabler/icons`.

For any glyph beyond the 115 baked-in, install the **full Tabler package**
and register the SVG you need at runtime — `@kanso-protocol/icon` is
designed to be extended this way.

```bash
npm install @tabler/icons
```

```ts
import { KP_ICON_REGISTRY } from '@kanso-protocol/icon';

// Vite / esbuild raw-import — gets the SVG file content as a string
import rocketSvg from '@tabler/icons/icons/rocket.svg?raw';

KP_ICON_REGISTRY.register('rocket', rocketSvg);

// Now usable anywhere in templates:
//   <kp-icon name="rocket" size="md" />
```

For Webpack / Angular CLI default config, configure a raw-loader for `.svg`
files, or read at build time from `node_modules/@tabler/icons/icons/*.svg`
into a string constant.

You can also register multiple icons in one call:

```ts
KP_ICON_REGISTRY.registerMany({
  rocket:    rocketSvg,
  ufo:       ufoSvg,
  satellite: satelliteSvg,
});
```

Or register your own brand glyphs that have nothing to do with Tabler:

```ts
KP_ICON_REGISTRY.register('my-logo', '<svg viewBox="0 0 24 24">…</svg>');
```

## Why this split?

- **Baseline (bundled)** — guarantees that `<kp-icon name="search">` and
  every other icon that Kanso components themselves reach for *just works*
  with zero extra setup. Consumer doesn't need to know Tabler exists for
  the design system to render.
- **Full set (opt-in via `@tabler/icons`)** — when the consumer's product
  needs glyphs beyond the baseline, they reach into the full library
  themselves. This keeps the design system's bundle small and gives the
  consumer explicit control over what extra icons they ship.

If you find yourself registering the same glyph in every project, open an
issue or PR — we can extend the baseline allowlist. The
`npm run generate:icons` script regenerates the inlined SVG map from the
allowlist file.

## Unknown-name behavior

If `<kp-icon name="X">` is rendered for a name that's not in the registry,
the component renders nothing and emits a single `console.warn` pointing
to this README. Useful while wiring up a new screen — you'll spot the
missing register call immediately.

## Reference

- **Storybook** — [components / icon](https://gregnblack.github.io/kanso-protocol/?path=/docs/components-icon--docs)
- **Component contract** — [`docs/components/icon.md`](https://github.com/GregNBlack/kanso-protocol/blob/main/docs/components/icon.md)
- **Tabler Icons** — [tabler.io/icons](https://tabler.io/icons) · MIT
- **Allowlist** — [`icons.allowlist.json`](./icons.allowlist.json)

## License

MIT © GregNBlack
