#!/usr/bin/env node
/**
 * Orchestrate ng-packagr builds for every library in the monorepo.
 *
 *   1. Scaffold `ng-package.json` + `tsconfig.lib.json` for any package that
 *      lacks them (idempotent).
 *   2. Build in dependency order: core → components → patterns.
 *   3. After each build, repoint the `node_modules/@kanso-protocol/<name>`
 *      symlink at `dist/packages/.../<name>` so downstream packages resolve
 *      the compiled FESM bundle rather than the raw TS source.
 *   4. Copy enhanced metadata (description, homepage, keywords) into the
 *      built `dist/.../package.json` for publishing.
 *
 * Usage:
 *   node scripts/build-libs.js             # build everything
 *   node scripts/build-libs.js --only core # build one package (by folder name)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist', 'packages');

const args = process.argv.slice(2);
const onlyIdx = args.indexOf('--only');
const ONLY = onlyIdx !== -1 ? args[onlyIdx + 1] : null;

const BASE_KEYWORDS = ['design-system', 'angular', 'kanso'];
const REPO_URL = 'https://github.com/GregNBlack/kanso-protocol.git';
const HOMEPAGE_BASE = 'https://gregnblack.github.io/kanso-protocol';
const BUGS_URL = 'https://github.com/GregNBlack/kanso-protocol/issues';

function listDirs(base) {
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base).filter((d) => fs.statSync(path.join(base, d)).isDirectory());
}

function rel(from, to) { return path.relative(from, to); }

function ensureNgPackage(pkgDir, destRel) {
  const ngPath = path.join(pkgDir, 'ng-package.json');
  if (fs.existsSync(ngPath)) return;
  const schemaRel = rel(pkgDir, path.join(ROOT, 'node_modules/ng-packagr/ng-package.schema.json'));
  const json = {
    $schema: schemaRel,
    dest: destRel,
    lib: { entryFile: 'src/index.ts' },
  };
  fs.writeFileSync(ngPath, JSON.stringify(json, null, 2) + '\n');
  console.log(`  scaffolded ${path.relative(ROOT, ngPath)}`);
}

function ensureTsconfig(pkgDir, destRel) {
  const tsPath = path.join(pkgDir, 'tsconfig.lib.json');
  if (fs.existsSync(tsPath)) return;
  const baseRel = rel(pkgDir, path.join(ROOT, 'tsconfig.base.json'));
  const json = {
    extends: baseRel,
    compilerOptions: {
      outDir: destRel,
      declaration: true,
      declarationMap: true,
      inlineSources: true,
      types: [],
    },
    exclude: ['stories/**/*', '**/*.spec.ts'],
  };
  fs.writeFileSync(tsPath, JSON.stringify(json, null, 2) + '\n');
  console.log(`  scaffolded ${path.relative(ROOT, tsPath)}`);
}

function enrichPackageJson(pkgDir, { layer, folderName }) {
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const name = pkg.name;                           // e.g. @kanso-protocol/button
  const short = name.replace('@kanso-protocol/', '');

  const enriched = {
    ...pkg,
    description: pkg.description || `Kanso Protocol — ${short} (${layer}).`,
    license: pkg.license || 'MIT',
    author: pkg.author || 'GregNBlack',
    repository: pkg.repository || {
      type: 'git',
      url: REPO_URL,
      directory: path.relative(ROOT, pkgDir),
    },
    homepage: pkg.homepage || (layer === 'core'
      ? HOMEPAGE_BASE
      : `${HOMEPAGE_BASE}/?path=/docs/${layer}s-${short.replace(/-/g, '')}--docs`),
    bugs: pkg.bugs || BUGS_URL,
    keywords: pkg.keywords || [...BASE_KEYWORDS, short],
    sideEffects: pkg.sideEffects !== undefined ? pkg.sideEffects : false,
  };

  // Drop legacy ngPackage config — ng-package.json is the source of truth now.
  delete enriched.ngPackage;

  fs.writeFileSync(pkgJsonPath, JSON.stringify(enriched, null, 2) + '\n');
}

function buildOne(pkgDir) {
  const ngCfg = path.relative(ROOT, path.join(pkgDir, 'ng-package.json'));
  console.log(`→ building ${ngCfg}`);
  execSync(`npx ng-packagr -p ${ngCfg}`, { stdio: 'inherit', cwd: ROOT });
}

function swapSymlink(name, distAbs) {
  const nmPath = path.join(ROOT, 'node_modules', name);
  try { fs.unlinkSync(nmPath); } catch { /* ignore */ }
  fs.mkdirSync(path.dirname(nmPath), { recursive: true });
  fs.symlinkSync(path.relative(path.dirname(nmPath), distAbs), nmPath);
}

function handlePackage(pkgDir, layer, folderName) {
  const destAbs = path.join(DIST,
    layer === 'core' ? 'core' :
    layer === 'component' ? path.join('components', folderName) :
    path.join('patterns', folderName),
  );
  const destRel = path.relative(pkgDir, destAbs);

  enrichPackageJson(pkgDir, { layer, folderName });
  ensureNgPackage(pkgDir, destRel);
  ensureTsconfig(pkgDir, destRel);
  buildOne(pkgDir);
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
  swapSymlink(pkg.name, destAbs);
}

function matchesOnly(name) {
  return !ONLY || ONLY === name || ONLY === `@kanso-protocol/${name}`;
}

// ---- Topological sort by @kanso-protocol/* imports ----
// Each node = { layer, folder, name, pkgDir }. Edges: depends → dependent.
function discoverPackages() {
  const out = [];
  const add = (layer, folder) => {
    const pkgDir = path.join(ROOT, 'packages',
      layer === 'component' ? 'components' : layer === 'pattern' ? 'patterns' : '', folder);
    if (layer === 'core') pkgDir = path.join(ROOT, 'packages/core');
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
    out.push({ layer, folder, name: pkg.name, pkgDir });
  };
  out.push({ layer: 'core', folder: 'core', name: '@kanso-protocol/core', pkgDir: path.join(ROOT, 'packages/core') });
  for (const c of listDirs(path.join(ROOT, 'packages/components'))) {
    const pkgDir = path.join(ROOT, 'packages/components', c);
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
    out.push({ layer: 'component', folder: c, name: pkg.name, pkgDir });
  }
  for (const p of listDirs(path.join(ROOT, 'packages/patterns'))) {
    const pkgDir = path.join(ROOT, 'packages/patterns', p);
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
    out.push({ layer: 'pattern', folder: p, name: pkg.name, pkgDir });
  }
  return out;
}

function collectDeps(pkgDir, allNames) {
  const deps = new Set();
  const walk = (dir) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) walk(full);
      else if (f.name.endsWith('.ts')) {
        const src = fs.readFileSync(full, 'utf8');
        for (const m of src.matchAll(/from\s+['"](@kanso-protocol\/[^'"]+)['"]/g)) {
          if (allNames.has(m[1])) deps.add(m[1]);
        }
      }
    }
  };
  if (fs.existsSync(path.join(pkgDir, 'src'))) walk(path.join(pkgDir, 'src'));
  return deps;
}

function topoSort(packages) {
  const byName = new Map(packages.map((p) => [p.name, p]));
  const allNames = new Set(byName.keys());
  const deps = new Map();
  for (const p of packages) {
    const d = collectDeps(p.pkgDir, allNames);
    d.delete(p.name); // no self
    deps.set(p.name, d);
  }
  const sorted = [];
  const visited = new Set();
  const visit = (name, stack = []) => {
    if (visited.has(name)) return;
    if (stack.includes(name)) {
      throw new Error(`Circular dependency: ${stack.join(' → ')} → ${name}`);
    }
    for (const dep of deps.get(name) || []) visit(dep, [...stack, name]);
    visited.add(name);
    sorted.push(byName.get(name));
  };
  for (const p of packages) visit(p.name);
  return sorted;
}

const packages = discoverPackages();
const ordered = topoSort(packages);

for (const p of ordered) {
  if (!matchesOnly(p.folder) && !matchesOnly(p.name)) continue;
  console.log(`\n--- ${p.layer}/${p.folder} ---`);
  handlePackage(p.pkgDir, p.layer, p.folder);
}

console.log('\nDone.');
