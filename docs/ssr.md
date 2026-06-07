# Server-side rendering (SSR)

Kanso components are **SSR- and hydration-safe**. They render to HTML on the server (Angular SSR / `@angular/ssr` / Universal) and hydrate on the client without `window is not defined` crashes or layout flicker from re-initialization.

## Why it's safe

- **Standalone + zoneless + signals.** No NgModules, no `zone.js` assumptions — works under Angular 21 server rendering and incremental hydration.
- **No browser globals at module / constructor / field-init time.** Nothing touches `window` / `document` while the component tree is being constructed on the server.
- **Browser APIs are interaction-gated.** The overlay components (`select`, `combobox`, `datepicker`, `timepicker`, `theme-toggle`) attach `window` scroll/resize listeners only when their panel *opens*, and `slider` attaches pointer listeners only on drag-start — none of which happen during a server render (the server emits the initial, closed state).
- **`DOCUMENT` is injected, not global.** Portal targeting uses the injected `DOCUMENT` token (`findPortalTarget(host, doc)`), never a bare `document`.
- **Teardown is guarded.** `ngOnDestroy` paths that remove `window` listeners are wrapped in `typeof window !== 'undefined'`, so server-side teardown can't throw.
- **DOM-only libraries are browser-gated.** `rich-text-editor` (TipTap/ProseMirror needs a live DOM) only instantiates its editor when `isPlatformBrowser(platformId)` — on the server the editor host renders empty and the editor boots on hydration.

## What renders where

| | Server (SSR) | Client (after hydration) |
|---|---|---|
| Static components (button, card, badge, input, table, …) | Full markup | Interactive |
| Overlays (select, combobox, datepicker, timepicker, popover, dialog, drawer, menu, tooltip) | Trigger / closed state | Panel opens on interaction |
| `rich-text-editor` | Empty editor host | TipTap editor boots |
| `virtual-list` | First window of rows (scrollTop defaults to 0) | Scrolls / windows live |

## Using Kanso with Angular SSR

It works out of the box with `@angular/ssr`. Load the token CSS in your server and browser bootstrap exactly as in a CSR app:

```ts
import '@kanso-protocol/ui/styles/tokens.css';
import '@kanso-protocol/ui/styles/dark.css';
```

No `providePlatformInitializer` shims or `isPlatformBrowser` wrappers are needed in *your* code — the guards live inside the components.

## Verifying in your app

Kanso's own CI covers SSR teardown at the unit level (e.g. the `theme-toggle` "teardown is SSR-safe when window is undefined" spec). For end-to-end confidence in *your* integration, add a render smoke test — render the route that uses Kanso through `@angular/ssr`'s `renderApplication` (or `ng build && ng run serve-ssr`) and assert it returns non-empty HTML without throwing. That catches consumer-side wiring issues (a third-party component, a `window` reference in your own code) that a component library can't guard for you.

## If you hit an SSR issue

If a Kanso component throws during server render, it's a bug — please file it with the component name and stack trace. The contract above is what we hold the components to.
