#!/usr/bin/env node
/**
 * check-changelog — guards that CHANGELOG.md gets updated whenever any
 * @kanso-protocol package version is bumped.
 *
 * Catches the failure mode where a PR bumps `packages/.../package.json`
 * without writing the corresponding migration / release note. Forces the
 * author to think about the bump (patch vs minor — see CONTRIBUTING.md →
 * Versioning policy) at the moment they ship it, not after release.
 *
 * Compares the working tree to a base ref:
 *   - In GitHub Actions PRs: $GITHUB_BASE_REF (e.g. "main")
 *   - Locally: argv[2] or "origin/main"
 *
 * Exits:
 *   0 — no bumps, OR bumps + CHANGELOG.md updated, OR commit body has [skip-release]
 *   1 — at least one bump and CHANGELOG.md is unchanged
 *
 * Usage:
 *   node scripts/check-changelog.js                    # against origin/main
 *   node scripts/check-changelog.js origin/release-0.2 # against a different base
 */

const { execSync } = require('node:child_process');

const baseRef =
  process.argv[2] ||
  (process.env.GITHUB_BASE_REF && `origin/${process.env.GITHUB_BASE_REF}`) ||
  'origin/main';

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'], ...opts }).toString().trim();
}

function shSafe(cmd) {
  try {
    return sh(cmd);
  } catch {
    return null;
  }
}

// Resolve base — required so the rest of the diff queries actually work.
const baseSha = shSafe(`git merge-base ${baseRef} HEAD`);
if (!baseSha) {
  console.error(
    `[check-changelog] Could not find a merge base with "${baseRef}". ` +
      `Make sure the base ref is fetched. In GitHub Actions, use actions/checkout@v4 with fetch-depth: 0.`,
  );
  process.exit(1);
}

// Files changed in this branch since the merge base. We don't care which
// commit a change came from, only whether the working tree differs.
const changedFiles = sh(`git diff --name-only ${baseSha}...HEAD`).split('\n').filter(Boolean);

// Detect any `packages/**/package.json` whose `version` field actually
// differs between base and head. A change to other fields (description,
// keywords, peerDependencies range) is not a release event.
const pkgJsonChanges = changedFiles.filter(
  (f) => f.startsWith('packages/') && f.endsWith('/package.json'),
);

const versionBumps = [];
for (const file of pkgJsonChanges) {
  const before = shSafe(`git show ${baseSha}:${file}`);
  const after = shSafe(`git show HEAD:${file}`);
  if (!after) continue; // file deleted

  const v = (json) => {
    if (!json) return null;
    try {
      return JSON.parse(json).version || null;
    } catch {
      return null;
    }
  };

  const beforeVer = v(before);
  const afterVer = v(after);
  if (beforeVer !== afterVer) {
    versionBumps.push({
      file,
      from: beforeVer ?? '(new package)',
      to: afterVer ?? '(deleted)',
    });
  }
}

if (versionBumps.length === 0) {
  console.log('[check-changelog] No version bumps detected — nothing to enforce.');
  process.exit(0);
}

// At least one package version moved — CHANGELOG.md must be in the diff.
const changelogTouched = changedFiles.includes('CHANGELOG.md');

if (changelogTouched) {
  console.log(
    `[check-changelog] ${versionBumps.length} package${
      versionBumps.length === 1 ? '' : 's'
    } bumped, CHANGELOG.md updated. ✔`,
  );
  process.exit(0);
}

// Fail with an actionable message.
console.error('[check-changelog] FAILURE: package versions bumped without a CHANGELOG.md entry.\n');
console.error('Bumps detected:');
for (const b of versionBumps) {
  console.error(`  • ${b.file}: ${b.from} → ${b.to}`);
}
console.error('\nWhat to do:');
console.error(
  '  1. Add a section to CHANGELOG.md for the new version (mirror the format of recent releases).',
);
console.error(
  '  2. Be explicit about migration steps — even an "_internal change, no migration_" line is a useful signal.',
);
console.error(
  '  3. Re-check the bump type against CONTRIBUTING.md → Versioning policy. Repurposing an existing input is *minor*, not patch.',
);
console.error('\nIf this PR really shouldn\'t require a changelog entry (e.g. revert), include [skip-changelog] in the PR title or any commit message.');

// Honor an explicit override via PR title or commit messages.
const commitMessages = shSafe(`git log ${baseSha}..HEAD --pretty=%B`) || '';
const prTitle = process.env.PR_TITLE || '';
if ([commitMessages, prTitle].some((s) => s.includes('[skip-changelog]'))) {
  console.error('\n[check-changelog] [skip-changelog] override detected — exiting clean.');
  process.exit(0);
}

process.exit(1);
