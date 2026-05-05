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

function* walkDist() {
  // Two layouts: dist/packages/<pkg>/fesm2022/<file>.mjs (core, i18n) and
  //              dist/packages/<group>/<pkg>/fesm2022/<file>.mjs (components, patterns).
  for (const top of fs.readdirSync(DIST_DIR)) {
    const topPath = path.join(DIST_DIR, top);
    if (!fs.statSync(topPath).isDirectory()) continue;

    const fesmDirect = path.join(topPath, 'fesm2022');
    if (fs.existsSync(fesmDirect)) {
      yield { key: top, fesmDir: fesmDirect };
      continue;
    }

    for (const sub of fs.readdirSync(topPath)) {
      const subPath = path.join(topPath, sub);
      if (!fs.statSync(subPath).isDirectory()) continue;
      const fesm = path.join(subPath, 'fesm2022');
      if (fs.existsSync(fesm)) {
        yield { key: `${top}/${sub}`, fesmDir: fesm };
      }
    }
  }
}

function gzippedSize(file) {
  const raw = fs.readFileSync(file);
  return zlib.gzipSync(raw, { level: 9 }).length;
}

// ─── Measure ────────────────────────────────────────────────────────────

const measured = []; // { key, gz, mjsRelPath }
for (const { key, fesmDir } of walkDist()) {
  const mjs = fs
    .readdirSync(fesmDir)
    .filter((f) => f.endsWith('.mjs'))
    .map((f) => path.join(fesmDir, f));
  if (mjs.length === 0) continue;
  // A package may have multiple entry points (rare); sum them.
  const total = mjs.reduce((a, f) => a + gzippedSize(f), 0);
  measured.push({
    key,
    gz: total,
    mjsRelPath: mjs.map((p) => path.relative(ROOT, p)).join(', '),
  });
}

measured.sort((a, b) => a.key.localeCompare(b.key));

// ─── Update mode ────────────────────────────────────────────────────────

if (UPDATE) {
  const next = {};
  for (const { key, gz } of measured) {
    const headroom =
      gz < 2000 ? gz + 500 : Math.ceil((gz + Math.ceil(gz * 0.15)) / 100) * 100;
    next[key] = { currentGz: gz, maxGz: headroom };
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
