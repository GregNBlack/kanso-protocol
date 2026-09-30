---
"@kanso-protocol/elements": minor
"@kanso-protocol/react": minor
"@kanso-protocol/mcp": minor
---

Catch-up release: rebuild against `@kanso-protocol/ui@5.19.0` so the #49–#64 fix batch (and the kp-input `name`/`autocomplete` inputs shipped in ui 5.18.0) actually reaches consumers of the custom elements, the React wrappers, and the MCP catalog — none of the three had been rebuilt/republished since those ui changes landed, so they were silently stale on npm.

- `@kanso-protocol/elements`: bundled component code picks up all 16 fixes; `custom-elements.json` documents the new `kp-banner` `variant`, `kp-table` `showHeader`/`selectOnRowClick`/`rowKey`, and `kp-input` `name`/`autocomplete` attributes.
- `@kanso-protocol/react`: typed wrappers regenerated with the same new props.
- `@kanso-protocol/mcp`: manifest refreshed to document the current component API (was still describing the pre-fix shape).
