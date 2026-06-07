#!/usr/bin/env node
/**
 * build-elements — bundle the Kanso custom-elements distribution.
 *
 * Steps:
 *   1. regenerate the element registry (kept in sync with packages/ui),
 *   2. ensure the AOT-compiled lib + dist symlink exist (esbuild can't run
 *      the Angular compiler, so it must bundle from ng-packagr's fesm2022),
 *   3. esbuild-bundle packages/elements/src/main.ts → dist/elements/.
 *
 * Output: dist/elements/kanso-elements.mjs (+ .map). Consumers load it as a
 * module script or import it; see docs/web-components.md.
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const babel = require('@babel/core');
const { createEs2015LinkerPlugin } = require('@angular/compiler-cli/linker/babel');

const ROOT = path.resolve(__dirname, '..');
// Stage under dist/packages/** so publish-libs.js discovers + publishes it.
const SRC_PKG = path.join(ROOT, 'packages', 'elements');
const DEST = path.join(ROOT, 'dist', 'packages', 'elements');
const OUT = path.join(DEST, 'kanso-elements.mjs');

// Angular ships its framework packages in *partial* compilation format
// (ɵɵngDeclare*). esbuild doesn't run the Angular linker, so those fail JIT
// at runtime without @angular/compiler. This esbuild plugin runs the linker
// (via Babel) over partial-compiled modules → full AOT, no compiler needed.
const linkerPlugin = createEs2015LinkerPlugin({
  linkerJitMode: false,
  fileSystem: {
    resolve: path.resolve,
    exists: fs.existsSync,
    dirname: path.dirname,
    relative: path.relative,
    readFile: fs.readFileSync,
  },
  logger: { level: 1, debug() {}, info() {}, warn() {}, error() {} },
});

// Pin @kanso-protocol/ui[/sub] to the AOT dist fesm2022, independent of the
// node_modules symlink (npm workspaces point it at SOURCE, which esbuild
// can't compile). Deterministic fesm naming: kanso-protocol-ui[-<sub>].mjs.
const kansoResolve = {
  name: 'kanso-dist-resolve',
  setup(build) {
    build.onResolve({ filter: /^@kanso-protocol\/ui(\/.*)?$/ }, (args) => {
      const sub = args.path.replace(/^@kanso-protocol\/ui\/?/, '');
      const file = sub ? `kanso-protocol-ui-${sub.replace(/\//g, '-')}.mjs` : 'kanso-protocol-ui.mjs';
      return { path: path.join(ROOT, 'dist', 'packages', 'ui', 'fesm2022', file) };
    });
  },
};

const angularLinker = {
  name: 'angular-linker',
  setup(build) {
    build.onLoad({ filter: /\.m?js$/ }, async (args) => {
      const code = await fs.promises.readFile(args.path, 'utf8');
      if (!code.includes('ɵɵngDeclare')) return null; // skip non-partial files (fast)
      const result = await babel.transformAsync(code, {
        filename: args.path,
        plugins: [linkerPlugin],
        compact: false,
        sourceMaps: false,
        configFile: false,
        babelrc: false,
      });
      return { contents: result.code ?? code, loader: 'js' };
    });
  },
};

function sh(cmd) {
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

// 1. registry
sh('node scripts/generate-elements-registry.js');

// 2. AOT lib must exist; build:libs repoints node_modules/@kanso-protocol/ui
//    at dist/packages/ui (fesm2022, AOT) so esbuild resolves to compiled JS.
const distUi = path.join(ROOT, 'dist', 'packages', 'ui', 'fesm2022');
if (!fs.existsSync(distUi)) {
  console.log('dist/packages/ui not found — running build:libs first…');
  sh('npm run build:libs');
}

// 3. bundle
esbuild
  .build({
    entryPoints: [path.join(ROOT, 'packages', 'elements', 'src', 'main.ts')],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    sourcemap: true,
    outfile: OUT,
    plugins: [kansoResolve, angularLinker],
    // Angular + components are bundled in; nothing external. Consumers get a
    // self-contained file (includes the Angular runtime — expected for a
    // framework-agnostic distribution).
    legalComments: 'none',
  })
  .then(() => {
    // Stage the publishable package alongside the bundle: manifest, README,
    // and a minimal type declaration (the bundle's only export).
    fs.copyFileSync(path.join(SRC_PKG, 'package.json'), path.join(DEST, 'package.json'));
    fs.copyFileSync(path.join(SRC_PKG, 'README.md'), path.join(DEST, 'README.md'));
    fs.writeFileSync(
      path.join(DEST, 'kanso-elements.d.ts'),
      '/** Define every Kanso `kp-*` custom element. Idempotent. */\n' +
        'export declare function defineKansoElements(): Promise<void>;\n',
    );
    const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
    const { name, version } = JSON.parse(fs.readFileSync(path.join(DEST, 'package.json'), 'utf8'));
    console.log(`elements bundle: ${path.relative(ROOT, OUT)} (${kb} KB minified)`);
    console.log(`staged ${name}@${version} → ${path.relative(ROOT, DEST)}`);
  })
  .catch((err) => {
    console.error('elements bundle failed:', err.message);
    process.exit(1);
  });
