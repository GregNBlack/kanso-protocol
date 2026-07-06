#!/usr/bin/env node
/**
 * kanso-validate-tokens — semantic token-set integrity checker.
 *
 * Where scripts/lint-tokens.js polices *component CSS* (no raw colors,
 * no primitives, RTL-safe props), this script polices the *token JSON
 * itself*: the action-role state matrix must be complete, its "mechanical
 * ramp" pattern must actually hold, and every dark-theme override must
 * target a token that exists in the light set. It is the "holes are now
 * impossible" guarantee — a missing or drifted token fails the build here
 * instead of silently rendering wrong (or `unset`) at runtime.
 *
 * Three checks:
 *
 *   1. COMPLETENESS (no holes)
 *      action roles {primary,danger,neutral} × variants
 *      {default,subtle,outline,ghost} × surfaces {bg,fg,border} × states
 *      {rest,hover,active,focus,disabled,loading} = 216 combos. Every one
 *      must exist in tokens/semantic/color.json AND carry a $value that
 *      resolves (through any alias chain) to a concrete literal
 *      (hex / rgb(a) / transparent). Any missing or dangling combo is an
 *      error naming the exact dotted path.
 *
 *   2. RAMP-STEP INVARIANT (the "mechanical" pattern, enforced)
 *      For the SOLID `default` variant, surfaces {bg,border}, the light
 *      aliases for rest/hover/active must walk three ADJACENT stops of a
 *      SINGLE primitive ramp, monotonically:
 *        primary/danger  600 → 700 → 800   (ascending;  N → N+100 → N+200)
 *        neutral         900 → 800 → 700   (descending mirror — neutral
 *                                           starts at the dark end of gray)
 *      Direction is inferred from rest→hover and active must continue it,
 *      so both the ascending roles and the descending neutral role pass
 *      without special-casing the numbers. Everything NOT in this scope is
 *      an EXPLICIT, documented exception (see EXCEPTIONS below) and is left
 *      alone — we only flag true deviations, never the legitimate breaks.
 *
 *   3. DARK EXISTENCE (no drift / typos)
 *      Every leaf overridden in tokens/themes/dark.json must correspond to
 *      a leaf that exists in the light set (semantic or primitive). The
 *      comparison is on the FLATTENED Style-Dictionary name (path parts
 *      joined by "-"), not the raw JSON nesting — that is the unit Style
 *      Dictionary actually merges on. (e.g. dark `color.avatar.group.count.bg`
 *      and light `color.avatar-group.count.bg` both flatten to
 *      `color-avatar-group-count-bg`, so they are the same token and this
 *      is NOT drift.) A dark override with no light counterpart = error.
 *
 * Token file locations can be overridden for testing via env vars
 * (KANSO_TOKENS_SEMANTIC / _PRIMITIVE / _DARK) — used by the negative
 * self-test to point the validator at a deliberately-broken copy.
 *
 * Usage:
 *   node scripts/validate-tokens.js
 *
 * Exit codes:
 *   0 — token set is complete, ramp-consistent, and drift-free
 *   1 — at least one integrity error (details printed)
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const SEMANTIC_PATH =
  process.env.KANSO_TOKENS_SEMANTIC || path.join(ROOT, 'tokens', 'semantic', 'color.json');
const PRIMITIVE_PATH =
  process.env.KANSO_TOKENS_PRIMITIVE || path.join(ROOT, 'tokens', 'primitive', 'color.json');
const DARK_PATH =
  process.env.KANSO_TOKENS_DARK || path.join(ROOT, 'tokens', 'themes', 'dark.json');

const COLOR_OK = '\x1b[32m';
const COLOR_ERR = '\x1b[31m';
const COLOR_DIM = '\x1b[2m';
const COLOR_RESET = '\x1b[0m';

// ─── Matrix definition ──────────────────────────────────────────────────

const ROLES = ['primary', 'danger', 'neutral'];
const VARIANTS = ['default', 'subtle', 'outline', 'ghost'];
const SURFACES = ['bg', 'fg', 'border'];
const STATES = ['rest', 'hover', 'active', 'focus', 'disabled', 'loading'];

// Ordered primitive ramp stops. Note the 50→100 gap is a single step here
// (the numeric jump is not uniform), so we compare by INDEX in this list,
// which is what "the next ramp stop" means for the design system.
const RAMP_STOPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

// The ramp-step invariant applies ONLY to the solid `default` variant, on
// the bg + border surfaces, for the rest/hover/active states. Everything
// below is a LEGITIMATE, documented break from the "adjacent ramp stops"
// pattern and is therefore excluded from the invariant (but still covered
// by the COMPLETENESS check, which just requires a resolvable value):
//
//   • state `focus`     — mirrors `rest` (same stop), not a ramp step.
//   • state `disabled`  — flattens to a neutral gray (gray.200 / gray.100),
//                         intentionally off the role ramp.
//   • state `loading`   — a one-off brighter shade (e.g. blue.500) so a
//                         spinner stays legible; not part of the walk.
//   • surface `fg`      — resolves to foreground.on-saturated (white) on the
//                         solid fill, or a cross-ramp text color; never the
//                         role ramp.
//   • variants subtle / outline / ghost — transparent-based or tinted
//                         surfaces whose stops are chosen for contrast, not
//                         a monotonic rest→hover→active walk.
const RAMP_CHECK = {
  variant: 'default',
  surfaces: ['bg', 'border'],
  states: ['rest', 'hover', 'active'],
};

// ─── Helpers ────────────────────────────────────────────────────────────

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function getByPath(tree, parts) {
  let node = tree;
  for (const p of parts) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[p];
  }
  return node;
}

function deepMerge(a, b) {
  const out = structuredClone(a);
  for (const k of Object.keys(b)) {
    const bv = b[k];
    if (bv && typeof bv === 'object' && !Array.isArray(bv) && out[k] && typeof out[k] === 'object') {
      out[k] = deepMerge(out[k], bv);
    } else {
      out[k] = bv;
    }
  }
  return out;
}

// Collect every leaf token (a node carrying a $value) as its flattened
// Style-Dictionary name: path parts joined by "-". This mirrors how Style
// Dictionary derives CSS variable names, so two different JSON nestings
// that flatten to the same name are correctly treated as the same token.
function collectLeafNames(node, prefix, out) {
  if (!node || typeof node !== 'object') return;
  for (const key of Object.keys(node)) {
    if (key.startsWith('$')) continue;
    const child = node[key];
    if (!child || typeof child !== 'object') continue;
    const nextPrefix = [...prefix, key];
    if (Object.prototype.hasOwnProperty.call(child, '$value')) {
      out.add(nextPrefix.join('-'));
    } else {
      collectLeafNames(child, nextPrefix, out);
    }
  }
}

// Resolve an alias / literal against the merged (primitive+semantic) tree.
// Returns { ok, value } on success or { ok:false, reason } on a dangling
// or circular reference. A non-alias string (hex, transparent, rgb(a)) is
// already resolved.
function resolveValue(value, tree, seen) {
  if (typeof value !== 'string') {
    return { ok: false, reason: `$value is not a string (${JSON.stringify(value)})` };
  }
  const m = value.match(/^\{([^}]+)\}$/);
  if (!m) {
    // Literal color: hex, transparent, rgb()/rgba(), hsl()/hsla().
    return { ok: true, value };
  }
  const ref = m[1]; // e.g. "color.blue.600"
  if (seen.has(ref)) return { ok: false, reason: `circular alias at {${ref}}` };
  seen.add(ref);
  const node = getByPath(tree, ref.split('.'));
  if (!node || typeof node !== 'object' || node.$value === undefined) {
    return { ok: false, reason: `alias {${ref}} does not resolve to any token` };
  }
  return resolveValue(node.$value, tree, seen);
}

// Parse an alias of the form {color.<ramp>.<stop>}; returns null if the
// value is not a single primitive-ramp alias.
function parseRampAlias(value) {
  if (typeof value !== 'string') return null;
  const m = value.match(/^\{color\.([a-z]+)\.(\d+)\}$/);
  if (!m) return null;
  return { ramp: m[1], stop: m[2] };
}

// ─── Checks ─────────────────────────────────────────────────────────────

function checkCompleteness(semantic, mergedTree, errors) {
  let checked = 0;
  for (const role of ROLES) {
    for (const variant of VARIANTS) {
      for (const surface of SURFACES) {
        for (const state of STATES) {
          checked++;
          const dotted = `color.${role}.${variant}.${surface}.${state}`;
          const node = getByPath(semantic, dotted.split('.'));
          if (!node || typeof node !== 'object') {
            errors.push(`[completeness] missing token: ${dotted}`);
            continue;
          }
          if (node.$value === undefined) {
            errors.push(`[completeness] token has no $value: ${dotted}`);
            continue;
          }
          const res = resolveValue(node.$value, mergedTree, new Set());
          if (!res.ok) {
            errors.push(`[completeness] unresolvable token ${dotted}: ${res.reason}`);
          }
        }
      }
    }
  }
  return checked;
}

function checkRampStep(semantic, errors) {
  let checked = 0;
  for (const role of ROLES) {
    for (const surface of RAMP_CHECK.surfaces) {
      const base = `color.${role}.${RAMP_CHECK.variant}.${surface}`;
      const vals = {};
      let ok = true;
      for (const state of RAMP_CHECK.states) {
        const node = getByPath(semantic, `${base}.${state}`.split('.'));
        const alias = node ? parseRampAlias(node.$value) : null;
        if (!alias) {
          errors.push(
            `[ramp-step] ${base}.${state} is not a single primitive-ramp alias ` +
              `(got ${node ? JSON.stringify(node.$value) : 'missing'}); ` +
              `the default solid variant must walk one ramp.`
          );
          ok = false;
          continue;
        }
        vals[state] = alias;
      }
      if (!ok) continue;
      checked++;

      const { rest, hover, active } = vals;

      // All three must be the SAME ramp family.
      if (rest.ramp !== hover.ramp || rest.ramp !== active.ramp) {
        errors.push(
          `[ramp-step] ${base}: rest/hover/active mix ramps ` +
            `(${rest.ramp}/${hover.ramp}/${active.ramp}); the solid default must stay on one ramp.`
        );
        continue;
      }

      const iRest = RAMP_STOPS.indexOf(rest.stop);
      const iHover = RAMP_STOPS.indexOf(hover.stop);
      const iActive = RAMP_STOPS.indexOf(active.stop);
      if (iRest < 0 || iHover < 0 || iActive < 0) {
        errors.push(
          `[ramp-step] ${base}: unknown ramp stop(s) ` +
            `rest=${rest.stop} hover=${hover.stop} active=${active.stop}.`
        );
        continue;
      }

      // Direction inferred from rest→hover; active must continue it by one
      // more adjacent step. Ascending (primary/danger 600→700→800) and the
      // descending neutral mirror (900→800→700) both satisfy this.
      const dir = iHover - iRest;
      if (dir !== 1 && dir !== -1) {
        errors.push(
          `[ramp-step] ${base}: rest→hover is not a single adjacent step ` +
            `(${rest.ramp}.${rest.stop} → ${hover.ramp}.${hover.stop}). ` +
            `Expected the next ramp stop (e.g. 600→700).`
        );
        continue;
      }
      if (iActive - iHover !== dir) {
        errors.push(
          `[ramp-step] ${base}: hover→active does not continue the ramp walk ` +
            `(${rest.ramp}: ${rest.stop}→${hover.stop}→${active.stop}). ` +
            `Expected three adjacent stops in one direction (N→N±100→N±200).`
        );
      }
    }
  }
  return checked;
}

function checkDarkExistence(dark, lightLeafNames, errors) {
  const darkLeafNames = new Set();
  collectLeafNames(dark, [], darkLeafNames);
  for (const name of darkLeafNames) {
    if (!lightLeafNames.has(name)) {
      // Reconstruct a readable dotted path for the message.
      errors.push(
        `[dark-existence] dark override "${name.replace(/-/g, '.')}" ` +
          `has no counterpart in the light token set (semantic or primitive) — ` +
          `likely a typo or a token removed from light without removing its dark override.`
      );
    }
  }
  return darkLeafNames.size;
}

// ─── Main ───────────────────────────────────────────────────────────────

function main() {
  let semantic, primitive, dark;
  try {
    semantic = readJson(SEMANTIC_PATH);
    primitive = readJson(PRIMITIVE_PATH);
    dark = readJson(DARK_PATH);
  } catch (e) {
    console.error(`${COLOR_ERR}✖ kanso-validate-tokens: failed to read/parse token JSON${COLOR_RESET}`);
    console.error(`  ${e.message}`);
    return 1;
  }

  // Merged tree used only for alias resolution (primitive + semantic).
  const mergedTree = deepMerge(primitive, semantic);

  // Light leaf-name set (flattened) = semantic ∪ primitive.
  const lightLeafNames = new Set();
  collectLeafNames(semantic, [], lightLeafNames);
  collectLeafNames(primitive, [], lightLeafNames);

  const errors = [];
  const nComplete = checkCompleteness(semantic, mergedTree, errors);
  const nRamp = checkRampStep(semantic, errors);
  const nDark = checkDarkExistence(dark, lightLeafNames, errors);

  console.log();
  if (errors.length === 0) {
    console.log(`${COLOR_OK}✔ kanso-validate-tokens: token set is complete, ramp-consistent, and drift-free${COLOR_RESET}`);
    console.log(
      `${COLOR_DIM}  completeness: ${nComplete}/${ROLES.length * VARIANTS.length * SURFACES.length * STATES.length} combos resolved` +
        `  ·  ramp-step: ${nRamp} default bg/border sequences verified` +
        `  ·  dark-existence: ${nDark} overrides matched${COLOR_RESET}`
    );
    return 0;
  }

  console.log(`${COLOR_ERR}✖ kanso-validate-tokens: ${errors.length} error${errors.length === 1 ? '' : 's'}${COLOR_RESET}`);
  for (const err of errors) {
    console.log(`  ${COLOR_ERR}ERROR${COLOR_RESET} ${err}`);
  }
  console.log(
    `${COLOR_DIM}  (checked ${nComplete} matrix combos, ${nRamp} ramp sequences, ${nDark} dark overrides)${COLOR_RESET}`
  );
  return 1;
}

process.exit(main());
