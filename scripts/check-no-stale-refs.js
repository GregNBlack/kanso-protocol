#!/usr/bin/env node
/**
 * check-no-stale-refs — guard against pre-v5 package references creeping back.
 *
 * After the single-package migration (ADR 0002) the only live packages are
 * `@kanso-protocol/ui` and `@kanso-protocol/mcp`, and source lives under
 * `packages/ui/<name>/` — never `packages/{components,patterns,core,i18n}/`.
 *
 * This fails CI if a tracked text file reintroduces:
 *   1. `@kanso-protocol/<name>` for any name other than `ui` / `mcp`
 *      (so `@kanso-protocol/button`, `@kanso-protocol/core`,
 *      `@kanso-protocol/i18n` are flagged; `@kanso-protocol/ui/i18n` is fine).
 *   2. an old layout path `packages/{components,patterns,core,i18n}/`.
 *
 * Historical/explanatory files legitimately mention the old names — those are
 * allow-listed below (changelogs, ADRs, migration guides, and the two
 * deprecation helpers that operate ON the legacy packages by construction).
 *
 * Usage: node scripts/check-no-stale-refs.js
 * Exit 0 = clean, 1 = at least one stale reference found.
 */

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

// `source` is the private monorepo-root package name, not a component.
const STALE_PKG = /@kanso-protocol\/(?!ui\b|ui\/|mcp\b|source\b)[a-z][a-z0-9-]*/;
const STALE_PATH = /packages\/(components|patterns|core|i18n)\//;

// Files that describe the OLD world on purpose — exempt by exact path or prefix.
const ALLOW = [
  /(^|\/)CHANGELOG\.md$/,
  /^docs\/adrs\//,
  /^docs\/MIGRATION-/,
  /^docs\/migration-/,
  /^\.github\/release-notes\//, // historical per-release notes
  /^scripts\/deprecate-legacy-packages\.js$/,
  /^scripts\/migrate-to-single-package\.js$/, // the migration codemod itself
  /^\.github\/workflows\/deprecate-legacy\.yml$/,
  /^scripts\/check-no-stale-refs\.js$/, // this file (contains the patterns)
  /^scripts\/check-lockfile-workspaces\.js$/, // explains the v5 break in comments
];

// Only scan source-ish text files.
const SCAN_EXT = /\.(ts|tsx|js|mjs|cjs|json|jsonc|md|mdx|yml|yaml|scss|css|html)$/;

const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter((f) => SCAN_EXT.test(f))
  .filter((f) => !ALLOW.some((re) => re.test(f)));

const hits = [];
for (const file of tracked) {
  let lines;
  try {
    lines = fs.readFileSync(file, 'utf8').split('\n');
  } catch {
    continue; // deleted/binary — skip
  }
  lines.forEach((line, i) => {
    const pkg = line.match(STALE_PKG);
    const pth = line.match(STALE_PATH);
    if (pkg) hits.push({ file, line: i + 1, kind: 'pkg', match: pkg[0], text: line.trim() });
    if (pth) hits.push({ file, line: i + 1, kind: 'path', match: pth[0], text: line.trim() });
  });
}

if (hits.length === 0) {
  console.log('check-no-stale-refs: clean — no pre-v5 package/path references found.');
  process.exit(0);
}

console.error(`check-no-stale-refs: found ${hits.length} stale reference(s):\n`);
for (const h of hits) {
  console.error(`  ${h.file}:${h.line}  [${h.kind}: ${h.match}]`);
  console.error(`    ${h.text.slice(0, 120)}`);
}
console.error(
  `\nThe single-package migration (ADR 0002) leaves only @kanso-protocol/ui and /mcp.\n` +
    `Use @kanso-protocol/ui/<name> (imports) and packages/ui/<name>/ (paths).\n` +
    `If a reference is intentionally historical, add its path to ALLOW in this script.`,
);
process.exit(1);
