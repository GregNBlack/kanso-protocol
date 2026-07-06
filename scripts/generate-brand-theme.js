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

// ─── reference ramp (the lightness/saturation ladder, tuned for blue) ────

function referenceRamp() {
  const color = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'tokens/primitive/color.json'), 'utf8'),
  ).color;
  const ramp = color.blue; // the accent / primary ramp
  const stops = {};
  for (const [stop, def] of Object.entries(ramp)) {
    if (def && def.$value) stops[stop] = rgbToHsl(hexToRgb(def.$value));
  }
  return stops; // { '50': [h,s,l], … }
}

// ─── foreground contrast targets ─────────────────────────────────────────
// The stops that are consumed as *foreground* (text / icon / accent glyph),
// with the surface they land on. These are the only roles WCAG cares about
// here; bg-only stops (50–200, 800–950) aren't checked.
//   • 600 / 700 — primary.fg, badge/alert/segmented fg on white (light mode)
//   • 400       — accent glyph / link / ring on the dark body surface
const WHITE = '#FFFFFF';
const DARK_SURFACE = '#18181B'; // Kanso dark-mode body background
const FG_TARGETS = [
  { stop: '600', bg: WHITE, label: 'stop 600 vs white' },
  { stop: '700', bg: WHITE, label: 'stop 700 vs white' },
  { stop: '400', bg: DARK_SURFACE, label: 'stop 400 (accent) vs dark #18181B' },
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

// ─── main ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const brand = args.find((a) => !a.startsWith('--'));
const selIdx = args.indexOf('--selector');
const selector = selIdx !== -1 ? args[selIdx + 1] : ':root';
const ENFORCE_AA = args.includes('--enforce-aa');

if (!brand) {
  console.error(
    'usage: node scripts/generate-brand-theme.js "#RRGGBB" [--selector ".sel"] [--enforce-aa]',
  );
  process.exit(1);
}

const [brandHue] = rgbToHsl(hexToRgb(brand));
const ref = referenceRamp();

// Build the swapped ramp: keep each reference stop's S + L, swap only hue.
// swapped[stop] = { h, s, l } (mutable L so --enforce-aa can adjust it).
const swapped = {};
for (const [stop, [, s, l]] of Object.entries(ref)) {
  swapped[stop] = { h: brandHue, s, l };
}

// ─── measure foreground contrast + optionally enforce AA ─────────────────

const adjustments = []; // human-readable notes for the CSS comment
let anyFail = false;

console.error(
  `${COLOR_DIM}contrast report — accent ${brand.toUpperCase()} (hue ${Math.round(brandHue)}°), AA needs ${AA_NORMAL}:1${COLOR_RESET}`,
);

for (const t of FG_TARGETS) {
  const c = swapped[t.stop];
  if (!c) continue;
  const bgRgb = hexToRgb(t.bg);
  const before = contrastOfHsl(c.h, c.s, c.l, bgRgb);
  const passBefore = before >= AA_NORMAL;

  if (!ENFORCE_AA) {
    if (!passBefore) anyFail = true;
    const tag = passBefore ? `${COLOR_OK}PASS${COLOR_RESET}` : `${COLOR_ERR}FAIL${COLOR_RESET}`;
    console.error(`  ${t.label}: ${before.toFixed(2)}:1 (AA <needs ${AA_NORMAL}>: ${tag})`);
    continue;
  }

  // --enforce-aa: nudge L until it clears AA, then report the outcome.
  const res = nudgeForAA(c.h, c.s, c.l, bgRgb, AA_NORMAL);
  if (res.adjusted) {
    c.l = res.l; // mutate the emitted stop
    const note = `stop ${t.stop}: L nudged for AA on ${t.bg} (${before.toFixed(2)}:1 → ${res.contrast.toFixed(2)}:1)`;
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

if (anyFail && !ENFORCE_AA) {
  console.error(
    `${COLOR_DIM}  → one or more foreground stops fail AA. Re-run with --enforce-aa to auto-nudge lightness, or hand-tune your hue.${COLOR_RESET}`,
  );
}

// ─── emit CSS ────────────────────────────────────────────────────────────

const lines = [];
lines.push(`/* Kanso brand theme — accent recolored to ${brand.toUpperCase()} (hue ${Math.round(brandHue)}°).`);
lines.push(` * Generated by scripts/generate-brand-theme.js. Load after @kanso-protocol/ui/styles/tokens.css.`);
lines.push(` * Contrast is MEASURED, not assumed: hue swap at a fixed lightness can break WCAG AA,`);
lines.push(` * so foreground stops (600/700 on white, 400 on dark) are checked and reported on stderr.`);
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
for (const [stop, c] of Object.entries(swapped)) {
  const hex = rgbToHex(hslToRgb(c.h, c.s, c.l));
  lines.push(`  --kp-color-blue-${stop}: ${hex};`);
}
lines.push(`}`);

process.stdout.write(lines.join('\n') + '\n');
