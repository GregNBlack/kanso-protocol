#!/usr/bin/env node
/**
 * kanso-check-coverage — machine gate for two `stable`-tier rubric criteria
 * that docs/stability.md §"Rubric" declares but nothing enforces:
 *
 *   1. DOCS — every component / pattern surface under packages/ui/<name>/ has
 *             a contract doc at docs/components/<name>.md OR
 *             docs/patterns/<name>.md.
 *   2. SPEC — every surface marked `stable` in docs/stability.json has a
 *             *.spec.ts in its src/, UNLESS it takes the documented
 *             *no-logic exception*: pure-layout / presentational surfaces
 *             (stability.md marks these `spec —`) are covered by visual + a11y
 *             and need no unit spec.
 *
 * Until now these were declared in the rubric but only surfaced in a Storybook
 * dashboard — scripts/generate-test-coverage.js computes a `missing[]` list of
 * spec-less packages that gates nothing, and docs-existence was never checked.
 * This script turns both criteria into a CI gate.
 *
 * Sources of truth (all read-only):
 *   - surfaces        : subfolders of packages/ui/ that own a src/, minus
 *                       src / styles / stories / i18n — the same discovery
 *                       generate-test-coverage.js and lint-tokens.js use.
 *   - tiers           : docs/stability.json (the machine-readable mirror).
 *   - no-logic exempt : docs/stability.md coverage cells that read `spec —`
 *                       (rather than `spec ✓(n)`). Parsing the doc keeps the
 *                       exemption list in lock-step with the published rubric —
 *                       flip a surface from `spec —` to a spec count and this
 *                       gate starts requiring one, no code change needed.
 *
 * Usage:
 *   node scripts/check-coverage.js            # check the real tree
 *   node scripts/check-coverage.js --quiet    # only print on failure
 *
 * Exit codes:
 *   0 — every surface has a doc, and every stable non-exempt surface has a spec
 *   1 — at least one missing doc or missing spec
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const UI = path.join(ROOT, 'packages', 'ui');
const DOCS = path.join(ROOT, 'docs');
const STABILITY_JSON = path.join(DOCS, 'stability.json');
const STABILITY_MD = path.join(DOCS, 'stability.md');

const args = process.argv.slice(2);
const QUIET = args.includes('--quiet');

const COLOR_OK = '\x1b[32m';
const COLOR_ERR = '\x1b[31m';
const COLOR_WARN = '\x1b[33m';
const COLOR_DIM = '\x1b[2m';
const COLOR_RESET = '\x1b[0m';

// Directories under packages/ui/ that are not consumable surfaces.
// Mirrors lint-tokens.js / generate-test-coverage.js (src/styles/stories),
// plus utility entry points that are not a component/pattern: i18n
// (strings/locale), density (a DI token + provider), charts (a token→chart
// theme bridge — functions, no component). These ship docs + specs anyway.
const SKIP = new Set(['src', 'styles', 'stories', 'i18n', 'density', 'charts']);

// The `menu` package publishes the DropdownMenu / MenuItem / MenuDivider
// family; its contract docs live under those family names, not `menu.md`.
// (The Storybook title is `Components/DropdownMenu`.) Any surface whose doc
// file legitimately differs from its folder name is declared here.
const DOC_ALIASES = {
  menu: ['dropdown-menu', 'menu-item'],
};

// ─── Discovery ──────────────────────────────────────────────────────────

function listSurfaces() {
  if (!fs.existsSync(UI)) return [];
  const out = [];
  for (const name of fs.readdirSync(UI)) {
    if (SKIP.has(name)) continue;
    const dir = path.join(UI, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    // A real surface owns a src/ (matches generate-test-coverage.js). This
    // filters out any stray non-surface directory automatically.
    if (!fs.existsSync(path.join(dir, 'src'))) continue;
    out.push(name);
  }
  return out.sort();
}

function findSpecFiles(srcDir) {
  if (!fs.existsSync(srcDir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...findSpecFiles(path.join(srcDir, entry.name)));
    else if (entry.name.endsWith('.spec.ts')) out.push(path.join(srcDir, entry.name));
  }
  return out;
}

// ─── Rubric sources ───────────────────────────────────────────────────────

function readTiers() {
  const data = JSON.parse(fs.readFileSync(STABILITY_JSON, 'utf8'));
  const byName = new Map();
  for (const s of data.surfaces || []) {
    if (s.kind === 'component' || s.kind === 'pattern') byName.set(s.name, s.tier);
  }
  return byName;
}

// A surface takes the documented no-logic exception when its stability.md
// coverage cell reads `spec —` (no test count) instead of `spec ✓(n)`.
function readNoLogicExempt() {
  const exempt = new Set();
  const text = fs.readFileSync(STABILITY_MD, 'utf8');
  for (const line of text.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim());
    const nameMatch = (cells[1] || '').match(/^`([^`]+)`$/);
    if (!nameMatch) continue; // only backtick-named surface rows
    const coverage = cells[3] || '';
    if (/spec\s*✓/.test(coverage)) continue; // has a spec — not exempt
    if (/spec\s*[—–-]/.test(coverage)) exempt.add(nameMatch[1]);
  }
  return exempt;
}

// ─── Checks ─────────────────────────────────────────────────────────────

function hasDoc(name) {
  for (const base of [name, ...(DOC_ALIASES[name] || [])]) {
    if (fs.existsSync(path.join(DOCS, 'components', `${base}.md`))) return true;
    if (fs.existsSync(path.join(DOCS, 'patterns', `${base}.md`))) return true;
  }
  return false;
}

function hasSpec(name) {
  return findSpecFiles(path.join(UI, name, 'src')).length > 0;
}

// ─── Main ───────────────────────────────────────────────────────────────

function main() {
  const surfaces = listSurfaces();
  if (surfaces.length === 0) {
    console.log(`${COLOR_ERR}✖ kanso-check-coverage: no surfaces found under packages/ui — check the layout.${COLOR_RESET}`);
    return 1;
  }

  const tiers = readTiers();
  const exempt = readNoLogicExempt();

  const missingDocs = [];
  const missingSpecs = [];
  const untiered = []; // advisory: surface absent from stability.json

  for (const name of surfaces) {
    if (!hasDoc(name)) missingDocs.push(name);

    const tier = tiers.get(name);
    if (tier === undefined) {
      untiered.push(name);
      continue;
    }
    if (tier === 'stable' && !exempt.has(name) && !hasSpec(name)) {
      missingSpecs.push(name);
    }
  }

  const failed = missingDocs.length > 0 || missingSpecs.length > 0;

  if (!QUIET || failed) {
    console.log();
    console.log(`kanso-check-coverage — checked ${surfaces.length} surfaces (${exempt.size} take the no-logic spec exception)`);

    if (untiered.length) {
      console.log(`  ${COLOR_WARN}⚠ not in stability.json (spec gate skipped): ${untiered.join(', ')}${COLOR_RESET}`);
    }

    if (missingDocs.length) {
      console.log(`\n  ${COLOR_ERR}✖ missing docs${COLOR_RESET} (need docs/components/<name>.md or docs/patterns/<name>.md):`);
      for (const n of missingDocs) console.log(`      ${COLOR_ERR}${n}${COLOR_RESET}`);
    } else {
      console.log(`  ${COLOR_DIM}docs: every surface has a contract doc${COLOR_RESET}`);
    }

    if (missingSpecs.length) {
      console.log(`\n  ${COLOR_ERR}✖ missing specs${COLOR_RESET} (stable, non-exempt, no *.spec.ts in src/):`);
      for (const n of missingSpecs) console.log(`      ${COLOR_ERR}${n}${COLOR_RESET}`);
    } else {
      console.log(`  ${COLOR_DIM}specs: every stable non-exempt surface has a unit spec${COLOR_RESET}`);
    }
  }

  console.log();
  if (failed) {
    const parts = [];
    if (missingDocs.length) parts.push(`${missingDocs.length} missing doc${missingDocs.length === 1 ? '' : 's'}`);
    if (missingSpecs.length) parts.push(`${missingSpecs.length} missing spec${missingSpecs.length === 1 ? '' : 's'}`);
    console.log(`${COLOR_ERR}✖ kanso-check-coverage: ${parts.join(', ')}${COLOR_RESET}`);
    return 1;
  }
  console.log(`${COLOR_OK}✔ kanso-check-coverage: clean — ${surfaces.length} surfaces documented, all stable non-exempt surfaces specced${COLOR_RESET}`);
  return 0;
}

process.exit(main());
