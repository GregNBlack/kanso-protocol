#!/usr/bin/env node
/**
 * generate-matrix — derive the action-role state matrix from a compact spec.
 *
 * The 216-combo action matrix in tokens/semantic/color.json
 *   roles {primary, danger, neutral}
 *     × variants {default, subtle, outline, ghost}
 *     × surfaces {bg, fg, border}
 *     × states  {rest, hover, active, focus, disabled, loading}
 * is not 216 independent decisions — it is two rule TEMPLATES applied over a
 * role→hue map:
 *
 *   - SATURATED (primary→blue, danger→red, and any future brand/status role):
 *     solid fills walk the ramp (600/700/800), tints sit at 50/100/200, `fg`
 *     is `foreground.on-saturated`, `disabled` falls back to the gray ramp,
 *     `focus` mirrors `rest` except the opt-in focus-border at `<hue>.600`.
 *   - NEUTRAL (gray hue): a darker solid ladder (900/800/700) with white ink,
 *     tints shifted one stop up (100/200/300) so they read on a neutral surface.
 *
 * `validate-tokens.js` proves the matrix is COMPLETE and that the solid-default
 * ramp walks one step; this proves every one of the 216 cells equals what the
 * template says it should be — so a hand-edit that silently breaks the
 * subtle/outline/ghost derivation (which validate-tokens deliberately leaves
 * un-ramped) fails CI instead of shipping.
 *
 * Usage:
 *   node scripts/generate-matrix.js           # print the derived matrix
 *   node scripts/generate-matrix.js --check    # diff derived vs committed; exit 1 on drift
 *
 * Adding a saturated role (e.g. success→green): add one line to ROLES and the
 * matching `color.success.*` block; --check keeps them in lock-step. This file
 * is the single source for the derivation rules.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SEMANTIC_PATH = path.join(ROOT, 'tokens', 'semantic', 'color.json');

const args = process.argv.slice(2);
const CHECK = args.includes('--check');

const C_OK = '\x1b[32m';
const C_ERR = '\x1b[31m';
const C_DIM = '\x1b[2m';
const C_RESET = '\x1b[0m';

const VARIANTS = ['default', 'subtle', 'outline', 'ghost'];
const SURFACES = ['bg', 'fg', 'border'];
const STATES = ['rest', 'hover', 'active', 'focus', 'disabled', 'loading'];

// Role → { hue ramp, which template }. Add a saturated role with one line.
const ROLES = {
  primary: { hue: 'blue', template: 'saturated' },
  danger: { hue: 'red', template: 'saturated' },
  neutral: { hue: 'gray', template: 'neutral' },
};

// Cell codes:  H<stop>=the role hue ramp · G<stop>=the gray ramp ·
//              T=transparent · ON=foreground.on-saturated · WHITE=color.white
// Each row is [rest, hover, active, focus, disabled, loading].
const TEMPLATES = {
  saturated: {
    default: {
      bg: ['H600', 'H700', 'H800', 'H600', 'G200', 'H500'],
      fg: ['ON', 'ON', 'ON', 'ON', 'G400', 'ON'],
      border: ['H600', 'H700', 'H800', 'H600', 'G200', 'H500'],
    },
    subtle: {
      bg: ['H50', 'H100', 'H200', 'H50', 'G100', 'H50'],
      fg: ['H700', 'H800', 'H900', 'H700', 'G400', 'H500'],
      border: ['T', 'T', 'T', 'H600', 'T', 'T'],
    },
    outline: {
      bg: ['T', 'H50', 'H100', 'T', 'T', 'T'],
      fg: ['H600', 'H700', 'H800', 'H600', 'G400', 'H400'],
      border: ['H300', 'H400', 'H500', 'H600', 'G200', 'H200'],
    },
    ghost: {
      bg: ['T', 'H50', 'H100', 'T', 'T', 'T'],
      fg: ['H600', 'H700', 'H800', 'H600', 'G400', 'H400'],
      border: ['T', 'T', 'T', 'H600', 'T', 'T'],
    },
  },
  neutral: {
    default: {
      bg: ['G900', 'G800', 'G700', 'G900', 'G200', 'G700'],
      fg: ['WHITE', 'WHITE', 'WHITE', 'WHITE', 'G400', 'WHITE'],
      border: ['G900', 'G800', 'G700', 'G900', 'G200', 'G700'],
    },
    subtle: {
      bg: ['G100', 'G200', 'G300', 'G100', 'G100', 'G100'],
      fg: ['G700', 'G800', 'G900', 'G700', 'G400', 'G500'],
      border: ['T', 'T', 'T', 'G600', 'T', 'T'],
    },
    outline: {
      bg: ['T', 'G50', 'G100', 'T', 'T', 'T'],
      fg: ['G700', 'G800', 'G900', 'G700', 'G400', 'G400'],
      border: ['G300', 'G400', 'G500', 'G600', 'G200', 'G200'],
    },
    ghost: {
      bg: ['T', 'G100', 'G200', 'T', 'T', 'T'],
      fg: ['G700', 'G800', 'G900', 'G700', 'G400', 'G400'],
      border: ['T', 'T', 'T', 'G600', 'T', 'T'],
    },
  },
};

function resolve(code, hue) {
  if (code === 'T') return 'transparent';
  if (code === 'ON') return '{color.foreground.on-saturated}';
  if (code === 'WHITE') return '{color.white}';
  const m = code.match(/^([HG])(\d+)$/);
  if (!m) throw new Error(`bad cell code: ${code}`);
  const ramp = m[1] === 'H' ? hue : 'gray';
  return `{color.${ramp}.${m[2]}}`;
}

// Derive the full { role.variant.surface.state → value } map from the spec.
function derive() {
  const out = {};
  for (const [role, { hue, template }] of Object.entries(ROLES)) {
    const tmpl = TEMPLATES[template];
    for (const variant of VARIANTS) {
      for (const surface of SURFACES) {
        STATES.forEach((state, i) => {
          out[`color.${role}.${variant}.${surface}.${state}`] = resolve(tmpl[variant][surface][i], hue);
        });
      }
    }
  }
  return out;
}

function readCommitted() {
  const data = JSON.parse(fs.readFileSync(SEMANTIC_PATH, 'utf8'));
  const c = data.color;
  const out = {};
  for (const role of Object.keys(ROLES)) {
    for (const variant of VARIANTS) {
      for (const surface of SURFACES) {
        for (const state of STATES) {
          const leaf = c?.[role]?.[variant]?.[surface]?.[state];
          out[`color.${role}.${variant}.${surface}.${state}`] =
            leaf && typeof leaf === 'object' && '$value' in leaf ? leaf.$value : undefined;
        }
      }
    }
  }
  return out;
}

function main() {
  const derived = derive();

  if (!CHECK) {
    for (const [k, v] of Object.entries(derived)) console.log(`${k} = ${v}`);
    console.log(`\n${C_DIM}${Object.keys(derived).length} combos derived from ${Object.keys(ROLES).length} roles × 2 templates${C_RESET}`);
    return 0;
  }

  const committed = readCommitted();
  const diffs = [];
  for (const key of Object.keys(derived)) {
    if (committed[key] !== derived[key]) {
      diffs.push(`  ${key}\n      committed: ${committed[key] ?? '∅ (missing)'}\n      derived:   ${derived[key]}`);
    }
  }

  if (diffs.length) {
    console.error(`${C_ERR}✖ generate-matrix: ${diffs.length}/${Object.keys(derived).length} matrix cell(s) diverge from the derivation spec:${C_RESET}\n`);
    console.error(diffs.join('\n'));
    console.error(
      `\nEither the edit is intentional (update the TEMPLATES/ROLES spec in scripts/generate-matrix.js) ` +
        `or it's drift (revert it). The action matrix is derived, not hand-decided per cell.`
    );
    return 1;
  }

  console.log(
    `${C_OK}✔ generate-matrix: all ${Object.keys(derived).length} matrix cells match the derivation spec${C_RESET}\n` +
      `${C_DIM}  ${Object.keys(ROLES).length} roles (${Object.keys(ROLES).join(', ')}) × 4 variants × 3 surfaces × 6 states, 2 templates${C_RESET}`
  );
  return 0;
}

process.exit(main());
