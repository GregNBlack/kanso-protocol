#!/usr/bin/env node
/**
 * check-lockfile-workspaces — assert package-lock.json's workspace set matches
 * what's actually on disk.
 *
 * The v5 migration shipped (on a feature branch with no CI) a lockfile that
 * still listed 41 deleted `packages/components/*` workspaces and was missing
 * `packages/ui` — a latent `npm ci` failure that only surfaced at release.
 *
 * `npm ci` does catch lock↔package.json drift, but only runs in the heavy
 * build job. This is a fast, deterministic guard (no network, no npm-version
 * sensitivity, unlike a `--package-lock-only` diff): it just compares the
 * `packages/*` keys in the lockfile against the workspace dirs that have a
 * package.json on disk. Mismatch → the lockfile is stale; run
 * `npm install --package-lock-only --legacy-peer-deps` and commit it.
 *
 * Exit 0 = in sync, 1 = drift.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));

// Workspaces declared in the root package.json (e.g. ["packages/*","apps/*"]).
const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const globs = rootPkg.workspaces || [];

// On-disk workspaces: every dir matching a workspace glob that has package.json.
const onDisk = new Set();
for (const g of globs) {
  const base = g.replace(/\/\*$/, '');
  const baseDir = path.join(ROOT, base);
  if (!g.endsWith('/*')) {
    if (fs.existsSync(path.join(ROOT, g, 'package.json'))) onDisk.add(g);
    continue;
  }
  if (!fs.existsSync(baseDir)) continue;
  for (const d of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (d.isDirectory() && fs.existsSync(path.join(baseDir, d.name, 'package.json'))) {
      onDisk.add(`${base}/${d.name}`);
    }
  }
}

// Lockfile workspaces: keys under `packages` that point at a workspace dir
// (npm v2+ lockfile lists them as their relative path key, e.g. "packages/ui").
const inLock = new Set(
  Object.keys(lock.packages || {}).filter(
    (k) => k && !k.startsWith('node_modules') && globs.some((g) => {
      const base = g.replace(/\/\*$/, '');
      return g.endsWith('/*') ? k.startsWith(base + '/') && k.split('/').length === base.split('/').length + 1 : k === g;
    }),
  ),
);

const missingFromLock = [...onDisk].filter((w) => !inLock.has(w)).sort();
const staleInLock = [...inLock].filter((w) => !onDisk.has(w)).sort();

if (missingFromLock.length === 0 && staleInLock.length === 0) {
  console.log(`check-lockfile-workspaces: in sync (${onDisk.size} workspaces).`);
  process.exit(0);
}

console.error('check-lockfile-workspaces: package-lock.json is out of sync with on-disk workspaces.\n');
if (staleInLock.length)
  console.error(`  stale in lockfile (dir deleted): ${staleInLock.join(', ')}`);
if (missingFromLock.length)
  console.error(`  missing from lockfile (dir exists): ${missingFromLock.join(', ')}`);
console.error(
  `\nRegenerate it: npm install --package-lock-only --legacy-peer-deps  (then commit package-lock.json).`,
);
process.exit(1);
