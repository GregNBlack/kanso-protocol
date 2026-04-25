#!/usr/bin/env node
/**
 * kanso-lint-tokens — architectural rule checker for Kanso Protocol.
 *
 * Walks every `*.component.ts` file under packages/{components,patterns}/,
 * extracts the inline `styles: [\`...\`]` block, and reports CSS that
 * violates one of the system's contracts:
 *
 *   raw-color           — a hex / rgb / rgba / hsl / hsla literal that
 *                         should be a `var(--kp-color-*)` token
 *   physical-css        — margin-/padding-/border-{left,right} or
 *                         text-align:{left,right} (use logical instead)
 *   raw-motion-duration — a transition/animation duration that should
 *                         use `var(--kp-motion-duration-*)`
 *   raw-shadow          — a box-shadow that doesn't reference any
 *                         `var(--kp-…)` token
 *
 * Usage:
 *   node scripts/lint-tokens.js                # lint all components
 *   node scripts/lint-tokens.js --staged       # only files staged in git
 *   node scripts/lint-tokens.js --quiet        # only print failures
 *
 * Suppress on a single line by writing the line above (or on the same
 * line) a comment of the form:
 *   // kanso-lint-disable raw-color -- SVG fill literal needed for blob
 *   color: #ff0000;
 *
 * The reason after `--` is mandatory; without it the suppression is
 * ignored. This makes every legalized exception self-documenting.
 *
 * Exit codes:
 *   0 — no errors (warnings are advisory)
 *   1 — at least one error
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const STAGED = args.includes('--staged');
const QUIET = args.includes('--quiet');

const COLOR_OK = '\x1b[32m';
const COLOR_WARN = '\x1b[33m';
const COLOR_ERR = '\x1b[31m';
const COLOR_DIM = '\x1b[2m';
const COLOR_RESET = '\x1b[0m';

// ─── File discovery ─────────────────────────────────────────────────────

function listComponentFiles() {
  if (STAGED) {
    const out = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: ROOT,
      encoding: 'utf8',
    });
    return out
      .split('\n')
      .filter((p) => p.endsWith('.component.ts'))
      .map((p) => path.join(ROOT, p))
      .filter((p) => fs.existsSync(p));
  }
  const out = [];
  for (const layer of ['components', 'patterns']) {
    const base = path.join(ROOT, 'packages', layer);
    if (!fs.existsSync(base)) continue;
    for (const pkg of fs.readdirSync(base)) {
      const srcDir = path.join(base, pkg, 'src');
      if (!fs.existsSync(srcDir)) continue;
      for (const f of fs.readdirSync(srcDir)) {
        if (f.endsWith('.component.ts')) out.push(path.join(srcDir, f));
      }
    }
  }
  return out;
}

// ─── Styles-block extractor ─────────────────────────────────────────────
// Components in this repo always use `styles: [\`<css>\`]`. Find that
// region of the source so rules don't fire on TypeScript identifiers.

function extractStyleRegions(text) {
  const lines = text.split('\n');
  const regions = []; // [{ startLine, endLine }]
  let inStyles = false;
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inStyles) {
      if (/styles:\s*\[\s*`/.test(line)) {
        inStyles = true;
        depth = 1;
        regions.push({ start: i, end: i });
      }
      continue;
    }
    // We're inside a backtick-delimited template. Count opening and
    // closing backticks. The block ends when the matching backtick is
    // followed by `]`. Templates here don't use ${} so we don't have
    // to recurse.
    if (/^\s*`\s*\]/.test(line)) {
      regions[regions.length - 1].end = i;
      inStyles = false;
      depth = 0;
      continue;
    }
    regions[regions.length - 1].end = i;
  }
  return regions;
}

// ─── Suppression parser ─────────────────────────────────────────────────

function suppressionsForLine(prevLine, currLine) {
  const suppressed = new Set();
  const pat = /kanso-lint-disable\s+([\w-]+(?:\s*,\s*[\w-]+)*)\s+--\s+\S/;
  for (const text of [prevLine, currLine]) {
    if (!text) continue;
    const m = text.match(pat);
    if (!m) continue;
    for (const id of m[1].split(',')) suppressed.add(id.trim());
  }
  return suppressed;
}

// ─── Rules ──────────────────────────────────────────────────────────────

const RULES = [
  {
    id: 'raw-color',
    severity: 'error',
    check(line) {
      // Skip url(...) paths and any line that already references a kp token.
      if (/url\(/.test(line)) return null;
      // drop-shadow() inside a `filter:` is a layered visual effect that
      // can't be replaced with a single token — we'd lose composability.
      // It's the only CSS property we treat as exempt by design.
      if (/drop-shadow\s*\(/.test(line)) return null;
      // Match hex, rgb(...), rgba(...), hsl(...), hsla(...).
      const re = /(#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(?:rgba?|hsla?)\s*\([^)]+\))/;
      const m = line.match(re);
      if (!m) return null;
      // If the same line *also* references a kp token, treat the literal
      // as an intentional fallback (`var(--kp-…, #fallback)`) — common
      // pattern in our components.
      if (/var\(--kp-/.test(line)) return null;
      return {
        column: m.index + 1,
        message: `Raw color "${m[0]}" — use a var(--kp-color-*) token (or wrap it as a fallback inside an existing var()).`,
      };
    },
  },
  {
    id: 'physical-css',
    severity: 'error',
    check(line) {
      const physical = [
        { re: /\bmargin-(left|right)\s*:/, fix: (d) => `margin-inline-${d === 'left' ? 'start' : 'end'}` },
        { re: /\bpadding-(left|right)\s*:/, fix: (d) => `padding-inline-${d === 'left' ? 'start' : 'end'}` },
        { re: /\bborder-(left|right)\s*:/, fix: (d) => `border-inline-${d === 'left' ? 'start' : 'end'}` },
        { re: /\btext-align\s*:\s*(left|right)\b/, fix: (d) => `text-align: ${d === 'left' ? 'start' : 'end'}` },
        { re: /\bfloat\s*:\s*(left|right)\b/, fix: (d) => `float: ${d === 'left' ? 'inline-start' : 'inline-end'}` },
      ];
      for (const p of physical) {
        const m = line.match(p.re);
        if (m) {
          return {
            column: m.index + 1,
            message: `Physical CSS "${m[0].replace(/\s*:.*/, '')}" — use "${p.fix(m[1])}" (RTL-safe).`,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'raw-motion-duration',
    severity: 'warn',
    check(line) {
      // Look for `transition: ... <number>(ms|s) ...` or `animation: ...`
      // where no kp motion token is present on the same line.
      if (!/\b(?:transition|animation)\s*:/.test(line)) return null;
      if (/var\(--kp-motion/.test(line)) return null;
      const m = line.match(/\b(\d+(?:\.\d+)?(?:ms|s))\b/);
      if (!m) return null;
      return {
        column: m.index + 1,
        message: `Raw motion duration "${m[0]}" — use var(--kp-motion-duration-*).`,
      };
    },
  },
  {
    id: 'raw-shadow',
    severity: 'warn',
    check(line) {
      if (!/\bbox-shadow\s*:/.test(line)) return null;
      // Allowed: none, inherit, unset, or a `var(--kp-…)` reference.
      if (/box-shadow\s*:\s*(none|inherit|unset|initial|0\b)/.test(line)) return null;
      if (/var\(--kp-/.test(line)) return null;
      return {
        column: line.indexOf('box-shadow') + 1,
        message: `Raw box-shadow — extract to var(--kp-shadow-*) or compose from var(--kp-color-*) tokens.`,
      };
    },
  },
];

// ─── Lint a file ────────────────────────────────────────────────────────

function lintFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split('\n');
  const regions = extractStyleRegions(text);
  const findings = [];

  for (const region of regions) {
    for (let i = region.start; i <= region.end; i++) {
      const line = lines[i];
      if (!line) continue;
      const prevLine = lines[i - 1] || '';
      const suppressed = suppressionsForLine(prevLine, line);
      for (const rule of RULES) {
        if (suppressed.has(rule.id)) continue;
        const hit = rule.check(line);
        if (!hit) continue;
        findings.push({
          file: filePath,
          line: i + 1,
          column: hit.column,
          rule: rule.id,
          severity: rule.severity,
          message: hit.message,
          source: line.trim(),
        });
      }
    }
  }
  return findings;
}

// ─── Reporter ───────────────────────────────────────────────────────────

function colorFor(sev) {
  return sev === 'error' ? COLOR_ERR : sev === 'warn' ? COLOR_WARN : COLOR_DIM;
}

function report(findings) {
  let errors = 0;
  let warns = 0;
  const byFile = new Map();
  for (const f of findings) {
    if (f.severity === 'error') errors++;
    else if (f.severity === 'warn') warns++;
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }

  if (!QUIET || findings.length) {
    for (const [file, items] of byFile) {
      const rel = path.relative(ROOT, file);
      console.log(`\n${COLOR_DIM}${rel}${COLOR_RESET}`);
      for (const f of items) {
        const sev = `${colorFor(f.severity)}${f.severity.toUpperCase()}${COLOR_RESET}`;
        console.log(`  ${sev} ${rel}:${f.line}:${f.column}  [${f.rule}]`);
        console.log(`        ${f.message}`);
        console.log(`        ${COLOR_DIM}${f.source}${COLOR_RESET}`);
      }
    }
  }

  console.log();
  if (findings.length === 0) {
    console.log(`${COLOR_OK}✔ kanso-lint-tokens: clean${COLOR_RESET}`);
  } else {
    const summary = [];
    if (errors) summary.push(`${COLOR_ERR}${errors} error${errors === 1 ? '' : 's'}${COLOR_RESET}`);
    if (warns) summary.push(`${COLOR_WARN}${warns} warning${warns === 1 ? '' : 's'}${COLOR_RESET}`);
    console.log(`✖ kanso-lint-tokens: ${summary.join(', ')}`);
  }

  return errors > 0 ? 1 : 0;
}

// ─── Main ───────────────────────────────────────────────────────────────

function main() {
  const files = listComponentFiles();
  if (!files.length) {
    if (!QUIET) console.log('kanso-lint-tokens: no .component.ts files to lint.');
    return 0;
  }
  const findings = files.flatMap(lintFile);
  return report(findings);
}

process.exit(main());
