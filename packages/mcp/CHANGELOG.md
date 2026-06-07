# @kanso-protocol/mcp

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
