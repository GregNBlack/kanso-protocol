# @kanso-protocol/ui

## 5.0.0

### Major Changes

- Consolidate the former 64 per-component npm packages into a single `@kanso-protocol/ui` package with one secondary entry point per component and pattern (ADR 0002).

  **Breaking — packaging only.** No component selector, input, output, or template internal changed. This is a pure import-path migration:
  - Install once: `npm i @kanso-protocol/ui` (replaces all `@kanso-protocol/<name>` dependencies).
  - Import per-subpath: `@kanso-protocol/<name>` → `@kanso-protocol/ui/<name>` (components and patterns share one flat namespace).
  - `@kanso-protocol/core` (tokens / types / utils) folded into the package root: `@kanso-protocol/core` → `@kanso-protocol/ui`.
  - Styles: `@kanso-protocol/core/styles/*` → `@kanso-protocol/ui/styles/*`.
  - i18n: `@kanso-protocol/i18n` → `@kanso-protocol/ui/i18n`.

  Tree-shaking is preserved — each entry point is an independent ESM module. See [`docs/MIGRATION-v5.md`](https://github.com/GregNBlack/kanso-protocol/blob/main/docs/MIGRATION-v5.md) for the upgrade guide and codemod. The legacy 64 packages remain published at their final 4.x with a deprecation notice.
