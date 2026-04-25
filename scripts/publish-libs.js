#!/usr/bin/env node
/**
 * Publish every built library in `dist/packages/**` whose version is not yet
 * on the npm registry. Assumes `npm run build:libs` has already produced
 * fresh artifacts and that package.json `version` fields match what
 * changesets wrote during `changeset version`.
 *
 * The built dist package.json already includes everything npm needs (name,
 * version, exports, module, typings, peerDeps). The source package.json is
 * what changesets bumps; the build copies that version across.
 *
 * Skips any package whose <name>@<version> is already on the registry.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist', 'packages');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (!entry.isDirectory()) continue;
    const pkgJson = path.join(full, 'package.json');
    if (fs.existsSync(pkgJson)) out.push(full);
    else out.push(...walk(full));
  }
  return out;
}

function alreadyPublished(name, version) {
  try {
    execSync(`npm view ${name}@${version} version`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Skip gracefully when no auth is configured — CI stays green, user can
// set NPM_TOKEN later and re-run. Without this, `npm publish` errors with
// E401 on the first package.
if (!process.env.NPM_TOKEN && !process.env.NODE_AUTH_TOKEN) {
  console.log('::notice::NPM_TOKEN not set — skipping publish (this is fine until the secret is configured).');
  process.exit(0);
}

const pkgs = walk(DIST);
if (!pkgs.length) {
  console.error('No built packages found under dist/packages.');
  console.error('Did you run `npm run build:libs`?');
  process.exit(1);
}

const published = [];
const skipped = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Per npm support guidance for the initial-release rate-limit incident
// (ticket Apr 2026): no retry loops — they keep extending the cooldown
// instead of clearing it. Pace publishes 8s apart and fail-fast on 429.
// `npm view` at the top of each iteration skips already-published packages,
// so a follow-up run after a wall-clock cooldown picks up where we left off.
async function publishOnce(pkgDir) {
  try {
    const out = execSync(`npm publish --access public`, { cwd: pkgDir, encoding: 'utf8' });
    process.stdout.write(out);
    return { ok: true };
  } catch (err) {
    if (err.stdout) process.stdout.write(err.stdout);
    if (err.stderr) process.stderr.write(err.stderr);
    const combined = String(err.stdout || '') + String(err.stderr || '');
    const is429 = combined.includes('429') || /rate.?limit/i.test(combined) ||
                  combined.includes('Too Many Requests');
    return { ok: false, is429, err };
  }
}

(async () => {
  let stopped429 = null;
  for (const pkgDir of pkgs) {
    const meta = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
    if (alreadyPublished(meta.name, meta.version)) {
      skipped.push(`${meta.name}@${meta.version}`);
      continue;
    }
    console.log(`\nPublishing ${meta.name}@${meta.version} from ${path.relative(ROOT, pkgDir)}`);
    const res = await publishOnce(pkgDir);
    if (res.ok) {
      published.push(`${meta.name}@${meta.version}`);
      await sleep(8000); // 8s spacing — npm support's "smaller batches with spacing" advice
      continue;
    }
    if (res.is429) {
      stopped429 = `${meta.name}@${meta.version}`;
      console.error(`\n::error::npm 429 hit on ${stopped429}. Stopping (no retry — see ticket).`);
      console.error(`Wait ≥24h of complete silence on the account, then re-run; already-published packages are skipped automatically.`);
      break;
    }
    // Non-429 error — surface it and stop hard.
    throw res.err;
  }

  console.log('\n--- Summary ---');
  console.log(`Published ${published.length}: ${published.join(', ') || '(none)'}`);
  console.log(`Skipped  ${skipped.length}: ${skipped.slice(0, 5).join(', ')}${skipped.length > 5 ? ' …' : ''}`);
  if (stopped429) {
    console.log(`Blocked at ${stopped429} — re-run after wall-clock cooldown to publish the rest.`);
    process.exit(1);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
