# @kanso-protocol/mcp

## 4.4.0

### Minor Changes

- Catalog refresh — the manifest now includes the new `variable-virtual-list` component and reflects the rich `<kp-select>` option fields and the Notification Center incremental-pagination outputs.

## 4.3.0

### Minor Changes

- Design-system integrity pass — make the architecture enforce what it declares.
  - **Enforcement gates (CI + husky).** `validate:tokens` (state-matrix completeness, the rest→hover→active ramp-step invariant, dark-override existence); `check:contrast` (WCAG AA on curated foreground/background token pairs in both themes — caught and fixed `icon-warning`, which was 2.15:1); machine-readable stability (`docs/stability.json` + a README/stability drift guard); and the `raw-motion-duration` / `raw-shadow` lint rules promoted from warn to error.
  - **Accessibility.** Tokenized focus ring (`--kp-focus-ring-width` / `-offset`); `prefers-reduced-motion` honored across all 43 animated components; `@media (forced-colors: active)` support for 29 interactive components (Windows High Contrast).
  - **MCP.** New `check_composition` tool (12 total) flags mixed sizes in a row and beta-tier usage; the manifest is deduped (one primary record per component + `subSelectors`), carries a `stability` tier, includes the previously-missing `table-virtual`, is deterministic, and is guarded by a CI freshness gate; Figma-node lookups degrade gracefully instead of serving a wrong node.
  - **Elements DX.** Ships `custom-elements.json` (Custom Elements Manifest) and generated `JSX.IntrinsicElements` types so `<kp-*>` type-checks in React/TSX; the elements bundle is now under the bundle-size budget; client-only SSR behavior is documented.
  - **Brand tool.** `generate-brand-theme` now measures WCAG contrast per hue (with `--enforce-aa`) instead of asserting the false "preserved by construction" guarantee.

  No breaking changes — every addition is additive and visually neutral (media-gated or value-identical).

## 4.2.1

### Patch Changes

- Ship the corrected Code Connect map in the package tarball: `figma-mapping.json`'s `codeConnect` entries now report `npm: @kanso-protocol/ui` and `import: @kanso-protocol/ui/<name>` (they still carried the pre-v5 per-package paths in 4.2.0). The served manifest was already correct; this aligns the raw source file shipped in the package.

## 4.2.0

### Minor Changes

- Regenerate the catalog manifest for the single-package layout: every component/pattern now reports `import: '@kanso-protocol/ui/<name>'` and `package: '@kanso-protocol/ui'` (was the per-component `@kanso-protocol/<name>`). AI clients querying the server get the correct v5 import paths. Tool API is unchanged.

## 4.1.0

## 4.0.0

## 3.0.2

## 3.0.1

## 3.0.0

## 2.0.3

## 2.0.2

## 2.0.1

## 2.0.0

## 1.0.1

## 1.0.0

## 0.5.3

## 0.5.2
