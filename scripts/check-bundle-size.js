#!/usr/bin/env node
/**
 * check-bundle-size — gzipped fesm2022 budget gate.
 *
 * Walks every `dist/packages/<pkg>/fesm2022/*.mjs`, gzips it in-memory,
 * and compares the byte count against the budget recorded in
 * `bundle-budget.json` at the repo root.
 *
 * Usage:
 *   node scripts/check-bundle-size.js              # check + report
 *   node scripts/check-bundle-size.js --update     # rewrite the budget
 *                                                  # to match current sizes
 *                                                  # (use after intentional growth)
 *
 * Exit codes:
 *   0 — every package is within its maxGz, OR a package shrank below its
 *       currentGz baseline (advisory hint to refresh the budget).
 *   1 — at least one package exceeds maxGz, OR a package in dist has no
 *       budget entry, OR a budget entry has no matching dist artifact.
 *
 * Headroom strategy is documented in `bundle-budget.json` itself. The
 * idea: catch real regressions, not noise. A re-export adding 40 bytes
 * shouldn't go red; adding a 2 KB dependency should.
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ROOT = path.resolve(__dirname, '..');
const BUDGET_PATH = path.join(ROOT, 'bundle-budget.json');
const DIST_DIR = path.join(ROOT, 'dist', 'packages');

const args = process.argv.slice(2);
const UPDATE = args.includes('--update');

const COLOR_OK = '\x1b[32m';
const COLOR_WARN = '\x1b[33m';
const COLOR_ERR = '\x1b[31m';
const COLOR_DIM = '\x1b[2m';
const COLOR_RESET = '\x1b[0m';

function fail(msg) {
  console.error(`${COLOR_ERR}error:${COLOR_RESET} ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(DIST_DIR)) {
  fail(
    `dist directory not found at ${path.relative(ROOT, DIST_DIR)} — ` +
      `run \`npm run build:libs\` first.`,
  );
}

if (!fs.existsSync(BUDGET_PATH)) {
  fail(`budget file not found at ${path.relative(ROOT, BUDGET_PATH)}`);
}

const budgetFile = JSON.parse(fs.readFileSync(BUDGET_PATH, 'utf8'));
const budgets = budgetFile.packages;

// ─── Discover packages from dist ───────────────────────────────────────

function gzippedSize(file) {
  const raw = fs.readFileSync(file);
  return zlib.gzipSync(raw, { level: 9 }).length;
}

// ─── Measure ────────────────────────────────────────────────────────────
//
// Single-package layout: dist/packages/ui/fesm2022/ holds one .mjs per
// entry point — kanso-protocol-ui.mjs (root) and
// kanso-protocol-ui-<name>.mjs (each secondary entry point). Each entry
// point gets its own budget, keyed `ui` / `ui/<name>`.

const FESM = path.join(DIST_DIR, 'ui', 'fesm2022');
const measured = []; // { key, gz, mjsRelPath }
if (fs.existsSync(FESM)) {
  for (const f of fs.readdirSync(FESM)) {
    if (!f.endsWith('.mjs')) continue;
    const full = path.join(FESM, f);
    // kanso-protocol-ui.mjs → 'ui'; kanso-protocol-ui-button.mjs → 'ui/button'
    const base = f.replace(/^kanso-protocol-ui/, '').replace(/\.mjs$/, '');
    const key = base === '' ? 'ui' : `ui/${base.replace(/^-/, '')}`;
    measured.push({ key, gz: gzippedSize(full), mjsRelPath: path.relative(ROOT, full) });
  }
}

// Framework-agnostic custom-elements bundle — a single self-contained esbuild
// output (embeds the Angular runtime), not an fesm2022 dir. Gate it too so a
// size regression in the `@kanso-protocol/elements` distribution can't ship
// unnoticed. It's built by the `web-components` CI job (npm run build:elements),
// not the `build` job — hence it's listed under `optional` in the budget so its
// absence in a ui-only build doesn't trip the STALE guard.
const ELEMENTS_MJS = path.join(DIST_DIR, 'elements', 'kanso-elements.mjs');
if (fs.existsSync(ELEMENTS_MJS)) {
  measured.push({ key: 'elements', gz: gzippedSize(ELEMENTS_MJS), mjsRelPath: path.relative(ROOT, ELEMENTS_MJS) });
}

measured.sort((a, b) => a.key.localeCompare(b.key));

// Keys that are only built by specific CI jobs; a missing dist artifact for
// these is not a STALE error (see bundle-budget.json "optional").
const OPTIONAL = new Set(budgetFile.optional || []);

// ─── Update mode ────────────────────────────────────────────────────────

if (UPDATE) {
  const next = {};
  for (const { key, gz } of measured) {
    const headroom =
      gz < 2000 ? gz + 500 : Math.ceil((gz + Math.ceil(gz * 0.15)) / 100) * 100;
    next[key] = { currentGz: gz, maxGz: headroom };
  }
  // Preserve budget entries for optional (conditionally-built) keys whose
  // artifact wasn't present this run — e.g. running --update after a ui-only
  // build shouldn't drop the `elements` budget.
  for (const key of Object.keys(budgets)) {
    if (!next[key] && OPTIONAL.has(key)) next[key] = budgets[key];
  }
  budgetFile.packages = next;
  fs.writeFileSync(BUDGET_PATH, JSON.stringify(budgetFile, null, 2) + '\n');
  console.log(
    `${COLOR_OK}ok:${COLOR_RESET} budget refreshed for ${measured.length} packages.`,
  );
  process.exit(0);
}

// ─── Check mode ─────────────────────────────────────────────────────────

let hadError = false;
const lines = [];
const measuredKeys = new Set(measured.map((m) => m.key));
const budgetKeys = new Set(Object.keys(budgets));

for (const { key, gz } of measured) {
  const entry = budgets[key];
  if (!entry) {
    lines.push(
      `${COLOR_ERR}MISSING${COLOR_RESET}  ${key.padEnd(32)} gz=${String(gz).padStart(6)}  ${COLOR_DIM}no budget entry — add to bundle-budget.json${COLOR_RESET}`,
    );
    hadError = true;
    continue;
  }
  const { maxGz, currentGz } = entry;
  if (gz > maxGz) {
    lines.push(
      `${COLOR_ERR}OVER${COLOR_RESET}     ${key.padEnd(32)} gz=${String(gz).padStart(6)}  max=${String(maxGz).padStart(5)}  ${COLOR_ERR}+${gz - maxGz}B over budget${COLOR_RESET}`,
    );
    hadError = true;
  } else if (gz > currentGz) {
    const hr = maxGz - gz;
    lines.push(
      `${COLOR_WARN}grew${COLOR_RESET}     ${key.padEnd(32)} gz=${String(gz).padStart(6)}  max=${String(maxGz).padStart(5)}  ${COLOR_DIM}headroom ${hr}B${COLOR_RESET}`,
    );
  } else if (gz < currentGz) {
    const delta = currentGz - gz;
    lines.push(
      `${COLOR_OK}shrank${COLOR_RESET}   ${key.padEnd(32)} gz=${String(gz).padStart(6)}  ${COLOR_DIM}was ${currentGz}, -${delta}B (refresh budget with --update)${COLOR_RESET}`,
    );
  } else {
    lines.push(
      `${COLOR_DIM}ok${COLOR_RESET}       ${key.padEnd(32)} gz=${String(gz).padStart(6)}  max=${String(maxGz).padStart(5)}`,
    );
  }
}

for (const key of budgetKeys) {
  if (!measuredKeys.has(key)) {
    // Optional keys are built by a different CI job; absence here is expected.
    if (OPTIONAL.has(key)) continue;
    lines.push(
      `${COLOR_ERR}STALE${COLOR_RESET}    ${key.padEnd(32)}  ${COLOR_DIM}budget entry has no matching dist artifact (rename or removal?)${COLOR_RESET}`,
    );
    hadError = true;
  }
}

console.log(lines.join('\n'));

const totalGz = measured.reduce((a, { gz }) => a + gz, 0);
console.log(
  `\n${measured.length} packages measured · combined gz=${totalGz}B (${(totalGz / 1024).toFixed(1)} KB)`,
);

if (hadError) {
  console.error(
    `\n${COLOR_ERR}bundle-size check failed.${COLOR_RESET} If the growth is intentional, ` +
      `run \`node scripts/check-bundle-size.js --update\` and commit the budget bump in the same PR.`,
  );
  process.exit(1);
}

process.exit(0);
