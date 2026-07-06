#!/usr/bin/env node
/**
 * kanso-check-contrast — WCAG contrast gate for Kanso Protocol tokens.
 *
 * "Validate, don't postulate." Token $descriptions claim specific
 * contrast ratios (e.g. "blue.700 #1D4ED8 → 7.46:1 on white"). This
 * script proves those claims against the *built* CSS custom-property
 * chains instead of trusting the comment.
 *
 * What it does:
 *   1. Parses every `--kp-color-*` declaration from the committed
 *      packages/ui/styles/tokens.css (light, in :root) and dark.css
 *      (dark overrides, in [data-theme="dark"]).
 *   2. Resolves a token → final literal color by following
 *      `var(--kp-color-*)` alias chains. In dark theme a token resolves
 *      to its dark.css value if present, else falls back to its light
 *      value — recursively, matching how the cascade actually renders.
 *   3. Computes real WCAG 2.x relative luminance + contrast ratio for a
 *      curated list of genuine foreground-on-background token pairs
 *      (scripts/contrast-pairs.json), compositing translucent (rgba)
 *      foregrounds over their paired background first.
 *   4. Prints an aligned table and exits 1 if any pair is below its
 *      required ratio.
 *
 * The pairs are REAL fg-on-bg combinations that the UI renders — seeded
 * from the audited pairs documented in tokens/semantic/color.json. If a
 * genuine pair fails, that's a token bug to fix (or a pair to reclassify)
 * — do NOT loosen the threshold to make CI green.
 *
 * Usage:
 *   node scripts/check-contrast.js                     # both themes
 *   node scripts/check-contrast.js --theme=light       # one theme
 *   node scripts/check-contrast.js --pairs=other.json  # alt pair set (tests)
 *   node scripts/check-contrast.js --tokens=a.css --dark=b.css   # alt sources
 *
 * Exit codes:
 *   0 — every pair meets its required ratio
 *   1 — at least one pair fails (or a config/parse error)
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const COLOR_OK = '\x1b[32m';
const COLOR_ERR = '\x1b[31m';
const COLOR_DIM = '\x1b[2m';
const COLOR_RESET = '\x1b[0m';

// ─── Args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}
const THEME_ARG = argValue('theme', 'both'); // both | light | dark
const PAIRS_PATH = path.resolve(ROOT, argValue('pairs', 'scripts/contrast-pairs.json'));
const TOKENS_PATH = path.resolve(ROOT, argValue('tokens', 'packages/ui/styles/tokens.css'));
const DARK_PATH = path.resolve(ROOT, argValue('dark', 'packages/ui/styles/dark.css'));

// Required ratios per WCAG level classification.
const LEVELS = {
  'AA-text': 4.5, // normal-size body text
  'AA-large': 3.0, // large text (>= 18.66px bold / 24px regular)
  'AA-ui': 3.0, // non-text UI: borders, icons, focus rings, graphical objects
};

// ─── CSS declaration parser ────────────────────────────────────────────────
// Both files declare tokens as `  --kp-color-foo: <value>;` (with an
// optional trailing /** ... */ comment after the semicolon). We only need
// the name and the value up to the first semicolon.

function parseDeclarations(cssText) {
  const map = new Map(); // name (with leading --) → raw value string
  const re = /(--kp-color-[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    // First declaration wins is irrelevant here (each file has one block),
    // but if a token is declared twice we take the last — matching cascade.
    map.set(m[1], m[2].trim());
  }
  return map;
}

// ─── Color parsing ─────────────────────────────────────────────────────────
// Returns { r, g, b, a } with channels in 0..255 and alpha in 0..1, or null
// if the string isn't a literal color.

function parseColor(str) {
  const s = str.trim();
  // #rgb / #rgba / #rrggbb / #rrggbbaa
  const hex = s.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3 || h.length === 4) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      const a = h.length === 4 ? parseInt(h[3] + h[3], 16) / 255 : 1;
      return { r, g, b, a };
    }
    if (h.length === 6 || h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, a };
    }
  }
  // rgb(...) / rgba(...)
  const rgb = s.match(/^rgba?\(\s*([^)]+)\)$/i);
  if (rgb) {
    const parts = rgb[1].split(/[,/\s]+/).filter(Boolean);
    if (parts.length >= 3) {
      const r = Math.round(parseFloat(parts[0]));
      const g = Math.round(parseFloat(parts[1]));
      const b = Math.round(parseFloat(parts[2]));
      const a = parts.length >= 4 ? parseFloat(parts[3]) : 1;
      return { r, g, b, a };
    }
  }
  return null;
}

// ─── Resolver ──────────────────────────────────────────────────────────────
// Follow var(--kp-color-*) alias chains to a literal color for a given
// theme. In dark theme, each hop is resolved dark-first (dark.css value if
// present, else the light value) — this mirrors the CSS cascade, where a
// dark override on any token in the chain takes effect.

function makeResolver(lightMap, darkMap) {
  function rawValue(name, theme) {
    if (theme === 'dark' && darkMap.has(name)) return darkMap.get(name);
    return lightMap.get(name);
  }

  function resolve(name, theme, seen = new Set()) {
    if (seen.has(name)) {
      throw new Error(`Cyclic token reference at ${name} (${theme})`);
    }
    seen.add(name);

    const value = rawValue(name, theme);
    if (value == null) {
      throw new Error(`Unknown token: ${name} (${theme})`);
    }

    // Alias: var(--kp-color-x [, fallback]) — follow the referenced token.
    const varMatch = value.match(/^var\(\s*(--kp-color-[\w-]+)\s*(?:,\s*(.+))?\)$/);
    if (varMatch) {
      const referenced = varMatch[1];
      // If the referenced token exists in our maps, follow it (theme-aware).
      const existsSomewhere = lightMap.has(referenced) || darkMap.has(referenced);
      if (existsSomewhere) return resolve(referenced, theme, seen);
      // Otherwise use the literal fallback if one was provided.
      if (varMatch[2]) {
        const c = parseColor(varMatch[2].trim());
        if (c) return c;
      }
      throw new Error(`Cannot resolve ${value} for ${name} (${theme})`);
    }

    const color = parseColor(value);
    if (!color) {
      throw new Error(`Non-color / unparseable value "${value}" for ${name} (${theme})`);
    }
    return color;
  }

  return resolve;
}

// ─── WCAG math ───────────────────────────────────────────────────────────

function srgbToLinear(c) {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

// Composite a (possibly translucent) foreground over an opaque backdrop.
function compositeOver(fg, bg) {
  if (fg.a >= 1) return { r: fg.r, g: fg.g, b: fg.b };
  const a = fg.a;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
  };
}

function contrastRatio(fg, bg) {
  // The background must be opaque for a meaningful ratio. If a paired bg is
  // itself translucent we surface that as a config error upstream.
  const fgOnBg = compositeOver(fg, bg);
  const l1 = relativeLuminance(fgOnBg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── Main ────────────────────────────────────────────────────────────────

function toFullName(token) {
  // Accept `accent-primary-fg`, `--kp-color-accent-primary-fg`, or a bare
  // primitive like `gray-400`. Normalize to the full custom-property name.
  let t = token.trim();
  if (t.startsWith('--')) return t;
  if (!t.startsWith('kp-color-')) t = `kp-color-${t}`;
  return `--${t}`;
}

function fmt(n) {
  return n.toFixed(2);
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function main() {
  for (const p of [TOKENS_PATH, DARK_PATH, PAIRS_PATH]) {
    if (!fs.existsSync(p)) {
      console.error(`${COLOR_ERR}check-contrast: missing input file ${path.relative(ROOT, p)}${COLOR_RESET}`);
      return 1;
    }
  }

  const lightMap = parseDeclarations(fs.readFileSync(TOKENS_PATH, 'utf8'));
  const darkMap = parseDeclarations(fs.readFileSync(DARK_PATH, 'utf8'));
  const resolve = makeResolver(lightMap, darkMap);

  let pairs;
  try {
    pairs = JSON.parse(fs.readFileSync(PAIRS_PATH, 'utf8'));
  } catch (e) {
    console.error(`${COLOR_ERR}check-contrast: cannot parse ${path.relative(ROOT, PAIRS_PATH)} — ${e.message}${COLOR_RESET}`);
    return 1;
  }
  if (!Array.isArray(pairs)) {
    console.error(`${COLOR_ERR}check-contrast: pairs file must be a JSON array${COLOR_RESET}`);
    return 1;
  }

  const wantThemes = THEME_ARG === 'both' ? ['light', 'dark'] : [THEME_ARG];

  const rows = [];
  let failures = 0;
  let errors = 0;

  for (const pair of pairs) {
    const { fg, bg, level } = pair;
    const themes = pair.theme === 'both' || pair.theme == null ? ['light', 'dark'] : [pair.theme];
    const required = LEVELS[level];
    if (required == null) {
      console.error(`${COLOR_ERR}check-contrast: unknown level "${level}" for ${fg} on ${bg}${COLOR_RESET}`);
      errors++;
      continue;
    }
    for (const theme of themes) {
      if (!wantThemes.includes(theme)) continue;
      let ratio;
      let status;
      try {
        const fgColor = resolve(toFullName(fg), theme);
        const bgColor = resolve(toFullName(bg), theme);
        if (bgColor.a < 1) {
          throw new Error(`background ${bg} is translucent (alpha ${bgColor.a}); pair a solid surface`);
        }
        ratio = contrastRatio(fgColor, bgColor);
        const passed = ratio >= required;
        status = passed ? 'PASS' : 'FAIL';
        if (!passed) failures++;
      } catch (e) {
        ratio = null;
        status = 'ERROR';
        errors++;
        rows.push({ fg, bg, theme, level, required, ratio, status, error: e.message });
        continue;
      }
      rows.push({ fg, bg, theme, level, required, ratio, status });
    }
  }

  // ─── Report ──────────────────────────────────────────────────────────
  const wPair = Math.max(4, ...rows.map((r) => `${r.fg} on ${r.bg}`.length));
  const wTheme = 5;
  const wLevel = Math.max(5, ...rows.map((r) => String(r.level).length));

  console.log();
  console.log(
    `  ${COLOR_DIM}${pad('PAIR (fg on bg)', wPair)}  ${pad('THEME', wTheme)}  ${pad('LEVEL', wLevel)}  ${pad('RATIO', 6)}  ${pad('REQ', 5)}  RESULT${COLOR_RESET}`,
  );
  for (const r of rows) {
    const pairStr = pad(`${r.fg} on ${r.bg}`, wPair);
    const ratioStr = pad(r.ratio == null ? '—' : fmt(r.ratio), 6);
    const reqStr = pad(fmt(r.required), 5);
    let mark;
    if (r.status === 'PASS') mark = `${COLOR_OK}PASS${COLOR_RESET}`;
    else if (r.status === 'FAIL') mark = `${COLOR_ERR}FAIL${COLOR_RESET}`;
    else mark = `${COLOR_ERR}ERROR${COLOR_RESET}`;
    let line = `  ${pairStr}  ${pad(r.theme, wTheme)}  ${pad(r.level, wLevel)}  ${ratioStr}  ${reqStr}  ${mark}`;
    if (r.error) line += ` ${COLOR_DIM}(${r.error})${COLOR_RESET}`;
    console.log(line);
  }

  console.log();
  if (failures === 0 && errors === 0) {
    console.log(`${COLOR_OK}✔ kanso-check-contrast: all ${rows.length} pair-checks meet AA${COLOR_RESET}`);
    return 0;
  }
  const parts = [];
  if (failures) parts.push(`${COLOR_ERR}${failures} below AA${COLOR_RESET}`);
  if (errors) parts.push(`${COLOR_ERR}${errors} error${errors === 1 ? '' : 's'}${COLOR_RESET}`);
  console.log(`✖ kanso-check-contrast: ${parts.join(', ')}`);
  return 1;
}

process.exit(main());
