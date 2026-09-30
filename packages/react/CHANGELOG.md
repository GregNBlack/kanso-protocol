# @kanso-protocol/react

## 1.0.0

### Minor Changes

- d88d75d: Catch-up release: rebuild against `@kanso-protocol/ui@5.19.0` so the #49–#64 fix batch (and the kp-input `name`/`autocomplete` inputs shipped in ui 5.18.0) actually reaches consumers of the custom elements, the React wrappers, and the MCP catalog — none of the three had been rebuilt/republished since those ui changes landed, so they were silently stale on npm.
  - `@kanso-protocol/elements`: bundled component code picks up all 16 fixes; `custom-elements.json` documents the new `kp-banner` `variant`, `kp-table` `showHeader`/`selectOnRowClick`/`rowKey`, and `kp-input` `name`/`autocomplete` attributes.
  - `@kanso-protocol/react`: typed wrappers regenerated with the same new props.
  - `@kanso-protocol/mcp`: manifest refreshed to document the current component API (was still describing the pre-fix shape).

### Patch Changes

- Updated dependencies [d88d75d]
  - @kanso-protocol/elements@0.4.0

## 0.1.0

### Minor Changes

- Initial release. Typed React wrappers over the `<kp-*>` custom elements — generated `forwardRef` components (`<KpButton>`, `<KpSelect>`, …) with object-prop and event (`onX`) support on React 18 and 19. Thin over `@kanso-protocol/elements` (kept external as a peer dependency); no component rewrite.
