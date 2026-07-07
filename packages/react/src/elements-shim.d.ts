// Build-only ambient fallback for the side-effect import of
// '@kanso-protocol/elements' in index.tsx.
//
// @kanso-protocol/elements is a runtime peer dependency; it is NOT symlinked
// into this monorepo's node_modules (its shipped types live in
// dist/packages/elements, produced by a separate build). Without this the
// in-repo `tsc` build would fail to resolve the bare side-effect import.
//
// This file is a .d.ts *input* only — tsc does not emit it, and it is not
// listed in package.json "files", so it never ships. Installed consumers
// resolve the import against the real package's own declarations.
declare module '@kanso-protocol/elements';
