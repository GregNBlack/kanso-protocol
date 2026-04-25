#!/usr/bin/env node
/**
 * Build @kanso-protocol/mcp and stage it under `dist/packages/mcp/` so the
 * existing `publish-libs.js` walker picks it up alongside every other
 * library, no special-casing in CI.
 *
 * Order of operations:
 *   1. Regenerate `packages/mcp/manifest.json` from current source.
 *   2. Compile `packages/mcp/src/*.ts` → `packages/mcp/dist/*.js` via tsc.
 *   3. Copy package.json + manifest.json + README.md + dist/ into the
 *      monorepo's standard `dist/packages/mcp/` staging area.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC_PKG = path.join(ROOT, 'packages', 'mcp');
const DEST_PKG = path.join(ROOT, 'dist', 'packages', 'mcp');

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts });
}

function copy(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

console.log('mcp: regenerating manifest…');
run('node scripts/generate-mcp-manifest.js');

console.log('mcp: compiling TypeScript…');
// Direct binary path — `npx tsc` in CI sometimes triggers an install attempt
// or shadowing if the local resolution misses, which fails non-deterministically.
const tscBin = path.join(ROOT, 'node_modules', '.bin', 'tsc');
run(`"${tscBin}" -p packages/mcp/tsconfig.json`);

console.log('mcp: staging into dist/packages/mcp…');
fs.rmSync(DEST_PKG, { recursive: true, force: true });
fs.mkdirSync(DEST_PKG, { recursive: true });

// Files at the package root.
copy(path.join(SRC_PKG, 'package.json'), path.join(DEST_PKG, 'package.json'));
copy(path.join(SRC_PKG, 'manifest.json'), path.join(DEST_PKG, 'manifest.json'));
const figmaMapping = path.join(SRC_PKG, 'figma-mapping.json');
if (fs.existsSync(figmaMapping)) copy(figmaMapping, path.join(DEST_PKG, 'figma-mapping.json'));
const readme = path.join(SRC_PKG, 'README.md');
if (fs.existsSync(readme)) copy(readme, path.join(DEST_PKG, 'README.md'));

// Compiled JS — keep the same `./dist/index.js` path as in the source
// package.json so `bin` and `main` resolve identically post-install.
copyDir(path.join(SRC_PKG, 'dist'), path.join(DEST_PKG, 'dist'));

console.log(`mcp: staged at ${path.relative(ROOT, DEST_PKG)}`);
