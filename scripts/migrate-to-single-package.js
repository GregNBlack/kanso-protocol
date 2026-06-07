#!/usr/bin/env node
/**
 * One-shot migration: 64 packages → single `@kanso-protocol/ui` with
 * per-component/pattern secondary entry points. See ADR 0002.
 *
 * - core  → packages/ui root (already scaffolded by hand)
 * - 41 components + 20 patterns + i18n → packages/ui/<name>/ entry points
 * - mcp stays a separate package (Node CLI, not part of the UI kit)
 * - rewrites @kanso-protocol/core → @kanso-protocol/ui
 *           @kanso-protocol/<name> → @kanso-protocol/ui/<name>
 *   across packages/ui, packages/examples, e2e, .storybook
 * - relocates component/pattern stories into packages/ui/<name>/stories
 *
 * Idempotent-ish: safe to re-run; skips entry points already created.
 * Run once on the migration branch, then build + fix + commit.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const SRC_GROUPS = [
  { dir: path.join(ROOT, 'packages/components'), kind: 'component' },
  { dir: path.join(ROOT, 'packages/patterns'), kind: 'pattern' },
];
const UI = path.join(ROOT, 'packages/ui');

function listDirs(base) {
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base).filter((d) => fs.statSync(path.join(base, d)).isDirectory());
}

// 1. Collect the set of entry-point names (components + patterns + i18n).
const entries = []; // { name, srcDir, storiesDir|null }
for (const g of SRC_GROUPS) {
  for (const name of listDirs(g.dir)) {
    const pkgDir = path.join(g.dir, name);
    entries.push({
      name,
      srcDir: path.join(pkgDir, 'src'),
      storiesDir: fs.existsSync(path.join(pkgDir, 'stories')) ? path.join(pkgDir, 'stories') : null,
    });
  }
}
// i18n is an Angular lib consumed by components → entry point too.
entries.push({ name: 'i18n', srcDir: path.join(ROOT, 'packages/i18n/src'), storiesDir: null });

const names = entries.map((e) => e.name);

// 2. Move each entry's src into packages/ui/<name>/src + scaffold.
for (const e of entries) {
  const destDir = path.join(UI, e.name);
  const destSrc = path.join(destDir, 'src');
  if (fs.existsSync(destSrc)) { continue; } // already migrated
  fs.mkdirSync(destSrc, { recursive: true });
  for (const f of fs.readdirSync(e.srcDir)) {
    fs.renameSync(path.join(e.srcDir, f), path.join(destSrc, f));
  }
  // public-api.ts mirrors the entry's index.ts (kept as-is; index re-exported).
  const indexPath = path.join(destSrc, 'index.ts');
  const publicApi = path.join(destSrc, 'public-api.ts');
  if (fs.existsSync(indexPath) && !fs.existsSync(publicApi)) {
    fs.copyFileSync(indexPath, publicApi);
  }
  // secondary ng-package.json (no dest — inherits the primary's).
  fs.writeFileSync(
    path.join(destDir, 'ng-package.json'),
    JSON.stringify({ lib: { entryFile: 'src/public-api.ts' } }, null, 2) + '\n',
  );
  // relocate stories.
  if (e.storiesDir) {
    const destStories = path.join(destDir, 'stories');
    fs.mkdirSync(destStories, { recursive: true });
    for (const f of fs.readdirSync(e.storiesDir)) {
      fs.renameSync(path.join(e.storiesDir, f), path.join(destStories, f));
    }
  }
}

// 3. Rewrite imports across the repo (ts/tsx).
// Order matters: rewrite specific @kanso-protocol/<name> BEFORE core so
// e.g. @kanso-protocol/core isn't partially matched. We use exact-segment
// regexes with a lookahead for quote/slash/end.
const REWRITE_ROOTS = [
  path.join(UI),
  path.join(ROOT, 'packages/examples'),
  path.join(ROOT, 'e2e'),
  path.join(ROOT, '.storybook'),
];
function walkTs(dir, acc) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'node_modules') walkTs(full, acc); }
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}
const files = REWRITE_ROOTS.flatMap((r) => walkTs(r, []));
let rewritten = 0;
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  const before = src;
  // @kanso-protocol/<name> → @kanso-protocol/ui/<name>  (component/pattern/i18n names)
  for (const name of names) {
    const re = new RegExp(`@kanso-protocol/${name}(?=['"\`/])`, 'g');
    src = src.replace(re, `@kanso-protocol/ui/${name}`);
  }
  // @kanso-protocol/core → @kanso-protocol/ui  (exact segment, not /core-something)
  src = src.replace(/@kanso-protocol\/core(?=['"`])/g, '@kanso-protocol/ui');
  src = src.replace(/@kanso-protocol\/core\/styles/g, '@kanso-protocol/ui/styles');
  if (src !== before) { fs.writeFileSync(f, src); rewritten++; }
}

console.log(`Migrated ${entries.length} entry points into packages/ui/`);
console.log(`Rewrote imports in ${rewritten} files`);
console.log(`Entry-point names: ${names.length}`);
