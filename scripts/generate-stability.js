#!/usr/bin/env node
/**
 * generate-stability — the stability drift guard for Kanso Protocol.
 *
 * `docs/stability.json` is the machine-readable mirror of the authoritative
 * per-surface table in `docs/stability.md`. Prose facts about stability tend
 * to rot: the README once claimed "40 of 61 surfaces stable / virtual-list
 * experimental" while stability.md at the same commit said the whole
 * component + pattern catalog was already stable. This script keeps the two
 * in lockstep.
 *
 * Two modes:
 *
 *   node scripts/generate-stability.js            (default — WRITE)
 *     Rewrites the marked block in README.md
 *       <!-- stability:start --> … <!-- stability:end -->
 *     with a status sentence derived from stability.json's counts. On first
 *     run (markers absent) it wraps the existing "> **Status:" blockquote in
 *     the markers, then owns that block from then on.
 *
 *   node scripts/generate-stability.js --check     (CHECK — drift guard, CI)
 *     Exits 1 (without writing) if EITHER:
 *       - the README status block differs from what WRITE mode would emit, OR
 *       - the "Components: N stable …" / "Patterns: N stable …" summary lines
 *         in stability.md disagree with stability.json's counts, OR
 *       - stability.json's stored counts disagree with its own surfaces[].
 *     This is what CI runs; it never mutates tracked files.
 *
 * New Node scripts here are CommonJS + node-builtins only (matches
 * scripts/lint-tokens.js).
 *
 * Exit codes:
 *   0 — in sync (or written successfully)
 *   1 — drift detected (--check) or a fatal error
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const JSON_PATH = path.join(ROOT, 'docs', 'stability.json');
const README_PATH = path.join(ROOT, 'README.md');
const STABILITY_MD_PATH = path.join(ROOT, 'docs', 'stability.md');

const CHECK = process.argv.slice(2).includes('--check');

const COLOR_OK = '\x1b[32m';
const COLOR_ERR = '\x1b[31m';
const COLOR_DIM = '\x1b[2m';
const COLOR_RESET = '\x1b[0m';

const START = '<!-- stability:start -->';
const END = '<!-- stability:end -->';

// ─── Helpers ─────────────────────────────────────────────────────────────

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fail(msg) {
  console.error(`${COLOR_ERR}✖ generate-stability: ${msg}${COLOR_RESET}`);
  process.exit(1);
}

// ─── The one source of the status sentence ──────────────────────────────
// Both WRITE and CHECK call this, so the README block and the drift check
// can never diverge from each other — only from the JSON, which is the point.

function buildStatusLine(data) {
  const c = data.counts;
  const betaTokens = data.surfaces
    .filter((s) => s.kind === 'token' && s.tier === 'beta')
    .map((s) => s.name);
  const experimentalPkgs = data.surfaces
    .filter((s) => s.kind === 'package' && s.tier === 'experimental')
    .map((s) => s.name);

  const nonStable = [];
  if (betaTokens.length) {
    nonStable.push(
      `${betaTokens.length} \`beta\` token layer${betaTokens.length === 1 ? '' : 's'} ` +
        `(${betaTokens.join(', ')} — held by open API questions, not missing coverage)`
    );
  }
  for (const pkg of experimentalPkgs) {
    nonStable.push(
      `the \`${pkg}\` package (\`experimental\` \`0.x\` — custom-elements packaging, not any component API)`
    );
  }

  const catalogStable =
    c.components.beta === 0 &&
    c.components.experimental === 0 &&
    c.patterns.beta === 0 &&
    c.patterns.experimental === 0;

  const head = catalogStable
    ? 'the entire component and pattern catalog is `stable` — every component and pattern has its API frozen for `5.x`, with no breaking change without a major bump'
    : `${c.components.stable} of ${c.components.stable + c.components.beta + c.components.experimental} components ` +
      `and ${c.patterns.stable} of ${c.patterns.stable + c.patterns.beta + c.patterns.experimental} patterns are \`stable\``;

  const nonStableClause = nonStable.length
    ? ` The only non-\`stable\` surfaces are ${nonStable.join(' and ')}.`
    : '';

  return (
    '> **Status: `5.x` stable.** ' +
    `Per the [stability matrix](docs/stability.md), ${head}.` +
    nonStableClause +
    ' Pin exact versions in production.' +
    ' The `5.0` line consolidated the former 64 per-component packages into a single `@kanso-protocol/ui` package with per-component secondary entry points ([ADR 0002](docs/adrs/0002-single-package-secondary-entry-points.md)) — install once, import per-subpath, tree-shaking preserved.' +
    " **Upgrading from 4.x?** Follow the [v5 migration guide](docs/MIGRATION-v5.md) (mechanical import-path change; no component API changed)." +
    " See [`docs/roadmap.md`](docs/roadmap.md) for what's next and the [changelog](CHANGELOG.md) for what landed."
  );
}

// ─── README block read / write ───────────────────────────────────────────

function extractReadmeBlock(readme) {
  const re = new RegExp(`${escapeRegExp(START)}\\n([\\s\\S]*?)\\n${escapeRegExp(END)}`);
  const m = readme.match(re);
  return m ? m[1] : null;
}

function rewriteReadme(readme, statusLine) {
  const block = `${START}\n${statusLine}\n${END}`;
  if (readme.includes(START) && readme.includes(END)) {
    const re = new RegExp(`${escapeRegExp(START)}[\\s\\S]*?${escapeRegExp(END)}`);
    return readme.replace(re, block);
  }
  // First run: wrap the existing "> **Status:" blockquote line in markers.
  const statusRe = /^> \*\*Status:.*$/m;
  if (statusRe.test(readme)) {
    return readme.replace(statusRe, block);
  }
  fail(
    `README.md has neither the ${START} markers nor a "> **Status:" line to wrap. ` +
      'Add the markers manually around the status blockquote and re-run.'
  );
  return readme; // unreachable (fail exits)
}

// ─── stability.md summary-line parsing ────────────────────────────────────

function parseStabilityMdCounts(md) {
  const out = {};
  const comp = md.match(
    /Components:\s*(\d+)\s*`?stable`?\s*·\s*(\d+)\s*`?beta`?\s*·\s*(\d+)\s*`?experimental`?/
  );
  if (comp) {
    out.components = { stable: +comp[1], beta: +comp[2], experimental: +comp[3] };
  }
  const pat = md.match(/Patterns:\s*(\d+)\s*`?stable`?\s*·\s*(\d+)\s*`?beta`?/);
  if (pat) {
    out.patterns = { stable: +pat[1], beta: +pat[2] };
  }
  return out;
}

// Recompute per-kind counts straight from surfaces[] so the stored `counts`
// block can't silently drift from the rows it summarizes.
function countsFromSurfaces(data) {
  const kinds = { component: 'components', pattern: 'patterns', token: 'tokens' };
  const acc = {
    components: { stable: 0, beta: 0, experimental: 0 },
    patterns: { stable: 0, beta: 0, experimental: 0 },
    tokens: { stable: 0, beta: 0, experimental: 0 },
  };
  for (const s of data.surfaces) {
    const bucket = kinds[s.kind];
    if (!bucket) continue;
    if (acc[bucket][s.tier] === undefined) acc[bucket][s.tier] = 0;
    acc[bucket][s.tier]++;
  }
  return acc;
}

// ─── Modes ─────────────────────────────────────────────────────────────────

function loadJson() {
  let raw;
  try {
    raw = fs.readFileSync(JSON_PATH, 'utf8');
  } catch {
    fail(`cannot read ${path.relative(ROOT, JSON_PATH)}`);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    fail(`docs/stability.json is not valid JSON: ${e.message}`);
  }
}

function runWrite(data) {
  const statusLine = buildStatusLine(data);
  const readme = fs.readFileSync(README_PATH, 'utf8');
  const next = rewriteReadme(readme, statusLine);
  if (next === readme) {
    console.log(`${COLOR_OK}✔ generate-stability: README status block already current${COLOR_RESET}`);
    return 0;
  }
  fs.writeFileSync(README_PATH, next);
  console.log(`${COLOR_OK}✔ generate-stability: rewrote README status block from stability.json${COLOR_RESET}`);
  return 0;
}

function runCheck(data) {
  const problems = [];
  const statusLine = buildStatusLine(data);

  // (1) README block matches what WRITE mode would emit.
  const readme = fs.readFileSync(README_PATH, 'utf8');
  const block = extractReadmeBlock(readme);
  if (block === null) {
    problems.push(
      `README.md has no ${START} / ${END} block — run \`node scripts/generate-stability.js\` to create it.`
    );
  } else if (block.trim() !== statusLine.trim()) {
    problems.push(
      'README status block is out of date vs docs/stability.json — run `node scripts/generate-stability.js`.'
    );
  }

  // (2) stability.md summary-count lines agree with stability.json counts.
  const md = fs.readFileSync(STABILITY_MD_PATH, 'utf8');
  const mdCounts = parseStabilityMdCounts(md);
  if (!mdCounts.components) {
    problems.push('Could not find the "Components: N stable · …" summary line in docs/stability.md.');
  } else {
    const j = data.counts.components;
    const m = mdCounts.components;
    if (j.stable !== m.stable || j.beta !== m.beta || j.experimental !== m.experimental) {
      problems.push(
        `Components summary disagrees — stability.md says ${m.stable}/${m.beta}/${m.experimental} ` +
          `(stable/beta/experimental), stability.json says ${j.stable}/${j.beta}/${j.experimental}.`
      );
    }
  }
  if (!mdCounts.patterns) {
    problems.push('Could not find the "Patterns: N stable · …" summary line in docs/stability.md.');
  } else {
    const j = data.counts.patterns;
    const m = mdCounts.patterns;
    if (j.stable !== m.stable || j.beta !== m.beta) {
      problems.push(
        `Patterns summary disagrees — stability.md says ${m.stable}/${m.beta} (stable/beta), ` +
          `stability.json says ${j.stable}/${j.beta}.`
      );
    }
  }

  // (3) stability.json counts agree with its own surfaces[].
  const computed = countsFromSurfaces(data);
  for (const bucket of ['components', 'patterns', 'tokens']) {
    for (const tier of ['stable', 'beta', 'experimental']) {
      const stored = (data.counts[bucket] || {})[tier] || 0;
      const actual = computed[bucket][tier] || 0;
      if (stored !== actual) {
        problems.push(
          `stability.json counts.${bucket}.${tier} = ${stored} but surfaces[] has ${actual}.`
        );
      }
    }
  }

  if (problems.length) {
    console.error(`${COLOR_ERR}✖ generate-stability: stability drift detected${COLOR_RESET}`);
    for (const p of problems) console.error(`  ${COLOR_ERR}- ${p}${COLOR_RESET}`);
    console.error(`\n${COLOR_DIM}Fix: update docs/stability.json to match docs/stability.md, then run \`node scripts/generate-stability.js\`.${COLOR_RESET}`);
    return 1;
  }
  console.log(`${COLOR_OK}✔ generate-stability: README + stability.md in sync with stability.json${COLOR_RESET}`);
  return 0;
}

function main() {
  const data = loadJson();
  if (!data || !data.counts || !Array.isArray(data.surfaces)) {
    fail('docs/stability.json must have { counts, surfaces[] }.');
  }
  return CHECK ? runCheck(data) : runWrite(data);
}

process.exit(main());
