#!/usr/bin/env node
/**
 * build-react — build the @kanso-protocol/react wrapper distribution.
 *
 * Steps:
 *   1. (re)generate the typed wrappers from packages/ui (kept in sync),
 *   2. tsc-compile src/index.tsx → dist/packages/react/index.js (+ .d.ts, map),
 *   3. stage the publishable package (package.json + README) alongside the
 *      build so publish-libs.js discovers it under dist/packages/**.
 *
 * Pure wrappers, no bundling: the output keeps `import '@kanso-protocol/elements'`
 * and `import 'react'` external (both are peer dependencies of the consumer).
 * Run via `npm run build:react`.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const PKG = path.join(ROOT, 'packages', 'react');
const DEST = path.join(ROOT, 'dist', 'packages', 'react');

const sh = (cmd) => execSync(cmd, { cwd: ROOT, stdio: 'inherit' });

// 1. generate src/index.tsx from the current packages/ui components
sh('node scripts/generate-react-wrappers.js');

// 2. compile → ESM JS + .d.ts into dist/packages/react
sh('npx tsc -p packages/react/tsconfig.build.json');

// 3. stage the publishable package (manifest + README) beside the output
fs.mkdirSync(DEST, { recursive: true });
fs.copyFileSync(path.join(PKG, 'package.json'), path.join(DEST, 'package.json'));
fs.copyFileSync(path.join(PKG, 'README.md'), path.join(DEST, 'README.md'));

const outFile = path.join(DEST, 'index.js');
const kb = (fs.statSync(outFile).size / 1024).toFixed(1);
const { name, version } = JSON.parse(fs.readFileSync(path.join(DEST, 'package.json'), 'utf8'));
console.log(`react wrappers: ${path.relative(ROOT, outFile)} (${kb} KB)`);
console.log(`staged ${name}@${version} → ${path.relative(ROOT, DEST)}`);
