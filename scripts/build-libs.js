#!/usr/bin/env node
/**
 * Build the single `@kanso-protocol/ui` package (all secondary entry
 * points) with ng-packagr, then post-process the dist package.json:
 *
 *   1. ng-packagr builds the primary entry point + every secondary one
 *      (each packages/ui/<name>/ng-package.json) into dist/packages/ui.
 *   2. Add `./styles/*` to the generated `exports` map so consumers can
 *      import the CSS/SCSS token files (`@kanso-protocol/ui/styles/tokens.css`).
 *      ng-packagr's exports map is restrictive and omits asset paths.
 *   3. Repoint the node_modules/@kanso-protocol/ui symlink at the dist
 *      output (so a consuming build inside this repo resolves the FESM).
 *
 * Usage: node scripts/build-libs.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist/packages/ui');

// 1. Build.
execSync('npx ng-packagr -p packages/ui/ng-package.json', { stdio: 'inherit', cwd: ROOT });

// 2. Add styles + scss to the exports map.
const distPkgPath = path.join(DIST, 'package.json');
const distPkg = JSON.parse(fs.readFileSync(distPkgPath, 'utf8'));
distPkg.exports = distPkg.exports || {};
distPkg.exports['./styles/*'] = { default: './styles/*' };
for (const f of ['tokens.css', 'dark.css', '_tokens.scss']) {
  distPkg.exports['./styles/' + f] = { default: './styles/' + f };
}
fs.writeFileSync(distPkgPath, JSON.stringify(distPkg, null, 2) + '\n');
console.log('Added ' + Object.keys(distPkg.exports).length + ' export paths (incl. styles).');

// 3. Symlink node_modules/@kanso-protocol/ui → dist.
const nmPath = path.join(ROOT, 'node_modules/@kanso-protocol/ui');
try { fs.rmSync(nmPath, { recursive: true, force: true }); } catch { /* ignore */ }
fs.mkdirSync(path.dirname(nmPath), { recursive: true });
fs.symlinkSync(path.relative(path.dirname(nmPath), DIST), nmPath);
console.log('Symlinked node_modules/@kanso-protocol/ui → dist/packages/ui');
console.log('\nDone.');
