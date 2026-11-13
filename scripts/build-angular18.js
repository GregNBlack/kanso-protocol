const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const workspace = path.join(root, 'tools/angular18');
const stagedPackages = path.join(workspace, 'packages');
const output = path.join(workspace, 'dist/packages/ui');
const releaseOutput = path.join(root, 'dist/packages/ui');

fs.mkdirSync(stagedPackages, { recursive: true });
fs.cpSync(path.join(root, 'packages/ui'), path.join(stagedPackages, 'ui'), { recursive: true });
fs.copyFileSync(path.join(root, 'tsconfig.base.json'), path.join(workspace, 'tsconfig.base.json'));
fs.writeFileSync(path.join(workspace, 'tsconfig.lib.json'), JSON.stringify({
  extends: './tsconfig.base.json',
  angularCompilerOptions: { compilationMode: 'partial' },
}));
execFileSync(process.execPath, [
  require.resolve('ng-packagr/cli/main.js', { paths: [workspace] }),
  '-p', 'packages/ui/ng-package.json', '-c', 'tsconfig.lib.json',
], { cwd: workspace, stdio: 'inherit' });

const manifest = path.join(output, 'package.json');
const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
pkg.exports['./styles/*'] = { default: './styles/*' };
for (const file of ['tokens.css', 'dark.css', 'high-contrast.css', '_tokens.scss', 'scrollbar.css']) {
  pkg.exports[`./styles/${file}`] = { default: `./styles/${file}` };
}
fs.writeFileSync(manifest, JSON.stringify(pkg, null, 2) + '\n');

fs.rmSync(releaseOutput, { recursive: true, force: true });
fs.cpSync(output, releaseOutput, { recursive: true });
