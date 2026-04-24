#!/usr/bin/env node
/**
 * Scan packages/**\/src/*.spec.ts files and generate a manifest of which
 * components/patterns have unit tests, how many, and where the spec lives.
 *
 * Output: packages/core/stories/_test-coverage.json
 *   {
 *     generatedAt: '…ISO…',
 *     totalSpecs: N,
 *     totalTests: M,
 *     items: [
 *       { layer: 'components', name: 'button', title: 'Components/Button',
 *         specFile: 'packages/components/button/src/button.spec.ts',
 *         tests: 9, storybookId: 'components-button--docs' },
 *       …
 *     ],
 *     missing: [ { layer, name, title } ],   // packages w/o a spec
 *   }
 *
 * This runs in prebuild-storybook so the MDX page ships fresh numbers.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'packages/core/stories/_test-coverage.json');

function listDirs(base) {
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base)
    .map((d) => ({ name: d, full: path.join(base, d) }))
    .filter((d) => fs.statSync(d.full).isDirectory());
}

function countTests(specPath) {
  const src = fs.readFileSync(specPath, 'utf8');
  // Quick heuristic: count `it(` occurrences. Good enough for a coverage
  // dashboard; edge cases (it.skip / it.each loops) are rare here.
  return (src.match(/\bit\(/g) || []).length;
}

function readTitle(srcDir, name) {
  // Look at the story file — title is what Storybook uses for its URL.
  const storyDir = path.join(srcDir, 'stories');
  if (!fs.existsSync(storyDir)) return null;
  for (const f of fs.readdirSync(storyDir)) {
    if (!f.endsWith('.stories.ts')) continue;
    const src = fs.readFileSync(path.join(storyDir, f), 'utf8');
    const m = src.match(/title:\s*['"]([^'"]+)['"]/);
    if (m) return m[1];
  }
  return null;
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

const items = [];
const missing = [];

for (const layer of ['components', 'patterns']) {
  for (const pkg of listDirs(path.join(ROOT, 'packages', layer))) {
    const srcDir = path.join(pkg.full, 'src');
    const specs = findSpecFiles(srcDir);
    const title = readTitle(pkg.full, pkg.name);
    const storybookId = title
      ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '--docs'
      : null;

    if (specs.length === 0) {
      missing.push({ layer, name: pkg.name, title });
      continue;
    }
    const tests = specs.reduce((sum, s) => sum + countTests(s), 0);
    items.push({
      layer,
      name: pkg.name,
      title,
      storybookId,
      specFile: path.relative(ROOT, specs[0]),
      specFiles: specs.map((s) => path.relative(ROOT, s)),
      tests,
    });
  }
}

items.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name));
missing.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name));

const manifest = {
  generatedAt: new Date().toISOString(),
  totalSpecs: items.length,
  totalTests: items.reduce((s, i) => s + i.tests, 0),
  totalPackages: items.length + missing.length,
  items,
  missing,
};

fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
console.log(`test coverage: ${manifest.totalSpecs}/${manifest.totalPackages} packages have specs, ${manifest.totalTests} tests total → ${path.relative(ROOT, OUT)}`);
