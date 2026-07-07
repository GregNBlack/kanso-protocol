#!/usr/bin/env node
/**
 * generate-brand-theme — recolor Kanso's accent ramp to your brand hue.
 *
 * Kanso's semantic color layer aliases the `blue` primitive ramp (the
 * accent / primary), and the generated CSS keeps the `var()` chain
 * (`outputReferences: true`). So redefining the 11 `--kp-color-blue-*`
 * stops at runtime cascades to all 114 brand-derived semantic tokens —
 * every component recolors with no rebuild.
 *
 * This emits that override block from a single brand hex. It keeps each
 * stop's lightness + saturation from the reference ramp and swaps only
 * the hue.
 *
 * By default it recolors ONLY the accent (blue) ramp. Two opt-in flags
 * extend it to the rest of the palette, using the same keep-L/S hue-swap +
 * per-hue WCAG measurement:
 *   --neutral "#hex"    recolor the gray ramp (the reference gray carries a
 *                       small saturation, so this yields a warm / cool tinted
 *                       neutral). Checks the text stops (500/600/700 on white).
 *   --status name:#hex  recolor status ramps — success→green, danger→red,
 *                       warning→amber, info→cyan (comma-separated, any subset).
 *                       Checks 600/700 on white + 400 on the dark surface.
 * The positional accent hex is required UNLESS --neutral or --status is given.
 *

 * CONTRAST IS NOT PRESERVED BY CONSTRUCTION. The reference ramp's
 * lightness ladder is a11y-tuned *for blue*: at a fixed S/L, luminance
 * varies with hue, so a stop that clears WCAG AA on white at blue's hue
 * can fail at yours (a yellow or cyan accent is far lighter than blue at
 * the same L). This tool therefore MEASURES contrast for the stops that
 * act as foregrounds and reports the result per stop on STDERR. Pass
 * `--enforce-aa` to nudge failing foreground stops' lightness until they
 * clear AA (hue + saturation unchanged); otherwise the lightness is kept
 * exactly and the failures are reported as warnings only.
 *
 * Usage:
 *   node scripts/generate-brand-theme.js "#7C3AED"            # print CSS + report
 *   node scripts/generate-brand-theme.js "#7C3AED" --selector ".brand-acme"
 *   node scripts/generate-brand-theme.js "#EAB308" --enforce-aa   # nudge fails
 *   node scripts/generate-brand-theme.js "#7C3AED" --neutral "#78716C"  # + warm neutrals
 *   node scripts/generate-brand-theme.js "#7C3AED" --status success:#0D9488,danger:#E11D48
 *   node scripts/generate-brand-theme.js "#7C3AED" > brand.css   # report on stderr
 *
 * Then load brand.css after @kanso-protocol/ui/styles/tokens.css.
 *
 * Exit codes:
 *   0 — CSS emitted (foreground failures are reported but non-fatal)
 *   1 — bad usage / invalid hex
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const COLOR_OK = '\x1b[32m';
const COLOR_ERR = '\x1b[31m';
const COLOR_DIM = '\x1b[2m';
const COLOR_RESET = '\x1b[0m';

// WCAG 2.x AA threshold for normal-size text.
const AA_NORMAL = 4.5;

// ─── color math (dependency-free) ───────────────────────────────────────

function hexToRgb(hex) {
  const h = hex.replace('#', '').trim();
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-fA-F]{6}$/.test(v)) throw new Error(`invalid hex: ${hex}`);
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h /= 360;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)].map((v) =>
    Math.round(v * 255),
  );
}

const rgbToHex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');

// ─── WCAG contrast (dependency-free) ─────────────────────────────────────
// Per WCAG 2.x: linearize each sRGB channel, weight 0.2126/0.7152/0.0722,
// then contrast = (Llight + 0.05) / (Ldark + 0.05).

function relLuminance([r, g, b]) {
  const lin = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrastRatio(rgbA, rgbB) {
  const la = relLuminance(rgbA);
  const lb = relLuminance(rgbB);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

// Contrast of an HSL foreground (as it will actually be emitted, i.e. after
// integer rounding to a hex) against a background rgb.
function contrastOfHsl(h, s, l, bgRgb) {
  return contrastRatio(hslToRgb(h, s, l), bgRgb);
}

// ─── reference ramp (the lightness/saturation ladder, per primitive ramp) ──
// Reads one primitive ramp from tokens/primitive/color.json and returns each
// stop as [h, s, l]. `blue` is the accent/primary ramp; `gray` is the neutral
// ramp; `red`/`green`/`amber`/`cyan` are the status ramps. Each has its own
// a11y-tuned lightness ladder, so we keep that ladder and swap only the hue.
function referenceRamp(name) {
  const color = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'tokens/primitive/color.json'), 'utf8'),
  ).color;
  const ramp = color[name];
  if (!ramp) throw new Error(`no primitive ramp "${name}" in tokens/primitive/color.json`);
  const stops = {};
  for (const [stop, def] of Object.entries(ramp)) {
    if (def && def.$value) stops[stop] = rgbToHsl(hexToRgb(def.$value));
  }
  return stops; // { '50': [h,s,l], … }
}

// ─── foreground contrast targets ─────────────────────────────────────────
// The stops that are consumed as *foreground* (text / icon / accent glyph),
// with the surface they land on. These are the only roles WCAG cares about
// here; bg-only stops aren't checked.
const WHITE = '#FFFFFF';
const DARK_SURFACE = '#18181B'; // Kanso dark-mode body background

// Accent / primary (blue) — unchanged from the original tool:
//   • 600 / 700 — primary.fg, badge/alert/segmented fg on white (light mode)
//   • 400       — accent glyph / link / ring on the dark body surface
const ACCENT_FG_TARGETS = [
  { stop: '600', bg: WHITE, label: 'stop 600 vs white' },
  { stop: '700', bg: WHITE, label: 'stop 700 vs white' },
  { stop: '400', bg: DARK_SURFACE, label: 'stop 400 (accent) vs dark #18181B' },
];
// Status ramps (red/green/amber/cyan) share the accent's foreground roles —
// .600/.700 as text/icon on white, .400 as the dark-mode accent fg.
const STATUS_FG_TARGETS = [
  { stop: '600', bg: WHITE, label: 'stop 600 vs white' },
  { stop: '700', bg: WHITE, label: 'stop 700 vs white' },
  { stop: '400', bg: DARK_SURFACE, label: 'stop 400 vs dark #18181B' },
];
// Neutral (gray) — consumed as body / secondary / muted text on white
// (text.default 700, secondary 600, muted+disabled 500). The reference gray
// carries a small (non-zero) saturation, so a hue swap yields a tinted
// neutral (warm / cool gray) while these stops keep ~their luminance.
const NEUTRAL_FG_TARGETS = [
  { stop: '500', bg: WHITE, label: 'stop 500 (muted) vs white' },
  { stop: '600', bg: WHITE, label: 'stop 600 vs white' },
  { stop: '700', bg: WHITE, label: 'stop 700 (text) vs white' },
];

// Nudge a foreground stop's lightness (hue + saturation fixed) toward the
// background's opposite end until it clears the AA threshold. On a light bg
// we darken; on a dark bg we lighten. Returns the adjusted L, the achieved
// contrast, and whether an adjustment was made.
function nudgeForAA(h, s, l, bgRgb, threshold) {
  let contrast = contrastOfHsl(h, s, l, bgRgb);
  if (contrast >= threshold) return { l, contrast, adjusted: false };
  const darken = relLuminance(bgRgb) > 0.5; // light bg → make fg darker
  const STEP = 0.005;
  let newL = l;
  for (let i = 0; i < 200; i++) {
    newL += darken ? -STEP : STEP;
    if (newL <= 0) { newL = 0; break; }
    if (newL >= 1) { newL = 1; break; }
    contrast = contrastOfHsl(h, s, newL, bgRgb);
    if (contrast >= threshold) break;
  }
  return { l: newL, contrast, adjusted: true };
}

// ─── recolor one ramp ──────────────────────────────────────────────────────
// Keep each reference stop's saturation + lightness, swap only the hue, then
// measure the foreground targets (optionally nudging L for AA). Prints the
// per-stop report to stderr and returns the swapped stops + adjustment notes
// + fail flag. `prefixNotes` tags adjustment notes with the ramp name — only
// set when >1 ramp is recolored, so the single-accent default stays unchanged.
function recolorRamp({ role, rampName, hex, fgTargets, enforceAA, prefixNotes }) {
  const [hue] = rgbToHsl(hexToRgb(hex));
  const ref = referenceRamp(rampName);

  // swapped[stop] = { h, s, l } (mutable L so --enforce-aa can adjust it).
  const swapped = {};
  for (const [stop, [, s, l]] of Object.entries(ref)) {
    swapped[stop] = { h: hue, s, l };
  }

  const adjustments = []; // human-readable notes for the CSS comment
  let anyFail = false;

  console.error(
    `${COLOR_DIM}contrast report — ${role} ${hex.toUpperCase()} (hue ${Math.round(hue)}°), AA needs ${AA_NORMAL}:1${COLOR_RESET}`,
  );

  for (const t of fgTargets) {
    const c = swapped[t.stop];
    if (!c) continue;
    const bgRgb = hexToRgb(t.bg);
    const before = contrastOfHsl(c.h, c.s, c.l, bgRgb);
    const passBefore = before >= AA_NORMAL;

    if (!enforceAA) {
      if (!passBefore) anyFail = true;
      const tag = passBefore ? `${COLOR_OK}PASS${COLOR_RESET}` : `${COLOR_ERR}FAIL${COLOR_RESET}`;
      console.error(`  ${t.label}: ${before.toFixed(2)}:1 (AA <needs ${AA_NORMAL}>: ${tag})`);
      continue;
    }

    // --enforce-aa: nudge L until it clears AA, then report the outcome.
    const res = nudgeForAA(c.h, c.s, c.l, bgRgb, AA_NORMAL);
    if (res.adjusted) {
      c.l = res.l; // mutate the emitted stop
      const prefix = prefixNotes ? `${rampName} ` : '';
      const note = `${prefix}stop ${t.stop}: L nudged for AA on ${t.bg} (${before.toFixed(2)}:1 → ${res.contrast.toFixed(2)}:1)`;
      adjustments.push(note);
      const pass = res.contrast >= AA_NORMAL;
      if (!pass) anyFail = true; // couldn't reach threshold (clamped at 0/1)
      const tag = pass ? `${COLOR_OK}PASS${COLOR_RESET}` : `${COLOR_ERR}FAIL${COLOR_RESET}`;
      console.error(
        `  ${t.label}: ${before.toFixed(2)}:1 → ${res.contrast.toFixed(2)}:1 after nudge (AA <needs ${AA_NORMAL}>: ${tag})`,
      );
    } else {
      const tag = `${COLOR_OK}PASS${COLOR_RESET}`;
      console.error(`  ${t.label}: ${before.toFixed(2)}:1 (AA <needs ${AA_NORMAL}>: ${tag})`);
    }
  }

  return { role, rampName, swapped, adjustments, anyFail };
}

// ─── main ────────────────────────────────────────────────────────────────

// success/danger/warning/info map to the status primitive ramps.
const STATUS_RAMPS = { success: 'green', danger: 'red', warning: 'amber', info: 'cyan' };

function usage(msg) {
  if (msg) console.error(`${COLOR_ERR}${msg}${COLOR_RESET}`);
  console.error(
    'usage: node scripts/generate-brand-theme.js "#RRGGBB" [--selector ".sel"] [--enforce-aa]\n' +
      '                                     [--neutral "#RRGGBB"]\n' +
      '                                     [--status success:#hex,danger:#hex,warning:#hex,info:#hex]\n' +
      '\n' +
      '  "#RRGGBB"  accent / primary hue — recolors the blue ramp (optional only when --neutral or --status is given)\n' +
      '  --neutral  recolor the gray ramp (hue-swap, keeping each stop\'s L + S — yields a warm/cool tinted neutral)\n' +
      '  --status   recolor one or more status ramps (success→green, danger→red, warning→amber, info→cyan)\n' +
      '  --enforce-aa  nudge failing foreground stops\' lightness until they clear AA (applies to every recolored ramp)',
  );
}

// ─── args ──────────────────────────────────────────────────────────────────
const rawArgs = process.argv.slice(2);
const consumed = new Set(); // indices claimed by value-carrying flags
function flagValue(name) {
  const i = rawArgs.indexOf(`--${name}`);
  if (i === -1) return undefined;
  consumed.add(i);
  consumed.add(i + 1);
  return rawArgs[i + 1];
}
const selector = flagValue('selector') ?? ':root';
const neutralHex = flagValue('neutral');
const statusSpec = flagValue('status');
const ENFORCE_AA = rawArgs.includes('--enforce-aa');
// Positional accent hex = first arg that is neither a flag nor a flag value.
let accentHex;
for (let i = 0; i < rawArgs.length; i++) {
  if (consumed.has(i) || rawArgs[i].startsWith('--')) continue;
  accentHex = rawArgs[i];
  break;
}

if (!accentHex && neutralHex === undefined && statusSpec === undefined) {
  usage();
  process.exit(1);
}

// Parse --status "name:#hex,name:#hex" into [{ role, rampName, hex }].
const statusEntries = [];
if (statusSpec !== undefined) {
  for (const part of statusSpec.split(',').map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^([a-zA-Z]+)\s*:\s*(#?[0-9a-fA-F]{3}|#?[0-9a-fA-F]{6})$/);
    if (!m) {
      usage(`bad --status entry "${part}" — expected name:#hex (e.g. success:#16A34A)`);
      process.exit(1);
    }
    const name = m[1].toLowerCase();
    const rampName = STATUS_RAMPS[name];
    if (!rampName) {
      usage(`unknown status "${name}" — use one of: ${Object.keys(STATUS_RAMPS).join(', ')}`);
      process.exit(1);
    }
    const hex = m[2].startsWith('#') ? m[2] : `#${m[2]}`;
    statusEntries.push({ role: `status ${name}`, rampName, hex, fgTargets: STATUS_FG_TARGETS });
  }
}

// Validate every hex up front so we fail with a clear message, not a stack.
try {
  if (accentHex) hexToRgb(accentHex);
  if (neutralHex !== undefined) hexToRgb(neutralHex);
  for (const s of statusEntries) hexToRgb(s.hex);
} catch (e) {
  usage(e.message);
  process.exit(1);
}

// Build the recolor list (order: accent, neutral, statuses).
const recolors = [];
if (accentHex) {
  recolors.push({ role: 'accent', rampName: 'blue', hex: accentHex, fgTargets: ACCENT_FG_TARGETS });
}
if (neutralHex !== undefined) {
  recolors.push({ role: 'neutral', rampName: 'gray', hex: neutralHex, fgTargets: NEUTRAL_FG_TARGETS });
}
recolors.push(...statusEntries);

// Tag adjustment notes with the ramp name ONLY when recoloring more than one
// ramp — keeps the single-accent default output byte-for-byte unchanged.
const prefixNotes = recolors.length > 1;

// ─── measure foreground contrast + optionally enforce AA (per ramp) ────────
const results = [];
let anyFail = false;
for (const r of recolors) {
  const res = recolorRamp({ ...r, enforceAA: ENFORCE_AA, prefixNotes });
  results.push(res);
  if (res.anyFail) anyFail = true;
}
const adjustments = results.flatMap((r) => r.adjustments);

if (anyFail && !ENFORCE_AA) {
  console.error(
    `${COLOR_DIM}  → one or more foreground stops fail AA. Re-run with --enforce-aa to auto-nudge lightness, or hand-tune your hue.${COLOR_RESET}`,
  );
}

// ─── emit CSS ────────────────────────────────────────────────────────────
// The accent-only path reproduces the original tool's comment + block
// byte-for-byte; extra clauses / groups appear only with --neutral / --status.
const lines = [];

const clauses = recolors.map((r) => {
  const [hue] = rgbToHsl(hexToRgb(r.hex));
  const deg = `(hue ${Math.round(hue)}°)`;
  if (r.role === 'accent') return `accent recolored to ${r.hex.toUpperCase()} ${deg}`;
  if (r.role === 'neutral') return `neutrals recolored to ${r.hex.toUpperCase()} ${deg}`;
  return `${r.role} ${r.hex.toUpperCase()} ${deg}`;
});
lines.push(`/* Kanso brand theme — ${clauses.join('; ')}.`);
lines.push(` * Generated by scripts/generate-brand-theme.js. Load after @kanso-protocol/ui/styles/tokens.css.`);
lines.push(` * Contrast is MEASURED, not assumed: hue swap at a fixed lightness can break WCAG AA,`);
if (accentHex) {
  lines.push(` * so foreground stops (600/700 on white, 400 on dark) are checked and reported on stderr.`);
} else {
  lines.push(` * so foreground stops are checked per ramp and reported on stderr.`);
}
if (ENFORCE_AA) {
  if (adjustments.length) {
    lines.push(` * --enforce-aa: the following stops had their lightness nudged to clear AA:`);
    for (const a of adjustments) lines.push(` *   - ${a}`);
  } else {
    lines.push(` * --enforce-aa: all foreground stops already cleared AA; no lightness nudged.`);
  }
} else {
  lines.push(` * Lightness kept exactly as the reference ramp — re-run with --enforce-aa or re-verify`);
  lines.push(` * contrast for your hue before shipping. */`);
}
if (ENFORCE_AA) lines.push(` */`);
lines.push(`${selector} {`);
for (const r of results) {
  // Separating comment before each ramp group — multi-ramp only, so the
  // single-accent block is unchanged.
  if (prefixNotes) lines.push(`  /* ${r.role} — ${r.rampName} ramp */`);
  for (const [stop, c] of Object.entries(r.swapped)) {
    const hex = rgbToHex(hslToRgb(c.h, c.s, c.l));
    lines.push(`  --kp-color-${r.rampName}-${stop}: ${hex};`);
  }
}
lines.push(`}`);

process.stdout.write(lines.join('\n') + '\n');
