#!/usr/bin/env node
/**
 * deprecate-legacy-packages — one-time (idempotent) deprecation of the
 * 64 former per-component packages after the v5 single-package migration
 * (ADR 0002).
 *
 * Each `@kanso-protocol/<name>` (components, patterns, i18n) plus
 * `@kanso-protocol/core` is superseded by an entry point of the single
 * `@kanso-protocol/ui` package. This marks every published version of
 * those packages as deprecated, pointing consumers at the new subpath.
 * `@kanso-protocol/ui` and `@kanso-protocol/mcp` are NEVER touched.
 *
 * Requires npm auth with publish rights on @kanso-protocol/* — run after
 * `npm login` (or with NPM_TOKEN in the environment via .npmrc).
 *
 * Usage:
 *   node scripts/deprecate-legacy-packages.js            # deprecate for real
 *   node scripts/deprecate-legacy-packages.js --dry-run  # print, don't run
 *
 * Idempotent: re-running re-applies the same notice (npm deprecate is a
 * no-op if the message is unchanged). Packages that were never published
 * are skipped with a notice.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const UI_DIR = path.join(ROOT, 'packages', 'ui');
const DRY = process.argv.includes('--dry-run');

const SKIP_DIRS = new Set(['src', 'styles', 'stories']);
const NEVER = new Set(['ui', 'mcp']);

// Entry-point names (each was its own package) + `core` (folded into the
// @kanso-protocol/ui root).
const names = fs
  .readdirSync(UI_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !SKIP_DIRS.has(d.name))
  .map((d) => d.name)
  .filter((n) => !NEVER.has(n));
names.push('core');

function isPublished(pkg) {
  try {
    execFileSync('npm', ['view', pkg, 'version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

let deprecated = 0;
let skipped = 0;

for (const name of names.sort()) {
  const pkg = `@kanso-protocol/${name}`;
  // The new home: core → the ui root; everything else → a ui subpath.
  const target = name === 'core' ? '@kanso-protocol/ui' : `@kanso-protocol/ui/${name}`;
  const msg =
    `Deprecated in v5: merged into the single @kanso-protocol/ui package. ` +
    `Use \`npm i @kanso-protocol/ui\` and import from \`${target}\`. ` +
    `Migration guide: https://github.com/GregNBlack/kanso-protocol/blob/main/docs/MIGRATION-v5.md`;

  if (!isPublished(pkg)) {
    console.log(`skip   ${pkg}  (never published)`);
    skipped++;
    continue;
  }

  // Deprecate every version below 5.0.0 — the range the old per-package
  // releases lived in. (These packages never reach 5.x; that line is
  // @kanso-protocol/ui only.)
  // No shell here (execFileSync), so the range is a single literal arg —
  // it must NOT carry the `"` quotes you'd need to protect `<` in a shell.
  const range = `${pkg}@<5.0.0`;
  if (DRY) {
    console.log(`DRY    npm deprecate '${range}' "${msg}"`);
    deprecated++;
    continue;
  }
  try {
    execFileSync('npm', ['deprecate', range, msg], { stdio: 'pipe' });
    console.log(`done   ${range}`);
    deprecated++;
  } catch (e) {
    const detail = (e.stderr || e.stdout || e.message || '').toString().trim().split('\n').filter(Boolean).pop();
    console.error(`FAIL   ${pkg} — ${detail}`);
  }
}

console.log(
  `\n${DRY ? '[dry-run] ' : ''}${deprecated} package(s) ${DRY ? 'would be ' : ''}deprecated, ${skipped} skipped (unpublished).`,
);
if (!DRY && deprecated === 0) {
  console.log('Nothing deprecated — are you logged in? `npm whoami` to check.');
}
