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

// 1. registry + type metadata (custom-elements.json + JSX augmentation)
sh('node scripts/generate-elements-registry.js');
sh('node scripts/generate-elements-types.js');

// 2. AOT lib must exist; build:libs repoints node_modules/@kanso-protocol/ui
//    at dist/packages/ui (fesm2022, AOT) so esbuild resolves to compiled JS.
const distUi = path.join(ROOT, 'dist', 'packages', 'ui', 'fesm2022');
if (!fs.existsSync(distUi)) {
  console.log('dist/packages/ui not found — running build:libs first…');
  sh('npm run build:libs');
}

// 3. bundle — shared esbuild options for both the all-in-one bundle and the
//    granular per-component entries (Angular + components bundled in; nothing
//    external → self-contained, embeds the Angular runtime as expected).
const commonBuild = {
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  sourcemap: true,
  plugins: [kansoResolve, angularLinker],
  legalComments: 'none',
};

// Granular entries derived from the manifest the registry generator wrote —
// never a hand-maintained list. `@kanso-protocol/elements/<subpath>` registers
// only that element; the subpath is the tag minus `kp-` (e.g. `date-picker`).
const manifest = JSON.parse(
  fs.readFileSync(path.join(SRC_PKG, 'src', 'define', 'manifest.json'), 'utf8'),
);
const granularEntryPoints = Object.fromEntries(
  manifest.map((e) => [`define/${e.subpath}`, path.join(SRC_PKG, 'src', 'define', `${e.subpath}.ts`)]),
);

(async () => {
  // 3a. all-in-one bundle — one self-contained file (byte-compatible output).
  await esbuild.build({ ...commonBuild, entryPoints: [path.join(SRC_PKG, 'src', 'main.ts')], outfile: OUT });

  // 3b. granular bundle — code-split so the Angular runtime lands in a shared
  //     chunks/ dir and each define/<subpath>.mjs pulls in only its component.
  await esbuild.build({
    ...commonBuild,
    entryPoints: granularEntryPoints,
    outdir: DEST,
    outExtension: { '.js': '.mjs' },
    splitting: true,
    chunkNames: 'chunks/[name]-[hash]',
  });

  // 4. Stage the publishable package: README, the Custom Elements Manifest,
  //    the type declarations, and a package.json whose exports/files/sideEffects
  //    list every granular entry alongside the all-in-one bundle.
  fs.copyFileSync(path.join(SRC_PKG, 'README.md'), path.join(DEST, 'README.md'));
  fs.copyFileSync(path.join(SRC_PKG, 'custom-elements.json'), path.join(DEST, 'custom-elements.json'));

  const jsxAug = fs.readFileSync(path.join(SRC_PKG, 'src', 'jsx.generated.d.ts'), 'utf8');
  fs.writeFileSync(
    path.join(DEST, 'kanso-elements.d.ts'),
    '/** Define every Kanso `kp-*` custom element. Idempotent. */\n' +
      'export declare function defineKansoElements(): Promise<void>;\n\n' +
      jsxAug,
  );

  // Per-entry .d.ts: the define function + a reference that pulls the root
  // package's JSX augmentation so `<kp-*>` still type-checks in TSX.
  for (const e of manifest) {
    fs.writeFileSync(
      path.join(DEST, 'define', `${e.subpath}.d.ts`),
      '/// <reference types="@kanso-protocol/elements" />\n' +
        `/** Register just the \`<${e.tag}>\` custom element. Idempotent. */\n` +
        `export declare function ${e.fn}(): Promise<void>;\n`,
    );
  }

  // Augment the manifest's exports/files/sideEffects with the granular entries.
  const pkg = JSON.parse(fs.readFileSync(path.join(SRC_PKG, 'package.json'), 'utf8'));
  for (const e of manifest) {
    pkg.exports[`./${e.subpath}`] = {
      types: `./define/${e.subpath}.d.ts`,
      default: `./define/${e.subpath}.mjs`,
    };
  }
  for (const dir of ['define', 'chunks']) if (!pkg.files.includes(dir)) pkg.files.push(dir);
  // Each granular entry auto-registers its element on import → side-effectful.
  // The shared chunks/ are pure and intentionally omitted so bundlers dedupe them.
  pkg.sideEffects = ['./kanso-elements.mjs', './define/*.mjs'];
  fs.writeFileSync(path.join(DEST, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`elements bundle: ${path.relative(ROOT, OUT)} (${kb} KB minified)`);
  console.log(`granular entries: ${manifest.length} → ${path.relative(ROOT, path.join(DEST, 'define'))}/*.mjs`);
  console.log(`staged ${pkg.name}@${pkg.version} → ${path.relative(ROOT, DEST)}`);
})().catch((err) => {
  console.error('elements bundle failed:', err.message);
  process.exit(1);
});
